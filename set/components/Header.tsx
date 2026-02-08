
import React from 'react';
import { Activity, Terminal as TerminalIcon, Cpu, GraduationCap, Settings, Waves, Target, Radio, Layers, Newspaper, Workflow } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  equity: number;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode, equity }) => {
  const modes = [
    { id: AppMode.TERMINAL, label: 'TERMINAL', icon: <TerminalIcon size={16} /> },
    { id: AppMode.INTEL, label: 'INTEL', icon: <Cpu size={16} /> },
    { id: AppMode.SHADOW_RELAY, label: 'SHADOW', icon: <Radio size={16} /> },
    { id: AppMode.NEWS_DECODER, label: 'DECODER', icon: <Newspaper size={16} /> },
    { id: AppMode.AI_ORCHESTRATOR, label: 'ORCHESTRATOR', icon: <Workflow size={16} /> },
    { id: AppMode.QUANT_MATRIX, label: 'QUANT', icon: <Layers size={16} /> },
    { id: AppMode.LIQUIDITY_MAP, label: 'LIQUIDITY', icon: <Waves size={16} /> },
    { id: AppMode.EXECUTION, label: 'EXECUTION', icon: <Target size={16} /> },
    { id: AppMode.ACADEMY, label: 'ACADEMY', icon: <GraduationCap size={16} /> },
    { id: AppMode.SIM_MODE, label: 'SIM MODE', icon: <Settings size={16} /> },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
            <Activity className="text-green-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-slate-100 flex items-center gap-2">
              TRADESIM <span className="text-green-500 neon-glow">ALPHA</span>
            </h1>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 uppercase font-medium">Apex Neural Link</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-[60%] no-scrollbar">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setMode(mode.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-semibold transition-all shrink-0 ${
              currentMode === mode.id
                ? 'bg-slate-800 text-slate-100 shadow-inner'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-tight">Portfolio Equity</div>
          <div className="text-green-500 font-mono font-bold">
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[10px] opacity-70">(Paper)</span>
          </div>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
};

export default Header;
