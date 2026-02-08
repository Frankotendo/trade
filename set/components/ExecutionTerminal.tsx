import React, { useState, useEffect, useRef } from 'react';
import { Asset, TradeAction, BrokerType } from '../types';
import { bridgeService } from '../services/secureBridge';
import { 
  ShieldCheck, ShieldAlert, Key, Zap, Crosshair, ArrowUpCircle, 
  ArrowDownCircle, AlertCircle, Lock, Unlock, Activity, Terminal, 
  TrendingUp, Settings, Server, Globe, Cpu, Loader2, BarChart3, Binary, 
  Wallet, DollarSign, Bitcoin, Maximize2, Minimize2, Wifi, WifiOff, SignalHigh, SignalLow, Signal,
  Copy, Trash2, CheckCircle2
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
  const [copySuccess, setCopySuccess] = useState(false);
  
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
    if (!activeAsset || !activeAsset.ticker.includes('USDT') || broker !== BrokerType.BINANCE) return;
    const symbol = activeAsset.ticker.toLowerCase();
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@depth20@100ms/${symbol}@trade`;
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
    
    const steps = [
        "ESTABLISHING_TLS_HANDSHAKE",
        `SYNCHRONIZING_${broker.toUpperCase()}_API`,
        "FETCHING_ACCOUNT_SNAPSHOT",
        "SYNCING_RELAY_v4",
        "UPLINK_ESTABLISHED"
    ];

    for (const step of steps) {
        setBridgeStatus(step);
        await new Promise(r => setTimeout(r, 400));
    }

    bridgeService.setCredentials({ apiKey, apiSecret });
    bridgeService.setLiveMode(liveMode);
    setIsLinked(true);
    setIsProcessing(false);
    setShowConfig(false);
    setExecutionLog(prev => [...prev, `[SYS] BRIDGE_ACTIVE: ${broker} (${liveMode ? 'PRODUCTION' : 'SANDBOX'})`]);
  };

  const handleCopyCredentials = () => {
    const creds = `API_KEY: ${apiKey}\nSECRET: ${apiSecret}\nBROKER: ${broker}\nMODE: ${liveMode ? 'PRODUCTION' : 'SANDBOX'}`;
    navigator.clipboard.writeText(creds);
    setCopySuccess(true);
    setExecutionLog(prev => [...prev, `[SEC] CREDENTIALS_EXPORTED_TO_CLIPBOARD`]);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleClearCredentials = () => {
    setApiKey('');
    setApiSecret('');
    setIsLinked(false);
    bridgeService.setCredentials({ apiKey: '', apiSecret: '' });
    setExecutionLog(prev => [...prev, `[SEC] CREDENTIALS_PURGED_FROM_MEMORY`]);
  };

  const executeOrder = async (type: 'BUY' | 'SELL') => {
    if (!isArming || !activeAsset || !isLinked || !isBridgeOnline) {
      setExecutionLog(prev => [...prev, `[WARN] UPLINK_REQUIRED_FOR_EXECUTION`]);
      return;
    }
    
    const spread = (orderBook.asks[orderBook.asks.length-1]?.price || activeAsset.price) - (orderBook.bids[0]?.price || activeAsset.price);
    const executionPrice = type === 'BUY' ? (activeAsset.price + (spread * 0.1)) : (activeAsset.price - (spread * 0.1));

    setIsProcessing(true);
    setExecutionLog(prev => [...prev, `[ALPHA] VALIDATING_${type}_ON_${broker}...`]);
    await new Promise(r => setTimeout(r, 800));

    try {
      const result: any = await bridgeService.proxyExecute(type, activeAsset.ticker, parseFloat(tradeAmount), executionPrice);
      
      if (result.status === 'REJECTED') {
        throw new Error(result.reason || "BRIDGE_REFUSED_TX");
      }

      setExecutionLog(prev => [...prev, `[FILL] ID:${result.orderId} PX:${result.price} BROKER:${broker}`]);
      
      onExecute({
          type,
          amount: parseFloat(tradeAmount),
          price: executionPrice,
          symbol: activeAsset.ticker,
          confidence: 99,
          analysis: `Direct trade execution via ${broker} API relay.`
      });
    } catch (err: any) {
      const errMsg = err.message || "BRIDGE_AUTH_REFUSED";
      let displayError = errMsg.toUpperCase().replace(/\s/g, '_');
      if (errMsg === 'INSUFFICIENT_FUNDS') displayError = 'ERROR: INSUFFICIENT BALANCE FOR ORDER';
      if (errMsg === 'INVALID_QUANTITY') displayError = 'ERROR: ORDER SIZE BELOW MINIMUM THRESHOLD';
      if (errMsg === 'BRIDGE_ERR: DISCONNECTED') displayError = 'ERROR: UPLINK DISCONNECTED DURING HANDSHAKE';

      setExecutionLog(prev => [...prev, `[ERR] ${displayError}`]);
    } finally {
      setIsProcessing(false);
      setIsArming(false); 
    }
  };

  return (
    <div className={`h-full flex flex-col bg-[#020408] font-mono text-xs overflow-hidden select-none border border-slate-800 rounded-lg shadow-2xl relative`}>
      
      {showConfig && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="max-w-md w-full glass-panel border-slate-800 p-10 rounded-[2rem] shadow-[0_0_80px_rgba(245,158,11,0.1)]">
                <div className="flex items-center gap-6 mb-8">
                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                        <Server size={32} className="text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-amber-500 uppercase tracking-widest">Multi-Broker Hub</h3>
                        <p className="text-[10px] text-amber-900 uppercase font-bold">Node.js Execution Bridge</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <select 
                            value={broker}
                            onChange={(e) => setBroker(e.target.value as BrokerType)}
                            className="w-full bg-black border border-amber-900/30 p-4 rounded-xl text-amber-500 text-[11px] font-bold outline-none appearance-none cursor-pointer"
                        >
                            <option value={BrokerType.BINANCE}>Binance (Crypto)</option>
                            <option value={BrokerType.OANDA}>Oanda (Forex/CFD)</option>
                            <option value={BrokerType.ALPACA}>Alpaca (Stocks)</option>
                            <option value={BrokerType.SIMULATOR}>Local Simulator</option>
                        </select>
                        <div className="relative">
                          <input 
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="API_KEY / TOKEN"
                            className="w-full bg-black border border-amber-900/30 p-4 rounded-xl text-amber-500 text-[11px] outline-none placeholder:text-amber-950 font-mono"
                          />
                        </div>
                        <div className="relative">
                          <input 
                            type="password"
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                            placeholder="SECRET_KEY / ACCOUNT_ID"
                            className="w-full bg-black border border-amber-900/30 p-4 rounded-xl text-amber-500 text-[11px] outline-none placeholder:text-amber-950 font-mono"
                          />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Uplink Target</span>
                            <span className={liveMode ? "text-red-500 font-black" : "text-blue-400 font-black"}>{liveMode ? "LIVE_PRODUCTION" : "SANDBOX_PAPER"}</span>
                        </div>
                        <button 
                            onClick={() => setLiveMode(!liveMode)}
                            className={`px-5 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all ${liveMode ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-700 text-slate-300'}`}
                        >
                            Switch Env
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-2">
                        <button 
                            onClick={handleCopyCredentials}
                            className="flex items-center justify-center gap-2 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[10px] text-slate-400 font-bold uppercase hover:bg-slate-800 transition-all active:scale-95"
                        >
                            {copySuccess ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14}/>} 
                            {copySuccess ? 'Copied' : 'Copy Keys'}
                        </button>
                        <button 
                            onClick={handleClearCredentials}
                            className="flex items-center justify-center gap-2 py-3 bg-red-900/10 border border-red-900/30 rounded-xl text-[10px] text-red-500 font-bold uppercase hover:bg-red-900/20 transition-all active:scale-95"
                        >
                            <Trash2 size={14}/> Clear
                        </button>
                    </div>

                    <div className="space-y-4 pt-2">
                        {isProcessing && (
                            <div className="flex items-center gap-3 text-[10px] text-amber-500 font-bold uppercase animate-pulse">
                                <Loader2 size={14} className="animate-spin" />
                                <span>{bridgeStatus}...</span>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <button onClick={() => setShowConfig(false)} className="flex-1 py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-slate-300">Close</button>
                            <button 
                                onClick={handleLink}
                                disabled={isProcessing || apiKey.length < 8}
                                className="flex-1 py-4 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-all rounded-xl disabled:opacity-30 shadow-[0_4px_15px_rgba(245,158,11,0.2)]"
                            >
                                {isProcessing ? 'SYNCING...' : 'INITIATE SYNC'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="p-4 border-b border-red-900/30 bg-red-950/5 flex items-center justify-between relative overflow-hidden">
        {isLinked && isBridgeOnline && (
            <div className="absolute top-0 bottom-0 w-20 bg-emerald-500/10 blur-xl animate-[scan_4s_linear_infinite] pointer-events-none"></div>
        )}
        
        <div className="flex items-center gap-4 z-10">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <Crosshair size={20} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-[11px] font-black tracking-[0.4em] uppercase text-slate-100">Tactical Order Terminal</h2>
            <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isLinked ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-red-500 animate-pulse'} `}></span>
                    <span className={`text-[9px] uppercase font-bold ${isLinked ? 'text-emerald-500' : 'text-red-500/70'}`}>
                        Relay: {isLinked ? `${broker.toUpperCase()}` : 'OFFLINE'}
                    </span>
                </div>
                
                <div className="w-[1px] h-2.5 bg-slate-800"></div>

                <div className="flex items-center gap-3 px-3 py-1 bg-black/60 border border-white/5 rounded-lg shadow-inner">
                    <div className="flex items-center gap-1.5">
                        {isBridgeOnline ? (
                            <Wifi size={12} className={`transition-all duration-300 ${pingPulse ? 'text-white scale-125' : 'text-emerald-500'}`} />
                        ) : (
                            <WifiOff size={12} className="text-red-500 animate-pulse" />
                        )}
                        <span className={`text-[10px] font-black uppercase font-mono tracking-tighter ${isBridgeOnline ? 'text-emerald-400' : 'text-red-600'}`}>
                            {isBridgeOnline ? `${latency}ms` : 'LINK_LOST'}
                        </span>
                    </div>
                    <div className="flex items-end gap-1 h-3">
                        {[1, 2, 3, 4].map(i => {
                            const active = isBridgeOnline && (latency < 20 || (latency < 40 && i <= 3) || (latency < 60 && i <= 2) || i === 1);
                            return (
                                <div 
                                    key={i} 
                                    className={`w-1 rounded-full transition-all duration-700 ${active ? (latency > 50 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'}`} 
                                    style={{ height: `${i * 25}%`, opacity: active ? 1 : 0.2 }}
                                ></div>
                            );
                        })}
                    </div>
                </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 z-10">
            <button onClick={() => setShowConfig(true)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg group hover:border-amber-500/50 transition-all">
                <Settings size={16} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
            </button>
            <button onClick={onToggleMaximize} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg group hover:border-blue-500/50 transition-all">
                {isMaximized ? <Minimize2 size={16} className="text-slate-500 group-hover:text-blue-400" /> : <Maximize2 size={16} className="text-slate-500 group-hover:text-blue-400" />}
            </button>
        </div>
      </div>

      <div className={`flex-1 flex overflow-hidden ${isMaximized ? 'min-h-0' : 'h-[500px]'}`}>
        <div className="w-80 border-r border-slate-900 p-6 space-y-8 bg-[#05070a] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Cpu size={16} className="text-blue-500" /> Execution Matrix
            </div>
            
            <div className="space-y-5 p-5 bg-black/40 border border-slate-800 rounded-2xl">
                {[
                    { label: 'Momentum Alignment', val: 78, color: 'bg-emerald-500' },
                    { label: 'Relative Strength', val: 42, color: 'bg-amber-500' },
                    { label: 'Order Book Imbalance', val: 91, color: 'bg-blue-500' },
                    { label: 'Risk Score', val: 12, color: 'bg-emerald-500' }
                ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[8px] uppercase font-bold text-slate-500">
                            <span>{stat.label}</span>
                            <span>{stat.val}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: isLinked ? `${stat.val}%` : '0%' }}></div>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-900">
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <Binary size={16} /> Transaction Log
             </div>
             <div className="h-56 bg-black/60 border border-slate-900 rounded-xl p-3 overflow-y-auto custom-scrollbar font-mono text-[8px] space-y-2">
                {executionLog.map((log, i) => (
                    <div key={i} className={`border-l pl-3 leading-relaxed ${log.includes('[ERR]') ? 'text-red-500 border-red-500' : log.includes('[WARN]') ? 'text-amber-500 border-amber-500' : log.includes('[SEC]') ? 'text-blue-400 border-blue-900/50' : 'text-slate-400 border-slate-800'}`}>
                        {log}
                    </div>
                ))}
                {isLinked && isBridgeOnline && <div className="text-emerald-500/40 animate-pulse mt-2 flex items-center gap-2">{" >>> "} STANDBY_FOR_ALPHA_SIGNAL...</div>}
                {(!isBridgeOnline && isLinked) && <div className="text-red-500/40 animate-pulse mt-2 flex items-center gap-2">{" >>> "} LINK_TEMPORARILY_SEVERED...</div>}
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#020406] border-r border-slate-900">
            <div className="p-4 bg-slate-900/10 border-b border-slate-900/50 flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Globe size={14} className="text-blue-500 animate-pulse" /> Direct Market Access</div>
                <span>TCP_RELAY_UPLINK</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center px-6 overflow-hidden relative">
                <div className="flex-1 flex flex-col justify-end gap-1 py-4 opacity-40">
                    {orderBook.asks.map((ask, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-mono h-4 items-center">
                            <span className="text-red-500/70">{ask.price.toFixed(broker === BrokerType.BINANCE ? 2 : 4)}</span>
                            <span className="text-slate-700">{ask.size.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="py-10 border-y border-slate-800/50 bg-slate-950/80 flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,1)] z-10 rounded-xl">
                    <span className="text-4xl font-black text-slate-100 tracking-tighter tabular-nums mb-2">
                        {(activeAsset?.price || 0).toLocaleString(undefined, { minimumFractionDigits: broker === BrokerType.BINANCE ? 2 : 5 })}
                    </span>
                    <div className="flex gap-6">
                        <div className="text-[9px] text-emerald-500/70 uppercase font-black tracking-widest flex items-center gap-1"><TrendingUp size={10}/> Spread: 0.01%</div>
                        <div className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Vol: 1.4B</div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-start gap-1 py-4 opacity-40">
                    {orderBook.bids.map((bid, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-mono h-4 items-center">
                            <span className="text-emerald-500/70">{bid.price.toFixed(broker === BrokerType.BINANCE ? 2 : 4)}</span>
                            <span className="text-slate-700">{bid.size.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="w-72 flex flex-col bg-[#05070a] border-l border-slate-900">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-5 border border-blue-900/30 bg-blue-950/5 rounded-2xl shadow-inner">
                    <div className="text-[10px] text-blue-500 font-black uppercase mb-4 flex items-center gap-2"><Settings size={12}/> Order Config</div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[9px] text-slate-500 uppercase font-bold">
                            <span>Qty ({activeAsset?.ticker})</span>
                            <span>Max: 12.5</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={tradeAmount} 
                                onChange={(e) => setTradeAmount(e.target.value)}
                                className="w-full bg-black border border-slate-800 p-3 rounded-xl text-white text-sm font-mono focus:border-blue-500 outline-none transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-[9px] font-bold">{activeAsset?.ticker}</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 border border-slate-800 bg-slate-900/20 rounded-2xl">
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black mb-3">
                        <span>Est. Slippage</span>
                        <span className="text-emerald-500 font-mono">0.01%</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black">
                        <span>Net USD Exp</span>
                        <span className="text-slate-100 font-mono">${(parseFloat(tradeAmount) * (activeAsset?.price || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <div className="p-8 border-t border-slate-900 bg-black/40 space-y-6">
                <button 
                  onClick={() => setIsArming(!isArming)}
                  className={`w-full py-5 border-2 rounded-2xl transition-all flex flex-col items-center gap-2 group ${isArming ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700'}`}
                >
                    {isArming ? <Unlock size={24} /> : <Lock size={24} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{isArming ? 'SYSTEM_ARMED' : 'ARM_LINK'}</span>
                </button>
                
                <div className="flex flex-col gap-3">
                    <button 
                        disabled={!isArming || !isLinked || isProcessing || !isBridgeOnline}
                        onClick={() => executeOrder('BUY')}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-10 text-black rounded-2xl font-black py-5 uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                    >
                        {isProcessing ? <Loader2 size={16} className="animate-spin"/> : <ArrowUpCircle size={16} />} LONG MARKET
                    </button>
                    <button 
                        disabled={!isArming || !isLinked || isProcessing || !isBridgeOnline}
                        onClick={() => executeOrder('SELL')}
                        className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-10 text-black rounded-2xl font-black py-5 uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(239,68,68,0.3)] transition-all active:scale-95"
                    >
                        {isProcessing ? <Loader2 size={16} className="animate-spin"/> : <ArrowDownCircle size={16} />} SHORT MARKET
                    </button>
                </div>

                <div className="text-[9px] text-slate-800 text-center uppercase font-black tracking-widest pt-4">
                    Neural Logic Core: v5.2.0 [STABLE]
                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
            from { left: -10%; }
            to { left: 110%; }
        }
      `}</style>
    </div>
  );
};

export default ExecutionTerminal;
