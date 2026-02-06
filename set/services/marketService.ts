
import { Asset, AssetClass, WhaleAlert } from '../types';

// Assets to simulate when in LIVE mode (since we can't get free websockets for them easily)
const SYNTHETIC_ASSETS = [
    { id: 'EURUSD', ticker: 'EUR/USD', type: AssetClass.FOREX, basePrice: 1.0850, vol: 0.0001, tvSymbol: 'FX:EURUSD' },
    { id: 'GBPUSD', ticker: 'GBP/USD', type: AssetClass.FOREX, basePrice: 1.2700, vol: 0.0001, tvSymbol: 'FX:GBPUSD' },
    { id: 'SPY', ticker: 'SPY', type: AssetClass.INDICES, basePrice: 450.00, vol: 0.20, tvSymbol: 'AMEX:SPY' },
    { id: 'TSLA', ticker: 'TSLA', type: AssetClass.STOCKS, basePrice: 210.00, vol: 0.50, tvSymbol: 'NASDAQ:TSLA' },
    { id: 'NVDA', ticker: 'NVDA', type: AssetClass.STOCKS, basePrice: 850.00, vol: 1.20, tvSymbol: 'NASDAQ:NVDA' },
    { id: 'XAUUSD', ticker: 'GOLD', type: AssetClass.COMMODITIES, basePrice: 2030.00, vol: 0.80, tvSymbol: 'OANDA:XAUUSD' },
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
    this.activeCryptoSymbols = cryptoSymbols.map(s => s.toLowerCase());
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

    // 2. Start Synthetic Stream (Forex/Stocks)
    this.syntheticInterval = setInterval(() => {
        this.generateSyntheticTicks();
    }, 1000); // Update every second
  }

  private handleBinanceTicker(data: any) {
      const price = parseFloat(data.c);
      const change = parseFloat(data.P);
      const volumeQuote = parseFloat(data.q); // Volume in USDT
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

      // Whale Detection Logic
      // If volume traded in this 24h window is massive, we simulate a "tick" whale for effect
      // In a real aggregated trade stream, we would check individual trade size. 
      // Here we simulate a whale alert if the price moves drastically in a single update frame (simulated logic)
      if (Math.random() > 0.99) { // 1% chance per tick to flag a "whale" for demo purposes
          const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const size = Math.floor(Math.random() * 500000) + 50000; // $50k - $500k
          
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
          // Random Walk / Brownian Motion
          const drift = 0;
          const shock = (Math.random() - 0.5) * asset.vol;
          let currentPrice = this.syntheticState[asset.id];
          
          // Apply movement
          currentPrice = currentPrice * (1 + shock);
          this.syntheticState[asset.id] = currentPrice;

          // Calculate fake 24h change (drifting from base)
          const change = ((currentPrice - asset.basePrice) / asset.basePrice) * 100;

          updates.push({
              id: asset.id,
              price: currentPrice,
              change24h: parseFloat(change.toFixed(2)),
              trend: change > 0 ? 'Bullish' : change < 0 ? 'Bearish' : 'Neutral',
              indicators: ['Synthetic Live Feed']
          });

          // Synthetic Whale
          if (Math.random() > 0.98) {
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
        'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', // Real Binance
        ...SYNTHETIC_ASSETS.map(a => a.id) // Synthetic
    ];
}

export const createInitialLiveAssets = (): Record<string, Asset> => {
    const assets: Record<string, Asset> = {};
    
    // Binance Placeholders
    ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'].forEach(sym => {
        assets[sym] = {
            id: sym, ticker: sym, name: sym, type: AssetClass.CRYPTO,
            price: 0, change24h: 0, volatility: 'Medium', trend: 'Neutral',
            indicators: ['Waiting for Feed...'], description: 'Binance Live Feed', newsFlash: 'Connecting...',
            tvSymbol: `BINANCE:${sym}`
        };
    });

    // Synthetic Placeholders
    SYNTHETIC_ASSETS.forEach(a => {
        assets[a.id] = {
            id: a.id, ticker: a.ticker, name: a.ticker, type: a.type,
            price: a.basePrice, change24h: 0, volatility: 'Medium', trend: 'Neutral',
            indicators: ['Synthetic Feed'], description: 'Global Market Feed', newsFlash: 'Market Open',
            tvSymbol: a.tvSymbol
        };
    });

    return assets;
}
