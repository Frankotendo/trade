
export interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'error';
  content: string;
  timestamp: number;
}

export enum AssetClass {
  CRYPTO = 'Crypto',
  FOREX = 'Forex',
  INDICES = 'Index',
  COMMODITIES = 'Commodity',
  STOCKS = 'Equity'
}

export interface Asset {
  id: string;
  ticker: string; // e.g. BTC/USD, AAPL, BTCUSDT
  name: string;
  type: AssetClass;
  price: number;
  change24h: number; // percentage
  volatility: 'Low' | 'Medium' | 'Extreme';
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  indicators: string[]; // e.g. "RSI Oversold", "Golden Cross"
  description: string;
  newsFlash: string;
  tvSymbol?: string; // e.g. "BINANCE:BTCUSDT" or "NASDAQ:TSLA"
}

export interface TradeSetup {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Whale';
  description: string;
  objectives: string[]; // e.g. "Identify Trend", "Set Stop Loss", "Execute Long"
  assetId: string;
  completed: boolean;
  recommendedTools: string[]; // e.g. "Fibonacci", "MACD", "Volume Profile"
  briefing: string; // Spoken by AI
}

export interface LectureStep {
  voiceScript: string; 
  boardNotes: string;  
}

export interface Lecture {
  topic: string;
  steps: LectureStep[];
  currentStepIndex: number;
}

export type TradingMode = 'SIMULATION' | 'LIVE_PAPER';

export interface Position {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    size: number;
    unrealizedPnL: number;
}

export interface Portfolio {
    balance: number; // Cash
    positions: Position[];
    equity: number; // Total value (Cash + Unrealized PnL)
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
    size: number; // in USD
    side: 'BUY' | 'SELL';
    timestamp: number;
}

export interface GameState {
  mode: TradingMode;
  portfolio: Portfolio;
  currentMissionId: string | null;
  missions: TradeSetup[];
  targets: Record<string, Asset>; 
  terminalHistory: TerminalLine[];
  newsFeed: NewsItem[];
  whaleAlerts: WhaleAlert[];
  isProcessing: boolean;
  isPlayingAudio: boolean;
  activeLecture: Lecture | null;
}

export interface SimulationResponse {
  terminalOutput: string;
  instructorCommentary: string;
  missionUpdate?: {
    status: 'ongoing' | 'completed' | 'failed';
    progressLog?: string;
  };
  assetUpdate?: Partial<Asset>;
  systemAction?: 'none' | 'generate_missions';
  suggestedMissionTopic?: string;
}
