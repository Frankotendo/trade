
import React, { useState, useEffect } from 'react';
import { CorrelationData, Asset } from '../types';
import { calculateAssetCorrelations } from '../services/geminiService';
import { BarChart3, TrendingUp, TrendingDown, Maximize2, Minimize2, GitBranch, Target, Layers, Activity } from 'lucide-react';

interface CorrelationTerminalProps {
  assets: Asset[];
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const CorrelationTerminal: React.FC<CorrelationTerminalProps> = ({ assets, isMaximized, onToggleMaximize }) => {
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assets.length > 0) {
      loadCorrelations();
    }
  }, [assets.length]);

  const loadCorrelations = async () => {
    setLoading(true);
    const data = await calculateAssetCorrelations(assets.slice(0, 8));
    setCorrelations(data);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#050a0f] text-cyan-400 font-mono text-xs overflow-hidden">
      <div className="p-4 border-b border-cyan-900/30 bg-cyan-950/20 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Layers size={16} className="text-cyan-400" />
          <h2 className="text-[10px] font-black tracking-[0.4em] uppercase">Quant Correlation Matrix v2.2</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={loadCorrelations}
            disabled={loading}
            className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded hover:bg-cyan-500/20 transition-all font-bold uppercase tracking-widest text-cyan-400"
          >
            {loading ? 'Recalculating...' : 'SYNC_STATISTICS'}
          </button>
          <button onClick={onToggleMaximize} className="text-cyan-800 hover:text-cyan-400 p-1">
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <Activity className="w-12 h-12 text-cyan-500 animate-pulse" />
            <p className="text-cyan-400 uppercase tracking-[0.3em] font-black animate-pulse">Running Correlation Regressions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {correlations.map((corr, i) => (
              <div key={i} className="glass-panel border-cyan-900/20 p-6 rounded-2xl hover:border-cyan-500/40 transition-all group">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-cyan-950 flex items-center justify-center font-black text-cyan-400 border border-cyan-900/30">
                        {corr.base.substring(0, 3)}
                      </div>
                      <GitBranch size={14} className="text-cyan-800" />
                      <div className="w-8 h-8 rounded bg-cyan-950 flex items-center justify-center font-black text-white border border-cyan-900/30">
                        {corr.target.substring(0, 3)}
                      </div>
                   </div>
                   <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                     corr.regime === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' :
                     corr.regime === 'Inverse' ? 'bg-rose-500/10 text-rose-400' :
                     'bg-cyan-500/10 text-cyan-400'
                   }`}>
                     {corr.regime}
                   </div>
                </div>

                <div className="flex items-end gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[8px] text-cyan-700 font-black uppercase mb-2">
                       <span>Correlation Coefficient (r)</span>
                       <span>{corr.coefficient.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-cyan-900/30 relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20"></div>
                        <div 
                          className={`h-full transition-all duration-1000 ${corr.coefficient > 0 ? 'bg-emerald-500 ml-1/2' : 'bg-rose-500 mr-1/2'}`}
                          style={{ 
                            width: `${Math.abs(corr.coefficient * 50)}%`,
                            marginLeft: corr.coefficient > 0 ? '50%' : `${50 - Math.abs(corr.coefficient * 50)}%`
                          }}
                        ></div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
                  {corr.regime === 'Positive' ? 'Asset movements are highly synchronized. High risk of systemic failure if exposed to both.' : 
                   corr.regime === 'Inverse' ? 'Perfect hedging pair. Movement in base often dictates equal opposite movement in target.' :
                   'Weak statistical link. Decoupled alpha potential exists between these tickers.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-cyan-950/20 border-t border-cyan-900/30">
          <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-cyan-900/20">
              <Target size={20} className="text-cyan-500 shrink-0" />
              <div>
                  <h4 className="text-[10px] font-black uppercase text-cyan-400 mb-1">Hedging Intelligence Unit</h4>
                  <p className="text-[9px] text-cyan-800 font-bold leading-tight">
                    Correlation coefficients above 0.85 indicate extreme statistical dependency. 
                    Institutional bots use these to arbitrage price lags across venues. 
                    Watch for decoupling events to spot "Fake Outs."
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CorrelationTerminal;
