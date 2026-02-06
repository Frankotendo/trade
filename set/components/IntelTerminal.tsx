
import React from 'react';
import { NewsItem, WhaleAlert } from '../types';
import { AlertTriangle, Radio, ExternalLink, Activity, Anchor, Maximize2, Minimize2 } from 'lucide-react';

interface IntelTerminalProps {
    news: NewsItem[];
    whales: WhaleAlert[];
    onRefreshNews: () => void;
    isMaximized: boolean;
    onToggleMaximize: () => void;
}

const IntelTerminal: React.FC<IntelTerminalProps> = ({ news, whales, onRefreshNews, isMaximized, onToggleMaximize }) => {
    return (
        <div className="h-full flex flex-col bg-[#110a05] border border-orange-900/30 rounded relative overflow-hidden font-mono shadow-[inset_0_0_20px_rgba(255,100,0,0.05)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#2a1708] border-b border-orange-900/50">
                <div className="flex items-center gap-2 text-orange-500">
                    <Radio size={16} className="animate-pulse" />
                    <span className="text-xs font-bold tracking-widest uppercase">Global Intel Net</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onRefreshNews}
                        className="text-[10px] bg-orange-900/20 text-orange-400 px-2 py-0.5 rounded border border-orange-800/50 hover:bg-orange-800/30 transition-colors"
                    >
                        REFRESH SAT-LINK
                    </button>
                    <div className="w-[1px] h-4 bg-orange-900/50"></div>
                    <button 
                        onClick={onToggleMaximize} 
                        className="text-orange-500 hover:text-orange-200 transition-colors"
                        title={isMaximized ? "Minimize Panel" : "Maximize Panel"}
                    >
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-rows-2 gap-0 min-h-0">
                {/* Whale Watch Section */}
                <div className="row-span-1 flex flex-col border-b border-orange-900/30 min-h-0">
                    <div className="px-3 py-1 bg-orange-950/30 text-orange-300/50 text-[10px] uppercase tracking-wider flex items-center gap-2">
                        <Anchor size={12} /> Whale Watch
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {whales.length === 0 ? (
                            <div className="text-orange-900/40 text-xs text-center mt-4">NO LARGE MOVEMENT DETECTED</div>
                        ) : (
                            whales.slice().reverse().map((w) => (
                                <div key={w.id} className="flex items-center justify-between text-[11px] font-mono border-l-2 border-orange-700 pl-2 bg-orange-900/10 p-1 hover:bg-orange-900/20 transition-colors">
                                    <span className="text-orange-200 font-bold">{w.symbol}</span>
                                    <span className={w.side === 'BUY' ? 'text-green-500' : 'text-red-500'}>{w.side}</span>
                                    <span className="text-orange-300">${w.size.toLocaleString()}</span>
                                    <span className="text-orange-500/50">{new Date(w.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* News Wire Section */}
                <div className="row-span-1 flex flex-col min-h-0">
                    <div className="px-3 py-1 bg-orange-950/30 text-orange-300/50 text-[10px] uppercase tracking-wider flex items-center gap-2">
                        <Activity size={12} /> News Wire
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                        {news.length === 0 ? (
                            <div className="text-orange-900/40 text-xs text-center mt-4">WAITING FOR UPLINK...</div>
                        ) : (
                            news.map((n) => (
                                <div key={n.id} className="group relative border border-orange-900/20 bg-orange-900/5 p-2 rounded hover:bg-orange-900/20 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[9px] px-1 rounded ${
                                            n.sentiment === 'Positive' ? 'bg-green-900/30 text-green-500' :
                                            n.sentiment === 'Negative' ? 'bg-red-900/30 text-red-500' :
                                            'bg-gray-800 text-gray-400'
                                        }`}>{n.sentiment.toUpperCase()}</span>
                                        <span className="text-[9px] text-orange-600">{n.source}</span>
                                    </div>
                                    <a href={n.url} target="_blank" rel="noreferrer" className="text-xs text-orange-100 font-semibold hover:underline block leading-tight mb-1">
                                        {n.headline}
                                    </a>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-orange-700">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                        {n.url && <ExternalLink size={10} className="text-orange-500" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(50,20,0,0.05)_50%)] bg-[length:100%_4px] z-10"></div>
        </div>
    );
};

export default IntelTerminal;
