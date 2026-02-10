
import { Asset, AssetClass } from './types';

export const INITIAL_ASSETS: Asset[] = [
  // --- CRYPTO ---
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
    description: 'The alpha asset. Primary liquidity driver.',
    category: 'Crypto',
    tvSymbol: 'BINANCE:BTCUSDT',
    history: []
  },
  
  // --- EXOTIC GLOBAL ASSETS ---
  {
    id: 'SEMICON',
    symbol: 'SEMI-INDEX',
    ticker: 'SEMICON',
    name: 'Global Chip Basket',
    type: AssetClass.EXOTIC,
    price: 4520.12,
    change: 1.2,
    change24h: 1.2,
    difficulty: 'Advanced',
    volatility: 'High',
    trend: 'Bullish',
    indicators: ['Neural Demand Spike'],
    description: 'Basket of global semiconductor leaders (TSMC, ASML, NVIDIA). High correlation with AI growth.',
    category: 'Exotic',
    history: []
  },
  {
    id: 'TOKYO-RE',
    symbol: 'TKY-ESTATE',
    ticker: 'TOKYO-RE',
    name: 'Tokyo Commercial',
    type: AssetClass.ESTATE,
    price: 1845.00,
    change: -0.4,
    change24h: -0.4,
    difficulty: 'Intermediate',
    volatility: 'Low',
    trend: 'Neutral',
    indicators: ['Yen Carry Trade Flux'],
    description: 'Tokenized commercial real estate in Shibuya and Shinjuku districts. Sensitivity to BoJ policy.',
    category: 'Real Estate',
    history: []
  },
  {
    id: 'CARBON',
    symbol: 'CARBON-F',
    ticker: 'CARBON',
    name: 'EU Carbon Credits',
    type: AssetClass.COMMODITIES,
    price: 84.50,
    change: 3.8,
    change24h: 3.8,
    difficulty: 'Advanced',
    volatility: 'Very High',
    trend: 'Bullish',
    indicators: ['Regulatory Pressure'],
    description: 'EU Emission Trading System (ETS) futures. Pure play on global environmental regulation.',
    category: 'Commodity',
    history: []
  },
  {
    id: 'AI-FUND',
    symbol: 'AI-INFRA',
    ticker: 'AIPRIV',
    name: 'Private AI Hub',
    type: AssetClass.PRIVATE,
    price: 12500.00,
    change: 0,
    change24h: 0,
    difficulty: 'Advanced',
    volatility: 'Extreme',
    trend: 'Bullish',
    indicators: ['GPU CapEx Cycle'],
    description: 'Simulated secondary market for private AI infrastructure startups. High barrier to entry.',
    category: 'Private Equity',
    history: []
  },

  // --- STANDARD ASSETS ---
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
    description: 'Smart contract giant. High utility.',
    category: 'Crypto',
    tvSymbol: 'BINANCE:ETHUSDT',
    history: []
  },
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
    indicators: ['Oversold'],
    description: 'Hyper-volatile equity.',
    category: 'Stock',
    tvSymbol: 'NASDAQ:TSLA',
    history: []
  },
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
    description: 'Ultimate store of value.',
    category: 'Commodity',
    tvSymbol: 'OANDA:XAUUSD',
    history: []
  }
];

export const SYSTEM_WELCOME = `TradeSim Alpha [Version 5.2.0]
(c) 2077 Apex Capital Systems.

NEURAL SYNERGY:
> Station Inter-Link: ACTIVE [Handshake Verified]
> Global Asset Discovery: ENABLED [98.4% Market Coverage]
> Execution Relay: ARMED

Uplink Established. Universal market access granted.`;
