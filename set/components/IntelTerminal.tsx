
import React, { useState, useEffect } from 'react';
import { NewsItem, WhaleAlert, AlphaSignal, Asset } from '../types';
import { fetchStrategyRankings, fetchAlphaSignals } from '../services/geminiService';
import { AlertTriangle, Radio, ExternalLink, Activity, Anchor, Maximize2, Minimize2, Trophy, BarChart2, Zap, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface IntelTerminalProps {
    news: NewsItem[];
    whales: WhaleAlert[];
    assets: Asset[];
    onRefreshNews: () => void;
    isMaximized: boolean;
    onToggleMaximize: () => void;
}

const IntelTerminal: React.FC<IntelTerminalProps> = ({ news, whales, assets, onRefreshNews, isMaximized, onToggleMaximize }) => {
    const [strategyRankings, setStrategyRankings] = useState<string[]>([]);
    const [alphaSignals, setAlphaSignals] = useState<AlphaSignal[]>([]);
    const [isLoadingRankings, setIsLoadingRankings] = useState(false);
    const [isLoadingSignals, setIsLoadingSignals] = useState(false);
    const [activeTab, setActiveTab] = useState<'INTEL' | 'SIGNALS' | 'RANKINGS'>('INTEL');

    useEffect(() => {
        if (activeTab === 'RANKINGS' && strategyRankings.length === 0) {
            loadRankings();
        }
        if (activeTab === 'SIGNALS' && alphaSignals.length === 0) {
            loadSignals();
        }
    }, [activeTab]);

    const loadRankings = async () => {
        setIsLoadingRankings(true);
        const rankings = await fetchStrategyRankings();
        setStrategyRankings(rankings);
        setIsLoadingRankings(false);
    };

    const loadSignals = async () => {
        setIsLoadingSignals(true);
        const signals = await fetchAlphaSignals(assets);
        setAlphaSignals(signals);
        setIsLoadingSignals(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0505] border border-orange-900/30 rounded relative overflow-hidden font-mono shadow-[inset_0_0_20px_rgba(255,100,0,0.05)]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a0f08] border-b border-orange-900/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-orange-500">
                        <Radio size={16} className="animate-pulse" />
                        <span className="text-xs font-bold tracking-widest uppercase">Apex Alpha Relay</span>
                    </div>
                    <nav className="flex gap-2 ml-4">
                        <button 
                            onClick={() => setActiveTab('INTEL')}
                            className={`text-[9px] px-3 py-1 rounded transition-all ${activeTab === 'INTEL' ? 'bg-orange-500 text-black font-black' : 'text-orange-500/50 hover:text-orange-400'}`}
                        >
                            NEWS_FEED
                        </button>
                        <button 
                            onClick={() => setActiveTab('SIGNALS')}
                            className={`text-[9px] px-3 py-1 rounded transition-all ${activeTab === 'SIGNALS' ? 'bg-orange-500 text-black font-black' : 'text-orange-500/50 hover:text-orange-400'}`}
                        >
                            ALPHA_SIGNALS
                        </button>
                        <button 
                            onClick={() => setActiveTab('RANKINGS')}
                            className={`text-[9px] px-3 py-1 rounded transition-all ${activeTab === 'RANKINGS' ? 'bg-orange-500 text-black font-black' : 'text-orange-500/50 hover:text-orange-400'}`}
                        >
                            STRATEGY_EDGE
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onRefreshNews}
                        className="text-[10px] bg-orange-900/20 text-orange-400 px-2 py-0.5 rounded border border-orange-800/50 hover:bg-orange-800/30 transition-colors"
                    >
                        SYNC_UPLINK
                    </button>
                    <button onClick={onToggleMaximize} className="text-orange-500 hover:text-orange-200 transition-colors">
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {activeTab === 'INTEL' && (
                    <div className="h-full grid grid-rows-2 gap-0">
                        <div className="row-span-1 flex flex-col border-b border-orange-900/30 min-h-0">
                            <div className="px-3 py-1 bg-orange-950/30 text-orange-300/50 text-[10px] uppercase tracking-wider flex items-center gap-2">
                                <Anchor size={12} /> Deep Pool Whales
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {whales.length === 0 ? (
                                    <div className="text-orange-900/40 text-xs text-center mt-4 uppercase animate-pulse">Triangulating Large Flows...</div>
                                ) : (
                                    whales.slice().reverse().map((w) => (
                                        <div key={w.id} className="flex items-center justify-between text-[11px] border-l-2 border-orange-700 pl-2 bg-orange-900/10 p-1 hover:bg-orange-900/20">
                                            <span className="text-orange-200 font-bold">{w.symbol}</span>
                                            <span className={w.side === 'BUY' ? 'text-green-500' : 'text-red-500'}>{w.side}</span>
                                            <span className="text-orange-300">${w.size.toLocaleString()}</span>
                                            <span className="text-orange-500/50 text-[9px]">{new Date(w.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="row-span-1 flex flex-col min-h-0">
                            <div className="px-3 py-1 bg-orange-950/30 text-orange-300/50 text-[10px] uppercase tracking-wider flex items-center gap-2">
                                <Activity size={12} /> Macro Intel Wire
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                                {news.map((n) => (
                                    <div key={n.id} className="group border border-orange-900/20 bg-orange-900/5 p-2 rounded hover:bg-orange-900/20">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[9px] px-1 rounded ${
                                                n.sentiment === 'Positive' ? 'bg-green-900/30 text-green-500' :
                                                n.sentiment === 'Negative' ? 'bg-red-900/30 text-red-500' :
                                                'bg-gray-800 text-gray-400'
                                            }`}>{n.sentiment?.toUpperCase() || 'NEUTRAL'}</span>
                                            <span className="text-[9px] text-orange-600 font-black">{n.source}</span>
                                        </div>
                                        <a href={n.url} target="_blank" rel="noreferrer" className="text-xs text-orange-100 font-bold hover:underline block leading-tight">{n.headline}</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'SIGNALS' && (
                    <div className="h-full flex flex-col">
                        <div className="px-3 py-1 bg-orange-950/30 text-orange-300/50 text-[10px] uppercase tracking-wider flex items-center justify-between">
                            <div className="flex items-center gap-2"><Zap size={12} className="text-yellow-500" /> Professional Alpha Signals</div>
                            <span className="text-[8px] animate-pulse text-yellow-500 font-black">Elite Conviction Scan</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {isLoadingSignals ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                                    <Target className="w-12 h-12 text-orange-500 animate-spin" />
                                    <p className="text-orange-700 animate-pulse uppercase tracking-[0.2em] text-[10px]">Scanning Institutional Entries...</p>
                                </div>
                            ) : alphaSignals.map((sig) => (
                                <div key={sig.id} className="bg-orange-950/10 border border-orange-500/20 p-4 rounded-xl relative group overflow-hidden">
                                    <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase ${sig.type === 'LONG' ? 'bg-emerald-600 text-black' : 'bg-red-600 text-black'}`}>
                                        {sig.type}
                                    </div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-black border border-orange-500/30 flex items-center justify-center text-orange-500 font-black">
                                            {sig.asset.substring(0, 3)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white">{sig.asset}</h4>
                                            <p className="text-[9px] text-orange-500/50 uppercase font-bold">{sig.timeframe} TF | {sig.confidence}% Conf</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                                            <div className="text-[8px] text-slate-500 uppercase">Entry</div>
                                            <div className="text-[10px] text-emerald-400 font-bold">${sig.entry}</div>
                                        </div>
                                        <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                                            <div className="text-[8px] text-slate-500 uppercase">TP</div>
                                            <div className="text-[10px] text-blue-400 font-bold">${sig.takeProfit}</div>
                                        </div>
                                        <div className="bg-black/40 p-2 rounded border border-white/5 text-center">
                                            <div className="text-[8px] text-slate-500 uppercase">SL</div>
                                            <div className="text-[10px] text-red-400 font-bold">${sig.stopLoss}</div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic leading-tight border-t border-white/5 pt-2">{sig.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'RANKINGS' && (
                    <div className="h-full flex flex-col">
                        <div className="px-3 py-1 bg-orange-950/30 text-orange-300/50 text-[10px] uppercase tracking-wider flex items-center justify-between">
                            <div className="flex items-center gap-2"><Trophy size={12} /> Institutional Rankings</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {strategyRankings.map((strat, i) => (
                                <div key={i} className="flex items-center gap-4 bg-orange-950/10 border border-orange-900/20 p-4 rounded-xl group hover:border-orange-500/50">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 font-black text-xs">#{i+1}</div>
                                    <div className="text-[11px] text-white font-bold uppercase tracking-widest">{strat}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(50,20,0,0.05)_50%)] bg-[length:100%_4px] z-10"></div>
        </div>
    );
};

export default IntelTerminal;
