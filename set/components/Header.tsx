
import React from 'react';
import { Activity, Target, BookOpen, ChevronDown } from 'lucide-react';
import { Station } from '../types';

interface HeaderProps {
  currentStation: Station;
  setStation: (station: Station) => void;
  equity: number;
}

const Header: React.FC<HeaderProps> = ({ currentStation, setStation, equity }) => {
  const stations = [
    { id: Station.ACADEMY, label: 'Academy', icon: <BookOpen size={18} />, color: 'text-blue-500' },
    { id: Station.TACTICAL, label: 'Tactical Terminal', icon: <Target size={18} />, color: 'text-emerald-500' },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8 z-50 shadow-2xl shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Activity className="text-emerald-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-100 flex items-center gap-2">
              TRADESIM <span className="text-emerald-500 neon-glow">ALPHA</span>
            </h1>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Neural Link v5.2</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-4 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/50">
        {stations.map((station) => (
          <button
            key={station.id}
            onClick={() => setStation(station.id)}
            className={`
              flex items-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
              ${currentStation === station.id
                ? 'bg-slate-800 text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)] ring-1 ring-white/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }
            `}
          >
            <span className={currentStation === station.id ? station.color : 'text-slate-600'}>
              {station.icon}
            </span>
            {station.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-8">
        <div className="h-10 w-px bg-slate-800"></div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Net Exposure</div>
          <div className="text-emerald-500 font-mono text-lg font-black tracking-tight">
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-700 transition-colors">
            <ChevronDown size={18} />
        </div>
      </div>
    </header>
  );
};

export default Header;
