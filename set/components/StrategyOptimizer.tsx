
import React, { useState, useEffect } from 'react';
import { OptimizationReport, BotStrategy } from '../types';
import { generateDeepOptimization } from '../services/geminiService';
import { 
  Zap, Crosshair, BarChart3, TrendingUp, Settings2, 
  Cpu, ShieldCheck, Activity, Loader2, Sparkles, 
  CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';

interface StrategyOptimizerProps {
  stats: any;
  logs: any[];
  currentStrategy: BotStrategy;
  onApplyOptimization: () => void;
}

const StrategyOptimizer: React.FC<StrategyOptimizerProps> = ({ stats, logs, currentStrategy, onApplyOptimization }) => {
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [tuningStep, setTuningStep] = useState(0);

  const runOptimization = async () => {
    setLoading(true);
    const result = await generateDeepOptimization(stats, logs, currentStrategy);
    setReport(result);
    setLoading(false);
  };

  useEffect(() => {
    if (!report && !loading) {
      runOptimization();
    }
  }, []);

  const RadarChart = ({ current, suggested }: { current: any, suggested: any }) => {
    const keys = Object.keys(current);
    const points = keys.length;
    const radius = 80;
    const center = 100;

    const getPoints = (data: any) => {
      return keys.map((key, i) => {
        const val = data[key] / 100;
        const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
        const x = center + radius * val * Math.cos(angle);
        const y = center + radius * val * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
    };

    return (
      <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
        {/* Grids */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((r, i) => (
          <circle key={i} cx={center} cy={center} r={radius * r} fill="none" stroke="#1e293b" strokeWidth="1" />
        ))}
        {/* Axels */}
        {keys.map((_, i) => {
            const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
            return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="#1e293b" strokeWidth="1" />;
        })}
        {/* Current Data */}
        <polygon points={getPoints(current)} fill="rgba(244, 63, 94, 0.1)" stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.5" />
        {/* Suggested Data */}
        <polygon points={getPoints(suggested)} fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth="2" className="animate-pulse" />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] text-slate-200 font-mono text-xs overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="p-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <Settings2 size={24} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-[0.4em] uppercase text-white">Neural Strategy Lab</h2>
            <div className="flex items-center gap-3 mt-1 text-[9px] text-cyan-700 font-black uppercase">
                <span className="flex items-center gap-1.5"><Activity size={12}/> Analysis_Protocol: DEEP_SCAN_v5</span>
                <span className="w-[1px] h-3 bg-slate-800"></span>
                <span className="flex items-center gap-1.5 text-amber-500/70"><RefreshCw size={12} className="animate-spin" /> Live_Tuning_Active</span>
            </div>
          </div>
        </div>
        <button 
          onClick={runOptimization}
          disabled={loading}
          className="px-6 py-2.5 bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(34,211,238,0.3)] disabled:opacity-30"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Recalculate_Alpha
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
             <div className="relative">
                <div className="w-24 h-24 border-8 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
                <Cpu className="absolute inset-0 m-auto text-cyan-500/30 animate-pulse" size={32} />
             </div>
             <div className="text-center space-y-3">
                <p className="text-cyan-400 font-black uppercase tracking-[0.5em] text-sm animate-pulse">Running Neural Optimization...</p>
                <div className="flex flex-col gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                   <span>Iterating 10,000 backtest scenarios</span>
                   <span>Fine-tuning RSI/EMA convergence vectors</span>
                </div>
             </div>
          </div>
        ) : report ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-4 glass-panel p-8 rounded-[2.5rem] border-slate-800 flex flex-col items-center">
                  <div className="text-[10px] text-slate-500 uppercase font-black mb-8 tracking-widest">Performance Matrix Comparison</div>
                  <RadarChart current={report.currentMetrics} suggested={report.suggestedMetrics} />
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                     <div className="flex items-center gap-2 text-[9px] font-bold text-rose-500 uppercase"><div className="w-2 h-2 bg-rose-500"></div> Current</div>
                     <div className="flex items-center gap-2 text-[9px] font-bold text-cyan-400 uppercase"><div className="w-2 h-2 bg-cyan-500 animate-pulse"></div> Optimized</div>
                  </div>
                  <div className="mt-10 space-y-4 w-full border-t border-slate-800 pt-8">
                     {Object.keys(report.suggestedMetrics).map(key => (
                       <div key={key} className="flex justify-between items-center text-[9px] uppercase font-bold">
                          <span className="text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-cyan-400">+{report.suggestedMetrics[key as keyof typeof report.suggestedMetrics] - report.currentMetrics[key as keyof typeof report.currentMetrics]}% Boost</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="lg:col-span-8 space-y-8">
                  <div className="glass-panel p-10 rounded-[3rem] border-slate-800 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Sparkles size={160}/></div>
                     <div className="text-[10px] text-cyan-600 font-black uppercase mb-6 flex items-center gap-2"><Sparkles size={14}/> Neural Analysis Summary</div>
                     <p className="text-sm text-slate-200 leading-relaxed font-bold italic">
                       "{report.strategicNarrative}"
                     </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     <div className="text-[10px] text-slate-500 uppercase font-black px-2 flex items-center gap-2"><TrendingUp size={14}/> Proposed Parameter Tuning</div>
                     {report.parameterAdjustments.map((adj, i) => (
                       <div key={i} className="glass-panel p-6 rounded-2xl border-slate-800 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                          <div className="flex items-center gap-6">
                             <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                                <Settings2 size={18} />
                             </div>
                             <div>
                                <div className="text-[10px] text-white font-black uppercase tracking-widest">{adj.parameter}</div>
                                <div className="flex items-center gap-4 mt-2">
                                   <span className="text-xs text-slate-500 font-mono line-through">{adj.oldValue}</span>
                                   <div className="w-4 h-px bg-slate-800"></div>
                                   <span className="text-xs text-emerald-400 font-mono font-black">{adj.newValue}</span>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[9px] text-slate-600 uppercase font-black mb-1">Expected Impact</div>
                             <div className="text-[10px] text-cyan-400 font-black uppercase">{adj.impact}</div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-10 bg-cyan-500/5 border-2 border-cyan-500/20 rounded-[3rem] text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
               <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Apply Neural Re-Calibration?</h3>
               <p className="text-slate-500 mb-8 text-sm max-w-xl mx-auto font-bold uppercase tracking-widest">
                 System will restart the execution module with these specific parameters to maximize risk-to-reward vectors.
               </p>
               <button 
                onClick={onApplyOptimization}
                className="px-12 py-5 bg-cyan-500 text-black font-black uppercase tracking-[0.4em] text-xs rounded-2xl hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(34,211,238,0.4)]"
               >
                 Execute_Tuning_Handshake
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-30">
             <AlertTriangle size={64} className="mb-4" />
             <p className="text-sm uppercase tracking-[1em] font-black">Link Required for Optimization</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                 <ShieldCheck size={14} /> Neural_Gate: VERIFIED
              </div>
          </div>
          <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
              Diagnostic_Session: 0x82...A22 // v5.2.0
          </div>
      </div>
    </div>
  );
};

export default StrategyOptimizer;
