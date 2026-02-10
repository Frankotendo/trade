
import { Asset, AssetClass, WhaleAlert } from '../types';

const SYNTHETIC_ASSETS = [
    { id: 'EURUSD', ticker: 'EUR/USD', type: AssetClass.FOREX, basePrice: 1.0825, vol: 0.0001, tvSymbol: 'FX:EURUSD' },
    { id: 'GBPUSD', ticker: 'GBP/USD', type: AssetClass.FOREX, basePrice: 1.2640, vol: 0.0001, tvSymbol: 'FX:GBPUSD' },
    { id: 'TSLA', ticker: 'TSLA', type: AssetClass.STOCKS, basePrice: 218.50, vol: 0.50, tvSymbol: 'NASDAQ:TSLA' },
    { id: 'NVDA', ticker: 'NVDA', type: AssetClass.STOCKS, basePrice: 135.40, vol: 1.20, tvSymbol: 'NASDAQ:NVDA' },
    { id: 'AAPL', ticker: 'AAPL', type: AssetClass.STOCKS, basePrice: 192.30, vol: 0.30, tvSymbol: 'NASDAQ:AAPL' },
    { id: 'XAUUSD', ticker: 'GOLD', type: AssetClass.COMMODITIES, basePrice: 2742.80, vol: 0.80, tvSymbol: 'OANDA:XAUUSD' },
];

export class MarketService {
  private ws: WebSocket | null = null;
  private updateCallback: ((updates: Partial<Asset>[]) => void) | null = null;
  private whaleCallback: ((alert: WhaleAlert) => void) | null = null;
  private syntheticInterval: any = null;
  private syntheticState: Record<string, { price: number, history: number[] }> = {};

  constructor(
      onUpdate: (updates: Partial<Asset>[]) => void,
      onWhale: (alert: WhaleAlert) => void
  ) {
    this.updateCallback = onUpdate;
    this.whaleCallback = onWhale;
    
    SYNTHETIC_ASSETS.forEach(a => {
        this.syntheticState[a.id] = { price: a.basePrice, history: Array(20).fill(a.basePrice) };
    });
  }

  connect(cryptoSymbols: string[]) {
    this.disconnect();
    
    const binanceSymbols = cryptoSymbols.filter(s => s.endsWith('USDT')).map(s => s.toLowerCase());
    if (binanceSymbols.length > 0) {
      const streams = binanceSymbols.map(s => `${s}@ticker`).join('/');
      this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.e === '24hrTicker') this.handleBinanceTicker(data);
        } catch (e) {}
      };
    }

    this.syntheticInterval = setInterval(() => this.generateSyntheticTicks(), 2000);
  }

  private handleBinanceTicker(data: any) {
      const price = parseFloat(data.c);
      const symbol = data.s;
      
      if (!this.syntheticState[symbol]) this.syntheticState[symbol] = { price, history: Array(20).fill(price) };
      const history = [...this.syntheticState[symbol].history.slice(1), price];
      this.syntheticState[symbol] = { price, history };

      const update: Partial<Asset> & { id: string } = {
          id: symbol,
          price,
          history,
          change24h: parseFloat(data.P),
          trend: parseFloat(data.P) > 0 ? 'Bullish' : 'Bearish'
      };

      if (this.updateCallback) this.updateCallback([update]);
      if (Math.random() > 0.99) this.triggerWhale(symbol, price);
  }

  private triggerWhale(symbol: string, price: number) {
      if (this.whaleCallback) {
          this.whaleCallback({
              id: Date.now().toString(),
              symbol,
              side: Math.random() > 0.5 ? 'BUY' : 'SELL',
              size: Math.floor(Math.random() * 500000) + 100000,
              timestamp: Date.now()
          });
      }
  }

  private generateSyntheticTicks() {
      const updates: Partial<Asset>[] = [];
      SYNTHETIC_ASSETS.forEach(asset => {
          const shock = (Math.random() - 0.5) * asset.vol;
          const { price, history } = this.syntheticState[asset.id];
          const newPrice = price * (1 + shock);
          const newHistory = [...history.slice(1), newPrice];
          this.syntheticState[asset.id] = { price: newPrice, history: newHistory };

          updates.push({
              id: asset.id,
              price: newPrice,
              history: newHistory,
              change24h: parseFloat(((newPrice - asset.basePrice) / asset.basePrice * 100).toFixed(2)),
              trend: newPrice > price ? 'Bullish' : 'Bearish'
          });
      });
      if (this.updateCallback) this.updateCallback(updates);
  }

  disconnect() {
    if (this.ws) this.ws.close();
    if (this.syntheticInterval) clearInterval(this.syntheticInterval);
  }
}

export const getLiveAssetList = () => [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
    ...SYNTHETIC_ASSETS.map(a => a.id) 
];
