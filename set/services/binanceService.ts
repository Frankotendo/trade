
import { Asset, AssetClass } from '../types';

export class BinanceService {
  private ws: WebSocket | null = null;
  private updateCallback: ((updates: Partial<Asset>[]) => void) | null = null;
  private activeSymbols: string[] = [];

  constructor(callback: (updates: Partial<Asset>[]) => void) {
    this.updateCallback = callback;
  }

  connect(symbols: string[]) {
    if (this.ws) {
      this.ws.close();
    }
    
    this.activeSymbols = symbols.map(s => s.toLowerCase());
    const streams = this.activeSymbols.map(s => `${s}@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/ws/${streams}`;

    console.log(`[BinanceService] Connecting to ${url}`);
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[BinanceService] WebSocket Connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Binance Ticker Payload:
        // s: symbol, c: last price, P: price change percent, v: volume (crypto), q: quote volume
        if (data.e === '24hrTicker') {
            const price = parseFloat(data.c);
            const change = parseFloat(data.P);
            
            const update: Partial<Asset> & { id: string } = {
                id: data.s, // using symbol as ID for live assets
                price: price,
                change24h: change,
                trend: change > 0 ? 'Bullish' : change < 0 ? 'Bearish' : 'Neutral',
                // Synthesize some "indicators" based on simple logic for the visualizer
                indicators: [
                   Math.abs(change) > 5 ? 'High Volatility' : 'Stable',
                   price > parseFloat(data.h) * 0.98 ? 'Near Highs' : 'Retracing'
                ]
            };
            
            if (this.updateCallback) {
                this.updateCallback([update]);
            }
        }
      } catch (e) {
        console.error('Binance WS Parse Error', e);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[BinanceService] WebSocket Error', err);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Helper to create initial asset objects for live mode
export const createLiveAsset = (symbol: string): Asset => {
    return {
        id: symbol,
        ticker: symbol,
        name: symbol.replace('USDT', ''),
        type: AssetClass.CRYPTO,
        price: 0,
        change24h: 0,
        volatility: 'Medium',
        trend: 'Neutral',
        indicators: ['Live Data'],
        description: 'Real-time market data from Binance.',
        newsFlash: 'LIVE FEED CONNECTED'
    };
};
