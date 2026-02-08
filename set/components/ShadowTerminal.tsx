
import React, { useState, useRef, useEffect } from 'react';
import { ShadowIntel } from '../types';
import { fetchShadowIntel } from '../services/geminiService';
import { 
  Search, ShieldAlert, Zap, Radio, Terminal, Maximize2, Minimize2, 
  Eye, EyeOff, Hash, Clock, ShieldCheck, Activity, Wifi, 
  Binary, Cpu, Filter, AlertTriangle, Fingerprint
} from 'lucide-react';

interface ShadowTerminalProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const ShadowTerminal: React.FC<ShadowTerminalProps> = ({ isMaximized, onToggleMaximize }) => {
  const [query, setQuery] = useState('');
  const [intel, setIntel] = useState<ShadowIntel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [bypassedIds, setBypassedIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'ALL', label: 'ALL_CHANNELS', icon: <Wifi size={12} /> },
    { id: 'DARK_POOL', label: 'DARK_POOL', icon: <Binary size={12} /> },
    { id: 'INSIDER', label: 'INSIDER_脉', icon: <Fingerprint size={12} /> },
    { id: 'MACRO_LEAK', label: 'MACRO_LEAK', icon: <ShieldAlert size={12} /> },
    { id: 'HFT_ANOMALY', label: 'HFT_ANOMALY', icon: <Cpu size={12} /> },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setIsDecrypted(false);
    const results = await fetchShadowIntel(query, activeCategory === 'ALL' ? undefined : activeCategory);
    setIntel(results);
    setLoading(false);
    setTimeout(() => setIsDecrypted(true), 1200);
  };

  const toggleBypass = (id: string) => {
    setBypassedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#000800] text-[#00ff41] font-mono text-xs overflow-hidden relative selection:bg-[#00ff41] selection:text-black">
      {/* Matrix digital rain effect overlay (Subtle) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* HUD Header */}
      <div className="p-4 border-b border-[#003b00] bg-black/80 flex items-center justify-between relative z-10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#00ff41]/10 rounded-lg border border-[#00ff41]/20">
            <Radio size={18} className="text-[#00ff41] animate-pulse" />
          </div>
          <div>
            <h2 className="text-[10px] font-black tracking-[0.6em] uppercase text-[#00ff41]">Shadow Relay Hub v2.0</h2>
            <div className="flex items-center gap-3 mt-1 text-[8px] text-[#004d00] font-black uppercase">
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-ping"></div> Neural Uplink: Active</span>
                <span className="flex items-center gap-1"><Activity size={10} /> Latency: 4ms</span>
                <span className="flex items-center gap-1"><ShieldCheck size={10} /> Protocol: APEX_V8</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex bg-black border border-[#003b00] rounded-lg p-1">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${activeCategory === cat.id ? 'bg-[#00ff41] text-black' : 'text-[#004d00] hover:text-[#00ff41]'}`}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>
            <button onClick={onToggleMaximize} className="text-[#004d00] hover:text-[#00ff41] transition-colors p-2">
                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
        </div>
      </div>

      {/* Ticker for Alpha alerts */}
      <div className="h-8 bg-[#001a00] border-b border-[#003b00] flex items-center overflow-hidden">
        <div className="px-4 bg-[#00ff41] text-black text-[9px] font-black h-full flex items-center shrink-0 tracking-widest uppercase">Live_Alpha</div>
        <div className="flex-1 whitespace-nowrap overflow-hidden">
            <div className="animate-marquee inline-flex gap-12 text-[9px] font-bold text-[#008000] uppercase py-2">
                <span>[SCAN] Unusual Dark Pool activity on BTC @ $94,800. Large institutional buy-wall detected.</span>
                <span>[LEAK] Unverified report of FOMC policy pivot in Q3 leaked from internal memo.</span>
                <span>[HFT] High-frequency bot cluster active on ETH options. Gamma squeeze potential 68%.</span>
                <span>[INSIDER] Net outflow of stables from Whale wallet 0x4f... to exchange wallet 0x92...</span>
            </div>
        </div>
      </div>

      <div className="p-8 bg-black/40 border-b border-[#003b00] relative z-10">
        <form onSubmit={handleSearch} className="max-w-5xl mx-auto flex gap-6">
          <div className="flex-1 relative group">
            <div className="absolute -inset-1 bg-[#00ff41]/5 rounded-2xl blur group-focus-within:bg-[#00ff41]/20 transition duration-1000"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#004d00]" size={20} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query institutional rumors, dark pool anomalies, or restricted leaks..."
                className="w-full bg-black border-2 border-[#003b00] p-5 pl-14 rounded-2xl text-[#00ff41] text-sm outline-none focus:border-[#00ff41] transition-all placeholder:text-[#002b00] font-mono shadow-[inset_0_0_20px_rgba(0,255,0,0.05)]"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="px-10 bg-[#00ff41]/10 border-2 border-[#00ff41]/30 text-[#00ff41] font-black rounded-2xl hover:bg-[#00ff41] hover:text-black transition-all disabled:opacity-30 uppercase text-[10px] tracking-[0.4em] shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            {loading ? 'Decrypting...' : 'Scan_Network'}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10">
        {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-8">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-8 border-[#00ff41]/10 border-t-[#00ff41] rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-[#00ff41]/5 border-b-[#00ff41] rounded-full animate-spin-reverse"></div>
                    <Cpu className="absolute inset-0 m-auto text-[#00ff41] animate-pulse" size={32} />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[#00ff41] animate-pulse uppercase tracking-[0.8em] text-sm font-black">Intercepting Signal...</p>
                    <p className="text-[10px] text-[#004d00] uppercase font-bold">Bypassing Deep Web Proxy Relay [Hop: 4/12]</p>
                </div>
            </div>
        ) : intel.length > 0 ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8">
            {intel.map((item, i) => {
                const isBypassed = bypassedIds.has(item.id);
                return (
                    <div key={item.id} className="glass-panel border-[#003b00] p-10 rounded-[2.5rem] group hover:border-[#00ff41]/50 transition-all duration-500 animate-in slide-in-from-bottom-8 relative overflow-hidden" style={{ animationDelay: `${i * 150}ms` }}>
                        {/* Critical Glitch Overlay */}
                        {item.threatLevel === 'Critical' && (
                            <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse"></div>
                        )}
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl bg-[#001a00] flex items-center justify-center border border-[#003b00] transition-colors ${item.threatLevel === 'Critical' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'group-hover:border-[#00ff41]/50'}`}>
                                    <Terminal size={24} className={item.threatLevel === 'Critical' ? 'text-red-500' : 'text-[#00ff41]'} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-white uppercase tracking-widest">{item.source}</h3>
                                        <span className="text-[8px] bg-black border border-[#003b00] px-2 py-0.5 rounded text-[#004d00] font-black">{item.verificationSeal}</span>
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <span className="text-[10px] text-[#008000] font-black uppercase flex items-center gap-1.5">
                                            <Clock size={12} /> {new Date(item.timestamp).toLocaleTimeString()}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border shadow-lg ${
                                            item.threatLevel === 'Critical' ? 'bg-red-500/10 border-red-500 text-red-500' :
                                            item.threatLevel === 'High' ? 'bg-orange-500/10 border-orange-500 text-orange-500' :
                                            'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41]'
                                        }`}>
                                            {item.threatLevel} PRIORITY
                                        </span>
                                        <span className="text-[10px] text-[#004d00] font-black uppercase flex items-center gap-1.5 border border-[#003b00] px-2 rounded-lg">
                                            <AlertTriangle size={12} /> Expiry: {item.expiryMinutes}m
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <div className="text-[10px] font-black uppercase text-[#004d00]">Signal Accuracy</div>
                                <div className="w-32 h-2 bg-black rounded-full overflow-hidden border border-[#003b00]">
                                    <div className="h-full bg-[#00ff41] shadow-[0_0_10px_#00ff41]" style={{ width: `${item.confidence}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 relative z-10">
                            <div className="text-[10px] text-[#004d00] font-black uppercase mb-3 flex items-center gap-2">
                                 <ShieldAlert size={14}/> Decrypted Summary
                            </div>
                            <p className="text-sm text-[#00ff41]/90 leading-relaxed font-bold">
                                {isDecrypted ? item.summary : Array.from({length: item.summary.length}).map(() => String.fromCharCode(33 + Math.random() * 94)).join('')}
                            </p>
                        </div>

                        <div className="bg-black/80 p-8 rounded-3xl border border-[#003b00] relative group/fragment overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-[10px] text-[#004d00] font-black uppercase flex items-center gap-2">
                                     <Hash size={14}/> Raw Signal Fragment
                                </div>
                                <button 
                                    onClick={() => toggleBypass(item.id)}
                                    className="px-4 py-1.5 bg-[#00ff41]/10 border border-[#00ff41]/30 rounded-full text-[9px] font-black uppercase hover:bg-[#00ff41] hover:text-black transition-all flex items-center gap-2"
                                >
                                    {isBypassed ? <EyeOff size={12}/> : <Eye size={12}/>}
                                    {isBypassed ? 'Restore_Mask' : 'Bypass_Filter'}
                                </button>
                            </div>
                            
                            <p className={`text-[11px] leading-relaxed font-mono transition-all duration-500 ${isDecrypted ? (isBypassed ? 'text-[#00ff41]/80' : 'text-[#001a00] bg-[#001a00] selection:bg-[#00ff41]') : 'text-[#001a00] animate-pulse'}`}>
                                {isDecrypted ? item.rawFragment : "ENCRYPTED_PACKET_LOSS_RETRYING..."}
                            </p>

                            {!isBypassed && isDecrypted && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
                                    <div className="text-[10px] font-black uppercase text-[#004d00] border border-[#003b00] px-4 py-2 bg-black rounded-lg">DATA_MASKED // CLICK BYPASS TO UNREDACT</div>
                                </div>
                            )}

                            <div className="flex gap-2 mt-6">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-[9px] bg-[#00ff41]/5 border border-[#00ff41]/20 px-3 py-1.5 rounded-lg text-[#008000] font-black uppercase tracking-widest">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <Zap size={64} className="text-[#003b00] mb-8" />
            <p className="text-sm uppercase tracking-[1em] font-black text-[#004d00]">Shadow Relay Idle</p>
            <p className="text-[10px] uppercase mt-4 text-[#002b00] font-bold">Awaiting high-priority interception queries...</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#001a00] border-t border-[#003b00] flex justify-between items-center z-20">
          <div className="flex gap-10">
            <div className="flex items-center gap-3 text-[10px] text-[#004d00] font-black uppercase">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-pulse"></div>
                    Node: HK-SHADOW-01
                </div>
                <ChevronRight size={10} />
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                    Relay: LUX-GATE-04
                </div>
                <ChevronRight size={10} />
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-pulse"></div>
                    Endpoint: TOR-EXIT-92
                </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
              <span className="text-[10px] text-[#004d00] font-black italic">ENCRYPTION: AES-256 GCM</span>
              <span className="text-[10px] text-[#008000] font-black uppercase tracking-[0.2em] animate-pulse">Scanning Flux...</span>
          </div>
      </div>

      <style>{`
          @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
          }
          .animate-marquee {
              animation: marquee 30s linear infinite;
          }
          @keyframes spin-reverse {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); }
          }
          .animate-spin-reverse {
              animation: spin-reverse 2s linear infinite;
          }
      `}</style>
    </div>
  );
};

const ChevronRight = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

export default ShadowTerminal;
