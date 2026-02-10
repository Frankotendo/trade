
import React, { useState, useEffect, useRef } from 'react';
import { Asset, TradeAction, BrokerType, NeuralConsensus } from '../types';
import { bridgeService } from '../services/secureBridge';
import { generateNeuralConsensus } from '../services/geminiService';
import { 
  ShieldCheck, ShieldAlert, Key, Zap, Crosshair, ArrowUpCircle, 
  ArrowDownCircle, AlertCircle, Lock, Unlock, Activity, Terminal, 
  TrendingUp, Settings, Server, Globe, Cpu, Loader2, BarChart3, Binary, 
  Wallet, DollarSign, Bitcoin, Maximize2, Minimize2, Wifi, WifiOff, SignalHigh, SignalLow, Signal,
  Copy, Trash2, CheckCircle2, Network, BrainCircuit
} from 'lucide-react';

interface OrderBookLevel {
  price: number;
  size: number;
}

interface ExecutionTerminalProps {
  activeAsset: Asset | null;
  onExecute: (action: TradeAction) => void;
  equity: number;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const ExecutionTerminal: React.FC<ExecutionTerminalProps> = ({ activeAsset, onExecute, equity, isMaximized, onToggleMaximize }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [broker, setBroker] = useState<BrokerType>(BrokerType.BINANCE);
  const [showConfig, setShowConfig] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [isArming, setIsArming] = useState(false);
  const [tradeAmount, setTradeAmount] = useState('0.1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [bridgeStatus, setBridgeStatus] = useState<string>('IDLE');
  const [liveMode, setLiveMode] = useState(false);
  const [latency, setLatency] = useState(0);
  const [isBridgeOnline, setIsBridgeOnline] = useState(false);
  const [pingPulse, setPingPulse] = useState(false);
  const [consensus, setConsensus] = useState<NeuralConsensus | null>(null);
  const [loadingConsensus, setLoadingConsensus] = useState(false);
  
  const [orderBook, setOrderBook] = useState<{bids: OrderBookLevel[], asks: OrderBookLevel[]}>({ bids: [], asks: [] });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        const online = Math.random() > 0.02;
        setIsBridgeOnline(online);
        setLatency(online ? Math.floor(Math.random() * 15) + 3 : 0);
        setPingPulse(true);
        setTimeout(() => setPingPulse(false), 200);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeAsset && isLinked) {
        const fetchConsensus = async () => {
            setLoadingConsensus(true);
            const res = await generateNeuralConsensus(activeAsset.ticker, [], []);
            setConsensus(res);
            setLoadingConsensus(false);
        };
        fetchConsensus();
    }
  }, [activeAsset?.ticker, isLinked]);

  useEffect(() => {
    if (!activeAsset || !activeAsset.ticker.includes('USDT') || broker !== BrokerType.BINANCE) {
        const mockBids = Array.from({length: 15}).map((_, i) => ({ price: (activeAsset?.price || 100) - (i * 0.1), size: Math.random() * 5 }));
        const mockAsks = Array.from({length: 15}).map((_, i) => ({ price: (activeAsset?.price || 100) + (i * 0.1), size: Math.random() * 5 })).reverse();
        setOrderBook({ bids: mockBids, asks: mockAsks });
        return;
    }
    const symbol = activeAsset.ticker.toLowerCase();
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@depth20@100ms`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.bids) {
        const bids = data.bids.slice(0, 15).map((b: any) => ({ price: parseFloat(b[0]), size: parseFloat(b[1]) }));
        const asks = data.asks.slice(0, 15).map((a: any) => ({ price: parseFloat(a[0]), size: parseFloat(a[1]) })).reverse();
        setOrderBook({ bids, asks });
      }
    };
    return () => ws.close();
  }, [activeAsset?.ticker, broker]);

  const handleLink = async () => {
    if (apiKey.length < 8 || apiSecret.length < 8) return;
    setIsProcessing(true);
    const steps = ["HANDSHAKE", "SYNC_API", "SNAP_ACCOUNT", "UPLINK"];
    for (const step of steps) { setBridgeStatus(step); await new Promise(r => setTimeout(r, 400)); }
    setIsLinked(true);
    setIsProcessing(false);
    setShowConfig(false);
    setExecutionLog(prev => [`[SYS] BRIDGE_ACTIVE: ${broker}`, ...prev]);
  };

  const executeOrder = async (type: 'BUY' | 'SELL') => {
    if (!isArming || !activeAsset || !isLinked || !isBridgeOnline) return;
    setIsProcessing(true);
    setExecutionLog(prev => [`[ALPHA] ORDER_ROUTED: ${type} ${activeAsset.ticker}`, ...prev]);
    await new Promise(r => setTimeout(r, 800));
    onExecute({ type, amount: parseFloat(tradeAmount), price: activeAsset.price, symbol: activeAsset.ticker });
    setIsProcessing(false);
    setIsArming(false); 
  };

  return (
    <div className={`h-full flex flex-col bg-[#020408] font-mono text-xs overflow-hidden border border-slate-800 rounded-lg shadow-2xl relative`}>
      
      {showConfig && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8">
            <div className="max-w-md w-full glass-panel border-slate-800 p-10 rounded-[2rem]">
                <h3 className="text-xl font-black text-amber-500 uppercase mb-8">Multi-Broker Hub</h3>
                <div className="space-y-4">
                    <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API_KEY" className="w-full bg-black border border-amber-900/30 p-4 rounded-xl text-amber-500"/>
                    <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="SECRET" className="w-full bg-black border border-amber-900/30 p-4 rounded-xl text-amber-500"/>
                    <button onClick={handleLink} className="w-full py-4 bg-amber-500 text-black font-black uppercase rounded-xl">Initialize Sync</button>
                    <button onClick={() => setShowConfig(false)} className="w-full py-2 text-slate-500 font-bold uppercase">Close</button>
                </div>
            </div>
        </div>
      )}

      <div className="p-4 border-b border-red-900/30 bg-red-950/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20"><Crosshair size={20} className="text-red-500" /></div>
          <div>
            <h2 className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-100">Tactical Order Terminal</h2>
            <div className="flex items-center gap-3 mt-1">
                <span className={`text-[9px] uppercase font-bold ${isLinked ? 'text-emerald-500' : 'text-red-500/70'}`}>Relay: {isLinked ? `${broker.toUpperCase()}` : 'OFFLINE'}</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-400">{isBridgeOnline ? `${latency}ms` : 'LINK_LOST'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowConfig(true)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg"><Settings size={16} className="text-slate-500" /></button>
            <button onClick={onToggleMaximize} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">{isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-900 p-6 space-y-6 bg-[#05070a] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
             <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit size={16} /> Neural Consensus
             </div>
             <div className="p-5 bg-black/40 border border-slate-800 rounded-2xl space-y-4">
                {loadingConsensus ? (
                    <div className="py-4 flex flex-col items-center gap-2 animate-pulse">
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                        <span className="text-[8px] text-slate-600">POLLING STATIONS...</span>
                    </div>
                ) : consensus ? (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-500 uppercase">Verdict:</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black ${consensus.verdict === 'PROCEED' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>{consensus.verdict}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[8px] text-slate-600 uppercase"><span>Intel Conf</span><span>{consensus.intelConfidence}%</span></div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width:`${consensus.intelConfidence}%`}}></div></div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[8px] text-slate-600 uppercase"><span>Quant Align</span><span>{consensus.quantAlignment}%</span></div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-cyan-500" style={{width:`${consensus.quantAlignment}%`}}></div></div>
                        </div>
                        <p className="text-[9px] text-slate-400 italic leading-relaxed border-t border-white/5 pt-3">"{consensus.summary}"</p>
                    </>
                ) : (
                    <div className="py-4 text-center text-slate-700 text-[8px]">UPLINK REQUIRED</div>
                )}
             </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-900">
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2"><Binary size={16} /> Log</div>
             <div className="h-40 bg-black/60 border border-slate-900 rounded-xl p-3 overflow-y-auto custom-scrollbar font-mono text-[8px] space-y-2">
                {executionLog.map((log, i) => <div key={i} className="border-l border-slate-800 pl-3 text-slate-400">{log}</div>)}
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#020406] border-r border-slate-900">
            <div className="p-4 bg-slate-900/10 border-b border-slate-900/50 flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                <div className="flex items-center gap-2"><Globe size={14} className="text-blue-500 animate-pulse" /> Direct Market Access</div>
                <span>UPLINK_READY</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center px-6 overflow-hidden relative">
                <div className="flex-1 flex flex-col justify-end gap-1 py-4 opacity-30">
                    {orderBook.asks.map((ask, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-mono h-4 items-center">
                            <span className="text-red-500/70">{ask.price.toFixed(broker === BrokerType.BINANCE ? 2 : 4)}</span>
                            <span className="text-slate-700">{ask.size.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="py-10 border-y border-slate-800/50 bg-slate-950/80 flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,1)] z-10 rounded-xl">
                    <span className="text-4xl font-black text-slate-100 tabular-nums">{(activeAsset?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <div className="text-[9px] text-emerald-500/70 uppercase font-black tracking-widest mt-2">GLOBAL LIQUIDITY ACTIVE</div>
                </div>
                <div className="flex-1 flex flex-col justify-start gap-1 py-4 opacity-30">
                    {orderBook.bids.map((bid, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-mono h-4 items-center">
                            <span className="text-emerald-500/70">{bid.price.toFixed(broker === BrokerType.BINANCE ? 2 : 4)}</span>
                            <span className="text-slate-700">{bid.size.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="w-72 flex flex-col bg-[#05070a]">
            <div className="flex-1 p-6 space-y-6">
                <div className="p-5 border border-blue-900/30 bg-blue-950/5 rounded-2xl">
                    <div className="text-[10px] text-blue-500 font-black uppercase mb-4">Qty ({activeAsset?.ticker})</div>
                    <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} className="w-full bg-black border border-slate-800 p-3 rounded-xl text-white text-sm font-mono outline-none focus:border-blue-500"/>
                </div>
            </div>
            <div className="p-8 border-t border-slate-900 bg-black/40 space-y-4">
                <button onClick={() => setIsArming(!isArming)} className={`w-full py-5 border-2 rounded-2xl transition-all flex flex-col items-center gap-2 ${isArming ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                    {isArming ? <Unlock size={24} /> : <Lock size={24} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{isArming ? 'SYSTEM_ARMED' : 'ARM_LINK'}</span>
                </button>
                <div className="flex flex-col gap-3">
                    <button disabled={!isArming || !isLinked || isProcessing} onClick={() => executeOrder('BUY')} className="w-full bg-emerald-600 text-black rounded-2xl font-black py-4 uppercase text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:opacity-20">LONG MARKET</button>
                    <button disabled={!isArming || !isLinked || isProcessing} onClick={() => executeOrder('SELL')} className="w-full bg-red-600 text-black rounded-2xl font-black py-4 uppercase text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_15px_rgba(239,68,68,0.3)] disabled:opacity-20">SHORT MARKET</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionTerminal;
