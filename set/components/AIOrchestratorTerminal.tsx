
import React, { useState, useEffect } from 'react';
import { OrchestratorAction, Asset, Position } from '../types';
import { executeOrchestratorLogic } from '../services/geminiService';
import { 
  Zap, Cpu, Shield, Layers, Radio, Target, Activity, Maximize2, Minimize2, 
  Terminal, Server, Globe, Box, Workflow, AlertCircle, Play, Pause, RefreshCw,
  Network, ArrowRightLeft, Database, Search
} from 'lucide-react';

interface AIOrchestratorTerminalProps {
  assets: Asset[];
  positions: Position[];
  equity: number;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const AIOrchestratorTerminal: React.FC<AIOrchestratorTerminalProps> = ({ assets, positions, equity, isMaximized, onToggleMaximize }) => {
  const [actions, setActions] = useState<OrchestratorAction[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAutoMode) {
      const interval = setInterval(runOrchestrator, 15000);
      return () => clearInterval(interval);
    }
  }, [isAutoMode]);

  const runOrchestrator = async () => {
    setLoading(true);
    const context = {
      marketCount: assets.length,
      activePositions: positions.length,
      portfolioEquity: equity,
      timestamp: Date.now()
    };
    const newActions = await executeOrchestratorLogic(context);
    setActions(prev => [...newActions, ...prev].slice(0, 50));
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-blue-500 font-mono text-xs overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,100,255,1)_0%,transparent_70%)]"></div>
      
      <div className="p-4 border-b border-blue-900/50 bg-black/80 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg border transition-all ${isAutoMode ? 'bg-blue-500/20 border-blue-400 animate-pulse' : 'bg-slate-900 border-slate-800'}`}>
            <Workflow size={20} className={isAutoMode ? 'text-blue-400' : 'text-slate-600'} />
          </div>
          <div>
            <h2 className="text-[10px] font-black tracking-[0.5em] uppercase text-blue-400">Autonomous AI Orchestrator</h2>
            <div className="flex items-center gap-3 mt-1 text-[8px] text-blue-900 font-black uppercase">
                <span className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${isAutoMode ? 'bg-blue-500 animate-ping' : 'bg-slate-800'}`}></div> God_Mode: {isAutoMode ? 'ENABLED' : 'MANUAL'}</span>
                <span className="flex items-center gap-1"><Server size={10} /> Cluster: APEX-DELTA-9</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setIsAutoMode(!isAutoMode)} className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase transition-all flex items-center gap-2 border ${isAutoMode ? 'bg-blue-500 text-black border-blue-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-blue-400'}`}>
                {isAutoMode ? <Pause size={12} /> : <Play size={12} />}
                {isAutoMode ? 'Deactivate' : 'Activate God Mode'}
            </button>
            <button onClick={onToggleMaximize} className="text-blue-900 hover:text-blue-400">{isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-blue-900/30 p-8 space-y-8 bg-black/40 overflow-y-auto custom-scrollbar">
           
           <div className="space-y-4">
              <div className="text-[10px] text-blue-900 font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                 <Network size={14} /> Station Synergy Matrix
              </div>
              
              <div className="space-y-3">
                {[
                  { station: 'INTELLIGENCE', feed: 'Rumor Decryption', load: 82, color: 'text-orange-500' },
                  { station: 'NEURAL LABS', feed: 'Quant Regression', load: 45, color: 'text-cyan-500' },
                  { station: 'TACTICAL', feed: 'Liquidity Grab', load: 94, color: 'text-emerald-500' }
                ].map((mod, i) => (
                  <div key={i} className="p-4 bg-blue-500/5 border border-blue-900/20 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-bl-full flex items-center justify-center opacity-20">
                        <ArrowRightLeft size={16} />
                    </div>
                    <div className={`text-[8px] font-black uppercase mb-1 ${mod.color}`}>{mod.station}</div>
                    <div className="text-[10px] text-white font-bold mb-3">{mod.feed}</div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{width:`${mod.load}%`}}></div>
                        </div>
                        <span className="text-[9px] font-black text-blue-900">{mod.load}%</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-3xl">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2"><Globe size={14}/> All-World Coverage</h4>
              <div className="space-y-4">
                 <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-slate-600 uppercase">Tracked Tickers</span>
                    <span className="text-white">12,400+</span>
                 </div>
                 <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-slate-600 uppercase">Exotic Vectors</span>
                    <span className="text-white">842</span>
                 </div>
                 <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-slate-600 uppercase">Cross-Chain Bridge</span>
                    <span className="text-emerald-500">OPTIMAL</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col p-8 space-y-6 relative overflow-hidden">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                 <Terminal size={16} className="text-blue-400" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Neural Sync Registry</span>
              </div>
              {loading && <div className="flex items-center gap-2 text-[10px] text-blue-400 font-black animate-pulse"><RefreshCw size={12} className="animate-spin" /> Handshaking...</div>}
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {actions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                   <Database size={64} className="text-blue-900 mb-6" />
                   <p className="text-xs uppercase tracking-[1em] font-black">Link Awaiting Input</p>
                </div>
              ) : (
                actions.map((act, i) => (
                  <div key={i} className={`p-5 rounded-2xl border bg-black/40 group hover:border-blue-500/50 transition-all animate-in slide-in-from-left-4 border-blue-900/30`}>
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-4">
                          <div className={`text-[8px] font-black px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/30`}>
                            {act.status}
                          </div>
                          <span className="text-[10px] font-black uppercase text-blue-200">{act.module}</span>
                       </div>
                       <span className="text-[9px] text-blue-900 font-bold">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-bold mb-3 leading-tight">{act.action}</p>
                    {act.result && (
                      <div className="p-3 bg-black rounded-xl border border-white/5 text-[9px] text-blue-400 italic font-mono leading-relaxed">
                         {" >> "} SYNC_RESULT: {act.result}
                      </div>
                    )}
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIOrchestratorTerminal;
