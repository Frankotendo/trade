
import React, { useState, useEffect } from 'react';
import { SentimentData, Asset } from '../types';
import { fetchSentimentAnalysis } from '../services/geminiService';
import { ShieldAlert, Zap, Users, BarChart3, TrendingUp, Info, Maximize2, Minimize2, Activity, Target, Flame, Gauge, BoxSelect } from 'lucide-react';

interface LiquidityTerminalProps {
  activeAsset: Asset | null;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const LiquidityTerminal: React.FC<LiquidityTerminalProps> = ({ activeAsset, isMaximized, onToggleMaximize }) => {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeAsset) {
      const load = async () => {
        setLoading(true);
        const data = await fetchSentimentAnalysis(activeAsset.ticker, activeAsset.price);
        setSentiment(data);
        setLoading(false);
      };
      load();
    }
  }, [activeAsset?.ticker, activeAsset?.price]);

  return (
    <div className="h-full flex flex-col bg-[#020617] text-cyan-400 font-mono text-xs overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] [background-size:40px_40px]"></div>

      <div className="p-4 border-b border-cyan-900/30 bg-cyan-950/20 flex items-center justify-between relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-cyan-400 animate-pulse" />
          <h2 className="text-[10px] font-black tracking-[0.4em] uppercase">Deep Liquidity Matrix v2.0</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-cyan-600 font-bold">
            <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">Uplink: {activeAsset?.ticker || '---'}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
          </div>
          <button onClick={onToggleMaximize} className="text-cyan-700 hover:text-cyan-400 transition-colors p-1">
             {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
        {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 py-20">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
                    <Target className="absolute inset-0 m-auto text-cyan-500/30 animate-pulse" size={24} />
                </div>
                <div className="text-center">
                    <p className="text-cyan-400 font-black uppercase tracking-[0.3em] mb-1">Deciphering Institutional Tape...</p>
                    <p className="text-[9px] text-cyan-800 uppercase">Profiling High-Volume Clusters</p>
                </div>
            </div>
        ) : sentiment ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <div className="md:col-span-4 glass-panel p-6 rounded-2xl border-cyan-900/30 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] text-cyan-700 mb-6 uppercase tracking-widest font-black flex items-center gap-2"><Gauge size={14}/> Alpha Pulse</div>
                <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="66" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-cyan-950" />
                        <circle 
                            cx="72" cy="72" r="66" 
                            stroke="currentColor" strokeWidth="6" fill="transparent" 
                            strokeDasharray={414} 
                            strokeDashoffset={414 - (414 * sentiment.score) / 100} 
                            className={`${sentiment.score > 60 ? 'text-emerald-400' : sentiment.score < 40 ? 'text-rose-400' : 'text-cyan-400'} transition-all duration-1000 ease-out`} 
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-black text-white">{sentiment.score}%</span>
                        <span className="text-[8px] text-cyan-600 font-bold uppercase tracking-widest">Sentiment Flux</span>
                    </div>
                </div>
                <div className="mt-6">
                    <div className={`text-sm font-black uppercase tracking-widest ${sentiment.score > 60 ? 'text-emerald-400' : sentiment.score < 40 ? 'text-rose-400' : 'text-white'}`}>
                        {sentiment.label}
                    </div>
                    <div className="text-[9px] text-cyan-700 mt-2 font-bold bg-black/40 px-3 py-1 rounded-full border border-cyan-900/30">
                        Vol Index: {sentiment.volatilityIndex.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="md:col-span-8 glass-panel p-8 rounded-2xl border-cyan-900/30 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <BoxSelect size={16} className="text-cyan-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Smart Money Footprint</h3>
                        </div>
                        <p className="text-[9px] text-cyan-700 uppercase font-bold">Institutional Logic: {sentiment.smartMoneySignal === 'Accumulation' ? 'BULLISH_BIAS' : sentiment.smartMoneySignal === 'Distribution' ? 'BEARISH_BIAS' : 'EQUILIBRIUM'}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-lg font-black text-[10px] uppercase border shadow-lg ${
                        sentiment.smartMoneySignal === 'Accumulation' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 
                        sentiment.smartMoneySignal === 'Distribution' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 
                        'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    }`}>
                        {sentiment.smartMoneySignal}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 my-6">
                    <div className="space-y-4">
                        <div className="p-3 bg-black/40 rounded-xl border border-cyan-900/20">
                            <div className="text-[9px] text-cyan-600 font-black uppercase mb-2">Alpha Context:</div>
                            <div className="text-[10px] text-slate-300 leading-relaxed font-bold">
                                {sentiment.smartMoneySignal === 'Accumulation' 
                                    ? "Whale clusters detected at current range. Order blocks suggest aggressive buying into retail sell-side liquidity." 
                                    : sentiment.smartMoneySignal === 'Distribution' 
                                    ? "Smart money is exiting into retail demand. Watch for breakdown of major supports as liquidity drains."
                                    : "Balanced order flow. No clear institutional bias. Scalping environment favored."}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] text-cyan-500 font-black uppercase"><span>Aggressive Bid</span><span>72%</span></div>
                            <div className="h-2 bg-cyan-950 rounded-full overflow-hidden border border-cyan-900/30">
                                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: '72%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] text-rose-500 font-black uppercase"><span>Aggressive Ask</span><span>28%</span></div>
                            <div className="h-2 bg-rose-950/20 rounded-full overflow-hidden border border-rose-900/30">
                                <div className="h-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" style={{ width: '28%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:col-span-12 glass-panel p-6 rounded-2xl border-cyan-900/30 overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Institutional Depth Map (Accurate)</span>
                    </div>
                    <div className="flex gap-4 text-[8px] font-bold text-cyan-700 uppercase">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500"></div> Sell Clusters</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500"></div> Buy Clusters</span>
                    </div>
                </div>
                
                <div className="h-48 w-full flex items-end gap-[2px] bg-black/40 rounded-xl p-4 border border-cyan-900/10 relative">
                    {sentiment.liquidityClusters.map((node, i) => {
                        const height = (node.volume / 100) * 100;
                        const color = node.type === 'SELL' ? 'bg-rose-500/40 border-rose-400/30' : 'bg-emerald-500/40 border-emerald-400/30';
                        return (
                            <div 
                                key={i} 
                                className={`flex-1 ${color} border-t-2 rounded-t-sm transition-all duration-700 group relative`} 
                                style={{ height: `${Math.max(10, height)}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-cyan-500 px-2 py-1 rounded text-[8px] whitespace-nowrap z-50">
                                    ${node.price.toFixed(2)}<br/>VOL: {node.volume.toFixed(1)}M
                                </div>
                            </div>
                        );
                    })}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/40 z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white text-black text-[9px] font-black rounded rotate-0">MARKET</div>
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-[8px] text-cyan-900 font-black uppercase tracking-widest">
                    <span>Resistance Blocks</span>
                    <span>Support Blocks</span>
                </div>
            </div>

            <div className="md:col-span-12 glass-panel p-6 rounded-2xl border-cyan-900/30 bg-cyan-500/5">
                <div className="flex items-center gap-3 mb-4">
                    <Info size={16} className="text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Apex Analysis Summary</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sentiment.topBuzzwords.map((word, i) => (
                        <div key={i} className="flex gap-4 items-start p-3 bg-black/20 rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center shrink-0 border border-cyan-900/30 text-cyan-400 font-bold">
                                {i + 1}
                            </div>
                            <div>
                                <div className="text-[10px] text-white font-black uppercase mb-1">{word}</div>
                                <p className="text-[9px] text-cyan-700 font-bold leading-tight">Elite analysis confirms this narrative is driving the current volume surge. Trade with caution.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-cyan-900 uppercase tracking-[0.5em] font-black">Waiting for Data Uplink...</div>
        )}
      </div>
    </div>
  );
};

export default LiquidityTerminal;
