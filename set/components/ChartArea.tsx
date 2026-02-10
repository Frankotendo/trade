
import React, { useMemo } from 'react';
import { Asset } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Maximize2, MoreHorizontal } from 'lucide-react';

interface ChartAreaProps {
  activeAsset: Asset | null;
}

const ChartArea: React.FC<ChartAreaProps> = ({ activeAsset }) => {
  // Generate dummy data based on the asset
  const data = useMemo(() => {
    if (!activeAsset) return [];
    const points = 30;
    const base = activeAsset.price;
    const result = [];
    let current = base - (base * 0.05);
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.45) * (base * 0.01);
      current += change;
      result.push({
        time: i,
        value: Number(current.toFixed(activeAsset.symbol.includes('EUR') ? 4 : 2)),
      });
    }
    return result;
  }, [activeAsset]);

  if (!activeAsset) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-600 relative overflow-hidden">
        <div className="scanline"></div>
        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="flex gap-2">
            <div className="w-1 h-8 bg-slate-800 rounded-full animate-pulse delay-75"></div>
            <div className="w-1 h-12 bg-slate-700 rounded-full animate-pulse delay-150"></div>
            <div className="w-1 h-16 bg-slate-600 rounded-full animate-pulse delay-200"></div>
            <div className="w-1 h-12 bg-slate-700 rounded-full animate-pulse delay-300"></div>
            <div className="w-1 h-8 bg-slate-800 rounded-full animate-pulse delay-500"></div>
          </div>
          <p className="uppercase tracking-[0.2em] text-sm font-medium animate-pulse">Select asset to initialize chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
      <div className="scanline"></div>
      <div className="p-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold font-mono text-slate-300">{activeAsset.symbol} <span className="text-slate-600">/ 1H CHART</span></h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></span>
            <span className="text-[10px] text-green-500 font-bold uppercase">Live Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <span>O: {activeAsset.price.toFixed(2)}</span>
            <span className="ml-2">H: {(activeAsset.price * 1.02).toFixed(2)}</span>
            <span className="ml-2">L: {(activeAsset.price * 0.98).toFixed(2)}</span>
            <span className="ml-2">C: {(activeAsset.price * 1.01).toFixed(2)}</span>
          </div>
          <Maximize2 size={14} className="text-slate-600 hover:text-slate-400 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 p-4 pb-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
            <XAxis 
                dataKey="time" 
                hide 
            />
            <YAxis 
              domain={['auto', 'auto']} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }}
              itemStyle={{ color: '#22c55e', fontFamily: 'monospace' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#22c55e" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartArea;
