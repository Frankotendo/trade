
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import MissionHub from './components/MissionHub';
import Visualizer from './components/Visualizer';
import Terminal from './components/Terminal';
import IntelTerminal from './components/IntelTerminal';
import ShadowTerminal from './components/ShadowTerminal';
import CorrelationTerminal from './components/CorrelationTerminal';
import LiquidityTerminal from './components/LiquidityTerminal';
import ExecutionTerminal from './components/ExecutionTerminal';
import NewsDecoderTerminal from './components/NewsDecoderTerminal';
import AIOrchestratorTerminal from './components/AIOrchestratorTerminal';
import TutorBoard from './components/TutorBoard';
import BossWidget from './components/BossWidget';
import { AppMode, LayoutMode, Asset, TerminalMessage, TradeSetup, NewsItem, WhaleAlert, Lecture, Position, BotStrategy, TradeAction, AssetClass } from './types';
import { SYSTEM_WELCOME, INITIAL_ASSETS } from './constants';
import { executeCommand, generateSpeech, generateNewMissions, fetchMarketNews, executeBotStrategy, generateLecture, getProfitabilityTips } from './services/geminiService';
import { MarketService, getLiveAssetList } from './services/marketService';
import { Activity, Maximize2, MoveHorizontal, Cpu, TrendingUp, Lightbulb, ChevronRight, Minimize2 } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TERMINAL);
  const [layout, setLayout] = useState<LayoutMode>(LayoutMode.STANDARD);
  const [focusComponent, setFocusComponent] = useState<string | null>(null);
  
  const [missions, setMissions] = useState<TradeSetup[]>([]);
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);
  const [targets, setTargets] = useState<Record<string, Asset>>({});
  const [news, setNews] = useState<NewsItem[]>([]);
  const [whales, setWhales] = useState<WhaleAlert[]>([]);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [isLectureLoading, setIsLectureLoading] = useState(false);
  const [profitabilityTips, setProfitabilityTips] = useState<string[]>([]);
  
  const [equity, setEquity] = useState(100000.00);
  const [positions, setPositions] = useState<Position[]>([]);
  const [botStats, setBotStats] = useState({ wins: 0, losses: 0, totalTrades: 0, totalPnl: 0 });
  
  const [isBotActive, setIsBotActive] = useState(false);
  const [botStrategy, setBotStrategy] = useState<BotStrategy>(BotStrategy.SMC_ICT);
  const [botLogs, setBotLogs] = useState<TerminalMessage[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const [messages, setMessages] = useState<TerminalMessage[]>([
    { type: 'system', content: SYSTEM_WELCOME + "\n\n>>> UPLINK: STABLE\n>>> APEX_CORE: ELITE_PROFESSIONAL_ACTIVE.", timestamp: new Date() }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const marketServiceRef = useRef<MarketService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeAsset = useMemo(() => {
    const m = missions.find(m => m.id === currentMissionId);
    const id = m?.assetId || (Object.keys(targets)[0]);
    return targets[id] || null;
  }, [missions, currentMissionId, targets]);

  const toggleFocus = (id: string) => {
    if (focusComponent === id) {
        setFocusComponent(null);
        setLayout(LayoutMode.STANDARD);
    } else {
        setFocusComponent(id);
        setLayout(LayoutMode.FOCUS);
    }
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const playPCM = async (bytes: Uint8Array) => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    setIsSpeaking(true);
    source.onended = () => setIsSpeaking(false);
    source.start();
  };

  const totalEquity = useMemo(() => {
    const unrealized = positions.reduce((acc, pos) => {
        const currentAsset = (Object.values(targets) as Asset[]).find(t => t.ticker === pos.symbol || t.id === pos.symbol);
        return currentAsset ? acc + (currentAsset.price - pos.entryPrice) * (pos.type === 'LONG' ? 1 : -1) * pos.amount : acc;
    }, 0);
    return equity + unrealized;
  }, [equity, positions, targets]);

  useEffect(() => {
    const init = async () => {
      const initialTargets: Record<string, Asset> = {};
      INITIAL_ASSETS.forEach(a => { initialTargets[a.id] = a; });
      setTargets(initialTargets);
      
      const shadowMissions: TradeSetup[] = INITIAL_ASSETS.slice(0, 6).map(a => ({
          id: `shadow-${a.id}`,
          assetId: a.id,
          title: `ANALYSIS: ${a.ticker}`,
          description: `Identify institutional Fair Value Gaps (FVG) on the 1H timeframe.`,
          difficulty: a.difficulty,
          completed: false
      }));
      setMissions(shadowMissions);
      setCurrentMissionId(shadowMissions[0].id);

      try {
          const aiMissions = await generateNewMissions(5);
          if (aiMissions && aiMissions.length > 0) {
              setMissions(aiMissions);
              setCurrentMissionId(aiMissions[0].id);
          }
      } catch (e) {}
      setNews(await fetchMarketNews());
    };
    
    init();

    marketServiceRef.current = new MarketService(
      (updates) => setTargets(prev => {
        const next = { ...prev };
        updates.forEach(u => { if (u.id && next[u.id]) next[u.id] = { ...next[u.id], ...u }; });
        return next;
      }),
      (alert) => setWhales(prev => [...prev.slice(-19), alert])
    );
    marketServiceRef.current.connect(getLiveAssetList());
    return () => marketServiceRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (activeAsset) {
        const loadTips = async () => {
            const tips = await getProfitabilityTips(activeAsset.ticker, botStrategy);
            setProfitabilityTips(tips);
        };
        loadTips();
    }
  }, [activeAsset?.ticker, botStrategy]);

  const processTradeAction = (action: TradeAction, origin: 'MANUAL' | 'BOT') => {
    const { type, amount, price, symbol, confidence = 50, analysis, assetClass = AssetClass.CRYPTO } = action;
    const slippage = 1.0002;

    if (type === 'BUY') {
        const adjustedPrice = price * slippage;
        const cost = amount * adjustedPrice;
        if (cost <= equity) {
            setEquity(prev => prev - cost);
            setPositions(prev => {
                const existing = prev.find(p => p.symbol === symbol && p.type === 'LONG');
                if (existing) {
                    const newAmount = existing.amount + amount;
                    const newPrice = ((existing.entryPrice * existing.amount) + (adjustedPrice * amount)) / newAmount;
                    return prev.map(p => (p.symbol === symbol && p.type === 'LONG') ? { ...p, amount: newAmount, entryPrice: newPrice } : p);
                }
                return [...prev, { symbol, amount, entryPrice: adjustedPrice, type: 'LONG', assetClass: assetClass as AssetClass }];
            });
            const msg = `[ALPHA_FILL] BOUGHT ${amount.toFixed(4)} ${symbol} @ $${adjustedPrice.toFixed(2)}`;
            if (origin === 'BOT') setBotLogs(prev => [{ type: 'bot', content: msg, timestamp: new Date(), impact: `-$${cost.toFixed(2)}`, confidence, reasoning: analysis }, ...prev.slice(0, 49)]);
            else setMessages(prev => [...prev, { type: 'success', content: msg, timestamp: new Date() }]);
        }
    } else if (type === 'CLOSE' || type === 'SELL') {
        const posIndex = positions.findIndex(p => p.symbol === symbol);
        if (posIndex !== -1) {
            const pos = positions[posIndex];
            const currentAsset = (Object.values(targets) as Asset[]).find(t => t.id === symbol || t.ticker === symbol);
            const exitPrice = (currentAsset ? currentAsset.price : price) / slippage;
            
            const sellAmount = Math.min(amount, pos.amount);
            const val = sellAmount * exitPrice;
            const pnl = (exitPrice - pos.entryPrice) * sellAmount * (pos.type === 'LONG' ? 1 : -1);
            
            setEquity(prev => prev + val);
            setPositions(prev => {
                const updated = [...prev];
                if (sellAmount >= pos.amount) {
                    updated.splice(posIndex, 1);
                } else {
                    updated[posIndex] = { ...pos, amount: pos.amount - sellAmount };
                }
                return updated;
            });

            setBotStats(prev => ({
                ...prev,
                wins: pnl > 0 ? prev.wins + 1 : prev.wins,
                losses: pnl <= 0 ? prev.losses + 1 : prev.losses,
                totalTrades: prev.totalTrades + 1,
                totalPnl: prev.totalPnl + pnl
            }));

            const msg = `[ALPHA_EXIT] SOLD ${sellAmount.toFixed(4)} ${symbol} @ $${exitPrice.toFixed(2)} | PROFIT: $${pnl.toFixed(2)}`;
            if (origin === 'BOT') setBotLogs(prev => [{ type: 'bot', content: msg, timestamp: new Date(), impact: pnl > 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`, confidence, reasoning: analysis }, ...prev.slice(0, 49)]);
            else setMessages(prev => [...prev, { type: 'success', content: msg, timestamp: new Date() }]);
        }
    }
  };

  useEffect(() => {
    if (!isBotActive || isScanning) return;
    const botTick = async () => {
      setIsScanning(true);
      try {
          const decision = await executeBotStrategy(botStrategy, (Object.values(targets) as Asset[]), { balance: equity, positions }, news);
          if (decision && decision.type !== 'NONE') processTradeAction(decision, 'BOT');
      } finally {
          setIsScanning(false);
      }
    };
    const interval = setInterval(botTick, 20000);
    return () => clearInterval(interval);
  }, [isBotActive, botStrategy, targets, equity, positions, news, isScanning]);

  const handleCommand = async (cmd: string) => {
    setMessages(prev => [...prev, { type: 'user', content: cmd, timestamp: new Date() }]);
    setIsProcessing(true);
    const response = await executeCommand(cmd, missions.find(m => m.id === currentMissionId) || { title: 'Direct Intelligence Access' } as any, activeAsset!, { balance: equity, positions });
    
    if (response.lecture) {
        setLecture(response.lecture);
        setMode(AppMode.ACADEMY);
        if (response.lecture.steps[0]) {
            const bytes = await generateSpeech(response.lecture.steps[0].speechText);
            if (bytes) await playPCM(bytes);
        }
    } else if (response.instructorCommentary) {
        const bytes = await generateSpeech(response.instructorCommentary);
        if (bytes) await playPCM(bytes);
    }

    if (response.tradeAction) processTradeAction(response.tradeAction, 'MANUAL');
    setMessages(prev => [...prev, { type: 'ai', content: response.terminalOutput, timestamp: new Date() }]);
    setIsProcessing(false);
  };

  const advanceLecture = async () => {
      if (!lecture) return;
      const nextIdx = lecture.currentStepIndex + 1;
      if (nextIdx < lecture.steps.length) {
          const nextLecture = { ...lecture, currentStepIndex: nextIdx };
          setLecture(nextLecture);
          const bytes = await generateSpeech(lecture.steps[nextIdx].speechText);
          if (bytes) await playPCM(bytes);
      } else {
          setLecture(null);
          setMode(AppMode.TERMINAL);
          setMessages(prev => [...prev, { type: 'success', content: "[SYSTEM] ACADEMY MODULE COMPLETE. +15 ALPHA XP.", timestamp: new Date() }]);
      }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#020617] text-slate-200">
      <Header currentMode={mode} setMode={setMode} equity={totalEquity} />
      
      <div className="h-10 bg-emerald-950/20 border-b border-emerald-900/30 flex items-center px-6 overflow-hidden relative z-40">
          <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] uppercase tracking-widest mr-8 shrink-0">
              <Lightbulb size={14} /> <span className="font-bold">Elite_Alpha:</span>
          </div>
          <div className="flex-1 overflow-hidden">
              <div className="flex gap-12 animate-marquee whitespace-nowrap">
                  {profitabilityTips.length > 0 ? profitabilityTips.map((tip, i) => (
                      <span key={i} className="text-[10px] font-mono text-emerald-200/70 flex items-center gap-2">
                          <ChevronRight size={10} className="text-emerald-500" /> {tip}
                      </span>
                  )) : (
                      <span className="text-[10px] font-mono text-emerald-200/40">Calculating predictive Alpha vectors... Standing by...</span>
                  )}
              </div>
          </div>
          <div className="ml-8 pl-4 border-l border-emerald-900/30 flex items-center gap-4 text-[9px] font-mono text-slate-500">
              <Activity size={10} className="text-emerald-500" /> Sync: 99.9% | APEX_V2
          </div>
      </div>

      <main className={`flex-1 flex overflow-hidden ${layout === LayoutMode.FLIPPED ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {layout === LayoutMode.FOCUS && focusComponent && (
            <div className="fixed inset-0 z-[100] bg-slate-950 p-8 flex flex-col animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4 text-emerald-500">
                        <Activity className="animate-pulse" />
                        <h2 className="text-xl font-black font-mono uppercase tracking-[0.4em]">Elite Focus: {focusComponent}</h2>
                    </div>
                    <button onClick={() => toggleFocus(focusComponent)} className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-xs hover:bg-red-500 hover:text-white transition-all rounded uppercase font-bold flex items-center gap-2">
                        <Minimize2 size={16} /> Exit_Focus
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    {focusComponent === 'VISUALIZER' && <Visualizer target={activeAsset} isMaximized={true} onToggleMaximize={() => toggleFocus('VISUALIZER')} />}
                    {focusComponent === 'TERMINAL' && <Terminal messages={messages} onSendCommand={handleCommand} isProcessing={isProcessing} isMaximized={true} onToggleMaximize={() => toggleFocus('TERMINAL')} />}
                    {focusComponent === 'INTEL' && <IntelTerminal news={news} whales={whales} assets={Object.values(targets)} onRefreshNews={async () => setNews(await fetchMarketNews())} isMaximized={true} onToggleMaximize={() => toggleFocus('INTEL')} />}
                    {focusComponent === 'SHADOW' && <ShadowTerminal isMaximized={true} onToggleMaximize={() => toggleFocus('SHADOW')} />}
                    {focusComponent === 'QUANT' && <CorrelationTerminal assets={Object.values(targets)} isMaximized={true} onToggleMaximize={() => toggleFocus('QUANT')} />}
                    {focusComponent === 'LIQUIDITY' && <LiquidityTerminal activeAsset={activeAsset} isMaximized={true} onToggleMaximize={() => toggleFocus('LIQUIDITY')} />}
                    {focusComponent === 'EXECUTION' && <ExecutionTerminal activeAsset={activeAsset} equity={equity} onExecute={(a) => processTradeAction(a, 'MANUAL')} isMaximized={true} onToggleMaximize={() => toggleFocus('EXECUTION')} />}
                    {focusComponent === 'HUB' && <MissionHub missions={missions} currentMissionId={currentMissionId} onSelectMission={setCurrentMissionId} targets={targets} isMaximized={true} onToggleMaximize={() => toggleFocus('HUB')} />}
                    {focusComponent === 'DECODER' && <NewsDecoderTerminal news={news} isMaximized={true} onToggleMaximize={() => toggleFocus('DECODER')} />}
                    {focusComponent === 'ORCHESTRATOR' && <AIOrchestratorTerminal assets={Object.values(targets)} positions={positions} equity={equity} isMaximized={true} onToggleMaximize={() => toggleFocus('ORCHESTRATOR')} />}
                    {focusComponent === 'TUTOR' && <TutorBoard lecture={lecture} onNextStep={advanceLecture} onStartLecture={async (t) => { setIsLectureLoading(true); const l = await generateLecture(t); setLecture(l); setIsLectureLoading(false); }} isMaximized={true} onToggleMaximize={() => toggleFocus('TUTOR')} isLoading={isLectureLoading} isPlayingAudio={isSpeaking} />}
                </div>
            </div>
        )}

        <aside className={`w-80 border-r border-slate-800 shrink-0 transition-all ${layout === LayoutMode.FOCUS ? 'opacity-0 -translate-x-full absolute' : 'opacity-100 translate-x-0 relative'}`}>
          <MissionHub 
            missions={missions} currentMissionId={currentMissionId} 
            onSelectMission={setCurrentMissionId} targets={targets} 
            isMaximized={false} onToggleMaximize={() => toggleFocus('HUB')} 
          />
        </aside>

        <section className={`flex-1 flex flex-col min-w-0 bg-[#050a0f] transition-all ${layout === LayoutMode.FOCUS ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
           {mode === AppMode.TERMINAL && (
             <>
               <div className="flex-1 relative group min-h-0">
                 <Visualizer target={activeAsset} isMaximized={false} onToggleMaximize={() => toggleFocus('VISUALIZER')} />
                 <button onClick={() => toggleFocus('VISUALIZER')} className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                     <Maximize2 size={18} />
                 </button>
               </div>
               <Terminal messages={messages} onSendCommand={handleCommand} isProcessing={isProcessing} onToggleMaximize={() => toggleFocus('TERMINAL')} />
             </>
           )}
           {mode === AppMode.ACADEMY && <TutorBoard lecture={lecture} onNextStep={advanceLecture} onStartLecture={async (t) => { setIsLectureLoading(true); const l = await generateLecture(t); setLecture(l); setIsLectureLoading(false); }} isMaximized={false} onToggleMaximize={() => toggleFocus('TUTOR')} isLoading={isLectureLoading} isPlayingAudio={isSpeaking} />}
           {mode === AppMode.INTEL && <IntelTerminal news={news} whales={whales} assets={Object.values(targets)} onRefreshNews={async () => setNews(await fetchMarketNews())} isMaximized={false} onToggleMaximize={() => toggleFocus('INTEL')} />}
           {mode === AppMode.SHADOW_RELAY && <ShadowTerminal isMaximized={false} onToggleMaximize={() => toggleFocus('SHADOW')} />}
           {mode === AppMode.QUANT_MATRIX && <CorrelationTerminal assets={Object.values(targets)} isMaximized={false} onToggleMaximize={() => toggleFocus('QUANT')} />}
           {mode === AppMode.LIQUIDITY_MAP && <LiquidityTerminal activeAsset={activeAsset} onToggleMaximize={() => toggleFocus('LIQUIDITY')} />}
           {mode === AppMode.EXECUTION && <ExecutionTerminal activeAsset={activeAsset} equity={equity} onExecute={(a) => processTradeAction(a, 'MANUAL')} onToggleMaximize={() => toggleFocus('EXECUTION')} />}
           {mode === AppMode.NEWS_DECODER && <NewsDecoderTerminal news={news} isMaximized={false} onToggleMaximize={() => toggleFocus('DECODER')} />}
           {mode === AppMode.AI_ORCHESTRATOR && <AIOrchestratorTerminal assets={Object.values(targets)} positions={positions} equity={totalEquity} isMaximized={false} onToggleMaximize={() => toggleFocus('ORCHESTRATOR')} />}
           {mode === AppMode.SIM_MODE && (
               <div className="flex-1 overflow-y-auto p-12 bg-slate-950 font-mono space-y-12">
                   <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 flex flex-col items-center">
                                <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-black">Elite_Accuracy</div>
                                <div className="text-4xl font-black text-emerald-400">
                                    {botStats.totalTrades > 0 ? ((botStats.wins / botStats.totalTrades) * 100).toFixed(1) : '94.2'}%
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 flex flex-col items-center">
                                <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-black">Capital_Reserve</div>
                                <div className="text-4xl font-black text-white">${totalEquity.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                            </div>
                            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 flex flex-col items-center">
                                <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-black">Alpha_Units</div>
                                <div className="text-4xl font-black text-blue-500">{botStats.totalTrades}</div>
                            </div>
                        </div>

                        <div className="bg-slate-900/30 p-12 rounded-[3rem] border-2 border-slate-800 text-center">
                            <Cpu size={64} className={`mx-auto mb-8 transition-all ${isBotActive ? 'text-emerald-500 animate-pulse scale-110' : 'text-slate-700'}`} />
                            <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">Elite Bot Deployment Hub</h2>
                            <p className="text-slate-500 mb-10 text-sm max-w-lg mx-auto leading-relaxed">
                                Deploy institutional-grade algorithms using high-resolution order flow analysis. Sub-millisecond execution protocol enabled.
                            </p>
                            <div className="flex gap-4 max-w-md mx-auto">
                                <button 
                                    onClick={() => setIsBotActive(!isBotActive)} 
                                    className={`flex-1 py-5 rounded-2xl font-black text-xl border-4 transition-all ${isBotActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-600 hover:border-slate-500'}`}
                                >
                                    {isBotActive ? 'HALT_ALGO' : 'DEPLOY_ALPHA'}
                                </button>
                                <select 
                                    value={botStrategy}
                                    onChange={(e) => setBotStrategy(e.target.value as BotStrategy)}
                                    className="bg-slate-900 border-2 border-slate-800 px-6 rounded-2xl text-slate-300 font-bold focus:border-emerald-500 outline-none"
                                >
                                    {Object.values(BotStrategy).map(s => <option key={s} value={s}>{s.split(' ')[0]}</option>)}
                                </select>
                            </div>
                        </div>
                   </div>
               </div>
           )}
        </section>
      </main>

      <BossWidget onVoiceCommand={handleCommand} isProcessing={isProcessing} isSpeaking={isSpeaking} />

      <style>{`
          @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
          }
          .animate-marquee {
              display: inline-flex;
              animation: marquee 40s linear infinite;
          }
      `}</style>
    </div>
  );
};

export default App;
