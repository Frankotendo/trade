
import React from 'react';
import { Asset } from '../types';
import { TrendingUp, TrendingDown, Maximize2, Zap } from 'lucide-react';

interface MarketWatchProps {
  assets: Asset[];
  activeAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
}

const MarketWatch: React.FC<MarketWatchProps> = ({ assets, activeAsset, onSelectAsset }) => {
  return (
    <div className="w-80 h-full border-r border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Zap size={14} className="text-green-500" />
          Market Watch
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-slate-500 font-mono">PNL: 0.00%</div>
          <Maximize2 size={14} className="text-slate-600 hover:text-slate-400 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.symbol}
            onClick={() => onSelectAsset(asset)}
            className={`group cursor-pointer p-4 rounded-md border transition-all relative overflow-hidden ${
              activeAsset?.symbol === asset.symbol
                ? 'bg-slate-900 border-slate-700 ring-1 ring-slate-700'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Asset Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Setup</div>
                <h3 className="text-lg font-bold text-slate-100 font-mono">{asset.symbol}</h3>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                asset.difficulty === 'Beginner' ? 'border-blue-500/50 text-blue-400' :
                asset.difficulty === 'Intermediate' ? 'border-yellow-500/50 text-yellow-400' :
                'border-red-500/50 text-red-400'
              }`}>
                {asset.difficulty}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed mb-4 group-hover:text-slate-400 transition-colors line-clamp-2">
              {asset.description}
            </p>

            {/* Price Info */}
            <div className={`flex items-center gap-2 p-2 rounded bg-slate-950/50 border border-slate-800/50 ${
              asset.change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {asset.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-xs font-mono font-bold">${asset.price.toLocaleString()}</span>
              <span className="text-[10px] font-bold">{asset.change > 0 ? '+' : ''}{asset.change}%</span>
            </div>
            
            {activeAsset?.symbol === asset.symbol && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketWatch;
