
import React from 'react';
import { TradeSetup, Asset, AssetClass } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Activity, ChevronRight, Maximize2, Minimize2, Globe, Bitcoin, Box, Layers } from 'lucide-react';

interface MissionHubProps {
  missions: TradeSetup[];
  currentMissionId: string | null;
  onSelectMission: (id: string) => void;
  targets: Record<string, Asset>;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const AssetIcon = ({ type }: { type: string }) => {
  switch (type) {
    case AssetClass.CRYPTO: return <Bitcoin size={14} className="text-orange-500" />;
    case AssetClass.FOREX: return <Globe size={14} className="text-blue-500" />;
    case AssetClass.STOCKS: return <Activity size={14} className="text-purple-500" />;
    case AssetClass.COMMODITIES: return <Box size={14} className="text-yellow-500" />;
    case AssetClass.INDICES: return <Layers size={14} className="text-green-500" />;
    default: return <DollarSign size={14} />;
  }
};

const MissionHub: React.FC<MissionHubProps> = ({ missions, currentMissionId, onSelectMission, targets, isMaximized, onToggleMaximize }) => {
  return (
    <div className="h-full flex flex-col bg-[#050a0f] border border-gray-800 rounded p-4 font-tech overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2 text-emerald-500">
          <Activity size={18} />
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase">Market Watch</h2>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-mono">PNL: {missions.filter(m => m.completed).length > 0 ? '+' + (missions.filter(m => m.completed).length * 15.4) + '%' : '0.00%'}</span>
            <button onClick={onToggleMaximize} className="text-gray-500 hover:text-white transition-colors">
                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {missions.map((mission) => {
          const isCurrent = mission.id === currentMissionId;
          const asset = targets[mission.assetId];
          
          return (
            <div 
              key={mission.id}
              onClick={() => onSelectMission(mission.id)}
              className={`
                group relative p-4 border transition-all duration-200 cursor-pointer overflow-hidden
                ${isCurrent 
                  ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : mission.completed 
                    ? 'bg-gray-900/20 border-gray-800 opacity-60 hover:opacity-100' 
                    : 'bg-gray-900/20 border-gray-800 hover:border-gray-600 hover:bg-gray-800/40'
                }
              `}
            >
              <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] ${isCurrent ? 'border-t-emerald-500' : 'border-t-gray-700'} transition-colors`}></div>

              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-mono mb-1">{mission.title.split(':')[0]}</span>
                    <h3 className={`font-bold text-sm tracking-wide ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                    {asset ? asset.ticker : 'UNKNOWN'}
                    </h3>
                </div>
                {mission.completed ? (
                  <span className="text-emerald-500 text-xs font-bold">WIN</span>
                ) : (
                  <span className={`text-[9px] px-1.5 py-0.5 border ${
                    mission.difficulty === 'Beginner' ? 'border-blue-900 text-blue-500' :
                    mission.difficulty === 'Intermediate' ? 'border-yellow-900 text-yellow-500' :
                    'border-red-900 text-red-500'
                  }`}>
                    {mission.difficulty.toUpperCase()}
                  </span>
                )}
              </div>
              
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed font-mono line-clamp-2">{mission.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                {asset && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-black/40 px-2 py-1 border border-gray-800">
                    <AssetIcon type={asset.type} />
                    <span>${asset.price.toFixed(2)}</span>
                    <span className={asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                    </span>
                    </div>
                )}
                
                {isCurrent && <ChevronRight size={14} className="text-emerald-500 animate-pulse" />}
              </div>
              
              {isCurrent && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-transparent"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MissionHub;