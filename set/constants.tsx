
import { Asset, AssetClass } from './types';

export const INITIAL_ASSETS: Asset[] = [
  // --- CRYPTO (BINANCE COMPATIBLE) ---
  {
    id: 'BTCUSDT',
    symbol: 'BTC/USD',
    ticker: 'BTCUSDT',
    name: 'Bitcoin',
    type: AssetClass.CRYPTO,
    price: 94850.00,
    change: 2.4,
    change24h: 2.4,
    difficulty: 'Beginner',
    volatility: 'Medium',
    trend: 'Bullish',
    indicators: ['RSI Oversold', 'Consolidation'],
    description: 'The alpha asset. Use Binance API for live execution. Primary liquidity driver.',
    category: 'Crypto',
    tvSymbol: 'BINANCE:BTCUSDT'
  },
  {
    id: 'ETHUSDT',
    symbol: 'ETH/USD',
    ticker: 'ETHUSDT',
    name: 'Ethereum',
    type: AssetClass.CRYPTO,
    price: 2450.15,
    change: 1.8,
    change24h: 1.8,
    difficulty: 'Beginner',
    volatility: 'Medium',
    trend: 'Bullish',
    indicators: ['Moving Average Cross'],
    description: 'Smart contract giant. High utility, steady accumulation zone.',
    category: 'Crypto',
    tvSymbol: 'BINANCE:ETHUSDT'
  },
  {
    id: 'SOLUSDT',
    symbol: 'SOL/USD',
    ticker: 'SOLUSDT',
    name: 'Solana',
    type: AssetClass.CRYPTO,
    price: 145.60,
    change: 5.2,
    change24h: 5.2,
    difficulty: 'Intermediate',
    volatility: 'High',
    trend: 'Bullish',
    indicators: ['Volume Spike'],
    description: 'High performance L1. Watch for liquidity gaps and congestion.',
    category: 'Crypto',
    tvSymbol: 'BINANCE:SOLUSDT'
  },

  // --- STOCKS (ALPACA/BROKER COMPATIBLE - NOT BINANCE) ---
  {
    id: 'TSLA',
    symbol: 'TSLA',
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    type: AssetClass.STOCKS,
    price: 218.50,
    change: -5.2,
    change24h: -5.2,
    difficulty: 'Intermediate',
    volatility: 'High',
    trend: 'Bearish',
    indicators: ['RSI: 22', 'Oversold'],
    description: 'Hyper-volatile equity. API REQUIRED: NASDAQ/Alpaca (Binance NOT supported).',
    category: 'Stock',
    tvSymbol: 'NASDAQ:TSLA'
  },
  {
    id: 'NVDA',
    symbol: 'NVDA',
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    type: AssetClass.STOCKS,
    price: 135.40,
    change: 3.1,
    change24h: 3.1,
    difficulty: 'Advanced',
    volatility: 'Very High',
    trend: 'Bullish',
    indicators: ['Blue Sky Breakout'],
    description: 'AI hardware leader. High institutional order flow. API: NASDAQ.',
    category: 'Stock',
    tvSymbol: 'NASDAQ:NVDA'
  },
  {
    id: 'AAPL',
    symbol: 'AAPL',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    type: AssetClass.STOCKS,
    price: 192.30,
    change: 0.4,
    change24h: 0.4,
    difficulty: 'Beginner',
    volatility: 'Low',
    trend: 'Neutral',
    indicators: ['Consolidation'],
    description: 'Defensive tech play. Stable for hedging. API: NASDAQ.',
    category: 'Stock',
    tvSymbol: 'NASDAQ:AAPL'
  },

  // --- FOREX (OANDA COMPATIBLE - NOT BINANCE) ---
  {
    id: 'EURUSD',
    symbol: 'EUR/USD',
    ticker: 'EURUSD',
    name: 'Euro / US Dollar',
    type: AssetClass.FOREX,
    price: 1.0825,
    change: 0.1,
    change24h: 0.1,
    difficulty: 'Advanced',
    volatility: 'Low',
    trend: 'Neutral',
    indicators: ['Liquidity Sweep'],
    description: 'World reserve pair. API REQUIRED: OANDA v20 (Binance NOT supported).',
    category: 'Forex',
    tvSymbol: 'FX:EURUSD'
  },
  {
    id: 'GBPUSD',
    symbol: 'GBP/USD',
    ticker: 'GBPUSD',
    name: 'Pound / US Dollar',
    type: AssetClass.FOREX,
    price: 1.2640,
    change: -0.25,
    change24h: -0.25,
    difficulty: 'Intermediate',
    volatility: 'Medium',
    trend: 'Bearish',
    indicators: ['Resistance Reject'],
    description: 'Cable volatility. Sensitive to BoE policy. API: OANDA.',
    category: 'Forex',
    tvSymbol: 'FX:GBPUSD'
  },

  // --- COMMODITIES ---
  {
    id: 'XAUUSD',
    symbol: 'GOLD',
    ticker: 'XAUUSD',
    name: 'Gold / US Dollar',
    type: AssetClass.COMMODITIES,
    price: 2742.80,
    change: 0.45,
    change24h: 0.45,
    difficulty: 'Intermediate',
    volatility: 'Medium',
    trend: 'Bullish',
    indicators: ['Safe Haven Flow'],
    description: 'Ultimate store of value. Correlated with DXY. API: OANDA/CFD.',
    category: 'Commodity',
    tvSymbol: 'OANDA:XAUUSD'
  }
];

export const SYSTEM_WELCOME = `TradeSim Alpha [Version 5.0.0]
(c) 2077 Apex Capital Systems.

HYBRID CONNECTIVITY:
> Crypto (Binance): ONLINE [WSS:9443]
> Stocks (NASDAQ): SIMULATED_PROXY
> Forex (OANDA): SIMULATED_PROXY

TradeSim Alpha OS v5.0 Initialized... Multi-asset terminal active.`;
