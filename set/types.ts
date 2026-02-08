
export enum AppMode {
  TERMINAL = 'TERMINAL',
  INTEL = 'INTEL',
  SHADOW_RELAY = 'SHADOW_RELAY',
  QUANT_MATRIX = 'QUANT_MATRIX',
  LIQUIDITY_MAP = 'LIQUIDITY_MAP',
  EXECUTION = 'EXECUTION',
  ACADEMY = 'ACADEMY',
  SIM_MODE = 'SIM_MODE',
  NEWS_DECODER = 'NEWS_DECODER',
  AI_ORCHESTRATOR = 'AI_ORCHESTRATOR'
}

export enum LayoutMode {
  STANDARD = 'STANDARD',
  FLIPPED = 'FLIPPED',
  FOCUS = 'FOCUS'
}

export enum AssetClass {
  CRYPTO = 'Crypto',
  FOREX = 'Forex',
  STOCKS = 'Equity',
  COMMODITIES = 'Commodity',
  INDICES = 'Index'
}

export enum BrokerType {
  BINANCE = 'Binance',
  OANDA = 'Oanda',
  ALPACA = 'Alpaca',
  SIMULATOR = 'Simulator'
}

export enum BotStrategy {
  MOMENTUM_TRADING = 'Momentum Alpha Scalper',
  MACD_DIVERGENCE = 'MACD Crossover / Divergence',
  HEAD_SHOULDERS_PATTERN = 'Head and Shoulders / Chart Patterns',
  CANDLESTICK_LOGIC = 'Neural Candlestick Price Action',
  BREAKOUT_PRO = 'Hedge Fund Breakout Strategy',
  FIBONACCI_RETRACEMENT = 'Golden Ratio / Fibonacci Levels',
  MEAN_REVERSION = 'Statistical Mean Reversion',
  SMC_ICT = 'SMC / ICT 2022',
  WYCKOFF = 'Wyckoff Accumulation/Distribution',
  DARK_POOL = 'Dark Pool Institutional Flow'
}

export interface ShadowIntel {
  id: string;
  source: string;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  rawFragment: string;
  timestamp: number;
  tags: string[];
  confidence: number; // 0-100
  verificationSeal: string; // e.g., "X-RED-LEVEL"
  expiryMinutes: number; // minutes until the intel is irrelevant
  category: 'DARK_POOL' | 'INSIDER' | 'MACRO_LEAK' | 'HFT_ANOMALY';
}

export interface CorrelationData {
  base: string;
  target: string;
  coefficient: number; // -1 to 1
  regime: 'Decoupled' | 'Positive' | 'Inverse';
}

export interface SentimentData {
  score: number;
  label: string; 
  socialVolume: string;
  topBuzzwords: string[];
  smartMoneySignal: 'Accumulation' | 'Distribution' | 'Neutral';
  liquidityClusters: { price: number; volume: number; type: 'BUY' | 'SELL' }[];
  volatilityIndex: number;
}

export interface AlphaSignal {
  id: string;
  asset: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;
  confidence: number;
  timeframe: string;
}

export interface TradeSetup {
  id: string;
  assetId: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
}

export interface Asset {
  id: string;
  symbol: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  change24h: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  volatility: string;
  trend: string;
  indicators: string[];
  description: string;
  category: string;
  type: AssetClass;
  tvSymbol?: string;
  newsFlash?: string;
}

export interface TerminalMessage {
  type: 'system' | 'user' | 'ai' | 'error' | 'success' | 'bot';
  content: string;
  timestamp: Date;
  impact?: string; 
  meta?: string; 
  confidence?: number;
  reasoning?: string; 
}

export interface TradeAction {
  type: 'BUY' | 'SELL' | 'CLOSE' | 'NONE';
  amount: number;
  price: number;
  symbol: string;
  reason?: string;
  confidence?: number;
  analysis?: string; 
  assetClass?: AssetClass;
}

export interface Position {
  symbol: string;
  amount: number;
  entryPrice: number;
  type: 'LONG' | 'SHORT';
  assetClass: AssetClass;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  timestamp: number;
  url?: string;
}

export interface WhaleAlert {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  size: number;
  timestamp: number;
}

export interface LectureStep {
  boardNotes: string;
  speechText: string;
}

export interface Lecture {
  topic: string;
  steps: LectureStep[];
  currentStepIndex: number;
}

export interface SimulationResponse {
  terminalOutput: string;
  instructorCommentary: string;
  tradeAction?: TradeAction;
  lecture?: Lecture;
  missionUpdate?: {
    status: string;
  };
}

export interface NewsDecode {
  laymanSummary: string;
  whyItMatters: string;
  expectedOutcome: string;
  sentimentScore: number;
  volatilityForecast: 'Stable' | 'Volatile' | 'Explosive';
}

export interface OrchestratorAction {
  id: string;
  timestamp: number;
  module: string;
  action: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  result?: string;
}
