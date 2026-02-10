
export enum AppMode {
  ACADEMY = 'ACADEMY',
  PRACTICE_TERMINAL = 'PRACTICE_TERMINAL',
  HISTORY = 'HISTORY'
}

export enum Station {
  ACADEMY = 'ACADEMY',
  TACTICAL = 'TACTICAL'
}

export enum AssetClass {
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
  STOCKS = 'STOCKS',
  COMMODITIES = 'COMMODITIES',
  INDICES = 'INDICES',
  EXOTIC = 'EXOTIC',
  ESTATE = 'ESTATE',
  PRIVATE = 'PRIVATE'
}

/**
 * CORE MODULES - Representing the main branches of the 5900+ strategy database.
 * Refined to specifically include user-requested methodologies for 2077 simulation.
 */
export enum BotStrategy {
  // --- User Requested Strategies ---
  MOMENTUM_TRADING = 'Momentum Trading Dynamics',
  MACD_STRATEGY = 'MACD Convergence/Divergence',
  HEAD_AND_SHOULDERS = 'Head and Shoulders Patterns',
  CANDLESTICK_STRATEGIES = 'Advanced Candlestick Logic',

  // --- Institutional / Advanced ---
  ICT_SMC = 'Inner Circle Trader / SMC',
  INSTITUTIONAL_ORDER_FLOW = 'Institutional Order Flow',
  WYCKOFF_METHOD = 'Wyckoff Accumulation/Distribution',
  VOLUME_PROFILE = 'Volume Profile / Market Profile',
  
  // --- Technical Indicator Strategies ---
  MA_CROSSOVER = 'Moving Average Crossover',
  RSI_DIVERGENCE = 'RSI Overbought/Oversold',
  BOLLINGER_BREAKOUT = 'Bollinger Band Breakouts',
  STOCHASTIC_SCALPING = 'Stochastic Oscillator Scalping',
  ICHIMOKU_CLOUD = 'Ichimoku Kinko Hyo',
  
  // --- Mathematical / Quantitative ---
  QUANTITATIVE_HFT = 'Quantitative HFT Strategies',
  GANN_THEORY = 'W.D. Gann Geometric Analysis',
  
  // --- Fundamental / Psychological ---
  MACRO_FUNDAMENTALS = 'Global Macro Fundamentals',
  TRADING_PSYCHOLOGY = 'Neural Psychology & Discipline'
}

export interface Asset {
  id: string;
  symbol: string;
  ticker: string;
  name: string;
  price: number;
  change24h: number;
  change?: number;
  trend?: string;
  type: string | AssetClass;
  history: number[];
  tvSymbol?: string;
  difficulty?: string;
  volatility?: string;
  indicators?: string[];
  description?: string;
  category?: string;
  newsFlash?: string;
}

export interface TerminalMessage {
  type: 'system' | 'user' | 'ai' | 'error' | 'success' | 'mentor';
  content: string;
  timestamp: Date;
  reasoning?: string; 
}

export interface Position {
  symbol: string;
  amount: number;
  entryPrice: number;
  type: 'LONG' | 'SHORT';
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

export interface TradeAction {
  type: 'BUY' | 'SELL' | 'CLOSE' | 'NONE';
  amount: number;
  price: number;
  symbol: string;
  analysis?: string;
}

export interface SimulationResponse {
  terminalOutput: string;
  instructorCommentary: string;
  tradeAction?: TradeAction;
  lecture?: Lecture;
}

export interface TradeSetup {
  id: string;
  assetId: string;
  description: string;
  completed: boolean;
}

export interface WhaleAlert {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  size: number;
  timestamp: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  url: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  timestamp: number;
}

export interface AlphaSignal {
  id: string;
  asset: string;
  type: 'LONG' | 'SHORT';
  confidence: number;
  entry: number;
  takeProfit: number;
  stopLoss: number;
  reasoning: string;
  timeframe: string;
}

export interface SentimentData {
  score: number;
  label: string;
  volatilityIndex: number;
  smartMoneySignal: 'Accumulation' | 'Distribution' | 'Neutral';
  liquidityClusters: { price: number; volume: number; type: 'BUY' | 'SELL' }[];
  topBuzzwords: string[];
}

export enum BrokerType {
  BINANCE = 'BINANCE',
  OANDA = 'OANDA',
  ALPACA = 'ALPACA'
}

export interface NeuralConsensus {
  verdict: 'PROCEED' | 'HALT';
  intelConfidence: number;
  quantAlignment: number;
  summary: string;
}

export interface ShadowIntel {
  id: string;
  source: string;
  verificationSeal: string;
  timestamp: number;
  threatLevel: 'Critical' | 'High' | 'Normal';
  expiryMinutes: number;
  confidence: number;
  summary: string;
  rawFragment: string;
  tags: string[];
}

export interface CorrelationData {
  base: string;
  target: string;
  coefficient: number;
  regime: 'Positive' | 'Inverse' | 'Neutral';
}

export interface NewsDecode {
  laymanSummary: string;
  whyItMatters: string;
  expectedOutcome: string;
  sentimentScore: number;
  volatilityForecast: 'Explosive' | 'Volatile' | 'Stable';
}

export interface OrchestratorAction {
  status: string;
  module: string;
  timestamp: number;
  action: string;
  result?: string;
}

export interface OptimizationReport {
  currentMetrics: { [key: string]: number };
  suggestedMetrics: { [key: string]: number };
  strategicNarrative: string;
  parameterAdjustments: { parameter: string; oldValue: string; newValue: string; impact: string }[];
}
