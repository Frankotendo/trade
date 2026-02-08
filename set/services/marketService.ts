
import { Asset, AssetClass, WhaleAlert } from '../types';

// Assets to simulate when in LIVE mode (since we can't get free websockets for them easily)
const SYNTHETIC_ASSETS = [
    // Forex
    { id: 'EURUSD', ticker: 'EUR/USD', type: AssetClass.FOREX, basePrice: 1.0825, vol: 0.0001, tvSymbol: 'FX:EURUSD' },
    { id: 'GBPUSD', ticker: 'GBP/USD', type: AssetClass.FOREX, basePrice: 1.2640, vol: 0.0001, tvSymbol: 'FX:GBPUSD' },
    // Stocks
    { id: 'TSLA', ticker: 'TSLA', type: AssetClass.STOCKS, basePrice: 218.50, vol: 0.50, tvSymbol: 'NASDAQ:TSLA' },
    { id: 'NVDA', ticker: 'NVDA', type: AssetClass.STOCKS, basePrice: 135.40, vol: 1.20, tvSymbol: 'NASDAQ:NVDA' },
    { id: 'AAPL', ticker: 'AAPL', type: AssetClass.STOCKS, basePrice: 192.30, vol: 0.30, tvSymbol: 'NASDAQ:AAPL' },
    // Commodities
    { id: 'XAUUSD', ticker: 'GOLD', type: AssetClass.COMMODITIES, basePrice: 2742.80, vol: 0.80, tvSymbol: 'OANDA:XAUUSD' },
];

export class MarketService {
  private ws: WebSocket | null = null;
  private updateCallback: ((updates: Partial<Asset>[]) => void) | null = null;
  private whaleCallback: ((alert: WhaleAlert) => void) | null = null;
  private activeCryptoSymbols: string[] = [];
  private syntheticInterval: any = null;
  private syntheticState: Record<string, number> = {};

  constructor(
      onUpdate: (updates: Partial<Asset>[]) => void,
      onWhale: (alert: WhaleAlert) => void
  ) {
    this.updateCallback = onUpdate;
    this.whaleCallback = onWhale;
    
    // Initialize synthetic prices
    SYNTHETIC_ASSETS.forEach(a => {
        this.syntheticState[a.id] = a.basePrice;
    });
  }

  connect(cryptoSymbols: string[]) {
    this.disconnect(); // Clear existing
    
    // 1. Connect Binance (Crypto)
    // Filter only those that look like Binance symbols (ending in USDT)
    this.activeCryptoSymbols = cryptoSymbols.filter(s => s.endsWith('USDT')).map(s => s.toLowerCase());
    if (this.activeCryptoSymbols.length > 0) {
      const streams = this.activeCryptoSymbols.map(s => `${s}@ticker`).join('/');
      const url = `wss://stream.binance.com:9443/ws/${streams}`;

      console.log(`[MarketService] Connecting Crypto Stream: ${url}`);
      
      this.ws = new WebSocket(url);

      this.ws.onopen = () => console.log('[MarketService] Crypto Stream Connected');

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.e === '24hrTicker') {
              this.handleBinanceTicker(data);
          }
        } catch (e) {
          console.error('WS Parse Error', e);
        }
      };
    }

    // 2. Start Synthetic Stream (Forex/Stocks/Commodities)
    this.syntheticInterval = setInterval(() => {
        this.generateSyntheticTicks();
    }, 1000); // Update every second
  }

  private handleBinanceTicker(data: any) {
      const price = parseFloat(data.c);
      const change = parseFloat(data.P);
      const symbol = data.s;

      const update: Partial<Asset> & { id: string } = {
          id: symbol,
          price: price,
          change24h: change,
          trend: change > 0 ? 'Bullish' : change < 0 ? 'Bearish' : 'Neutral',
          indicators: [
              Math.abs(change) > 5 ? 'High Volatility' : 'Stable',
              price > parseFloat(data.h) * 0.98 ? 'Near Highs' : 'Retracing'
          ]
      };

      if (this.updateCallback) this.updateCallback([update]);

      // Random whale alerts for immersive feel
      if (Math.random() > 0.995) { 
          const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const size = Math.floor(Math.random() * 500000) + 50000; 
          
          if (this.whaleCallback) {
              this.whaleCallback({
                  id: Date.now().toString(),
                  symbol: symbol,
                  side,
                  size,
                  timestamp: Date.now()
              });
          }
      }
  }

  private generateSyntheticTicks() {
      const updates: Partial<Asset>[] = [];

      SYNTHETIC_ASSETS.forEach(asset => {
          const shock = (Math.random() - 0.5) * asset.vol;
          let currentPrice = this.syntheticState[asset.id];
          currentPrice = currentPrice * (1 + shock);
          this.syntheticState[asset.id] = currentPrice;

          const change = ((currentPrice - asset.basePrice) / asset.basePrice) * 100;

          updates.push({
              id: asset.id,
              price: currentPrice,
              change24h: parseFloat(change.toFixed(2)),
              trend: change > 0 ? 'Bullish' : change < 0 ? 'Bearish' : 'Neutral',
              indicators: ['Synthetic Real-Time']
          });

          if (Math.random() > 0.985) {
              if (this.whaleCallback) {
                this.whaleCallback({
                    id: Date.now().toString(),
                    symbol: asset.ticker,
                    side: Math.random() > 0.5 ? 'BUY' : 'SELL',
                    size: Math.floor(Math.random() * 1000000) + 100000,
                    timestamp: Date.now()
                });
              }
          }
      });

      if (this.updateCallback) this.updateCallback(updates);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.syntheticInterval) {
        clearInterval(this.syntheticInterval);
        this.syntheticInterval = null;
    }
  }
}

export const getLiveAssetList = () => {
    return [
        'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
        ...SYNTHETIC_ASSETS.map(a => a.id) 
    ];
}
