
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Visualizer from './components/Visualizer';
import Terminal from './components/Terminal';
import TutorBoard from './components/TutorBoard';
import BossWidget from './components/BossWidget';
import { 
  Asset, TerminalMessage, Lecture, Position, BotStrategy, Station
} from './types';
import { INITIAL_ASSETS } from './constants';
import { 
  executeCommand, generateSpeech, generateLecture
} from './services/geminiService';
import { MarketService, getLiveAssetList } from './services/marketService';

const App: React.FC = () => {
  const [station, setStation] = useState<Station>(Station.ACADEMY);
  const [targets, setTargets] = useState<Record<string, Asset>>({});
  const [currentAssetId, setCurrentAssetId] = useState<string>('BTCUSDT');
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [isLectureLoading, setIsLectureLoading] = useState(false);
  const [lectureError, setLectureError] = useState<string | null>(null);
  const [equity, setEquity] = useState(100000.00);
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentStrategy, setCurrentStrategy] = useState<BotStrategy>(BotStrategy.CANDLESTICK_STRATEGIES);
  const [messages, setMessages] = useState<TerminalMessage[]>([
    { type: 'system', content: "SYSTEM_READY: NEURAL ACADEMY V5.2 ONLINE.", timestamp: new Date() }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const marketServiceRef = useRef<MarketService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeAsset = targets[currentAssetId] || null;

  useEffect(() => {
    const init = async () => {
      const initial: Record<string, Asset> = {};
      INITIAL_ASSETS.forEach(a => { initial[a.id] = { ...a, history: Array(20).fill(a.price) }; });
      setTargets(initial);
    };
    init();

    marketServiceRef.current = new MarketService(
      (updates) => setTargets(prev => {
        const next = { ...prev };
        updates.forEach(u => { if (u.id && next[u.id]) next[u.id] = { ...next[u.id], ...u }; });
        return next;
      }),
      () => {} 
    );
    marketServiceRef.current.connect(getLiveAssetList());
    return () => marketServiceRef.current?.disconnect();
  }, []);

  const playPCM = async (bytes: Uint8Array) => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    const frameCount = bytes.length / 2;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const data = buffer.getChannelData(0);
    const int16 = new Int16Array(bytes.buffer);
    for (let i = 0; i < frameCount; i++) data[i] = int16[i] / 32768.0;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    setIsSpeaking(true);
    source.onended = () => setIsSpeaking(false);
    source.start();
  };

  const handleStartLecture = async (topic: string) => {
    setIsLectureLoading(true);
    setLectureError(null);
    try {
      const lec = await generateLecture(topic);
      if (lec) {
        setLecture(lec);
        // Fire and forget speech to not block the text appearing
        generateSpeech(lec.steps[0].speechText).then(bytes => {
          if (bytes) playPCM(bytes);
        });
      } else {
        setLectureError("Failed to retrieve intelligence module. Neural link timed out.");
      }
    } catch (e: any) {
      setLectureError(e.message || "UPLINK_CRITICAL_ERROR");
    } finally {
      setIsLectureLoading(false);
    }
  };

  const advanceLecture = async () => {
    if (!lecture) return;
    const nextIdx = lecture.currentStepIndex + 1;
    if (nextIdx < lecture.steps.length) {
      setLecture({ ...lecture, currentStepIndex: nextIdx });
      generateSpeech(lecture.steps[nextIdx].speechText).then(bytes => {
        if (bytes) playPCM(bytes);
      });
    } else {
      setMessages(prev => [...prev, { type: 'system', content: `MODULE_COMPLETE: ${lecture.topic}. Tactical practice unlocked.`, timestamp: new Date() }]);
      setLecture(null);
      setStation(Station.TACTICAL);
    }
  };

  const handleCommand = async (cmd: string) => {
    if (!activeAsset) return;
    setMessages(prev => [...prev, { type: 'user', content: cmd, timestamp: new Date() }]);
    setIsProcessing(true);
    
    const response = await executeCommand(cmd, currentStrategy, activeAsset, equity);
    
    if (response.tradeAction && response.tradeAction.type !== 'NONE') {
       const { type, amount, price, symbol } = response.tradeAction;
       if (type === 'BUY') {
          const cost = amount * price;
          if (cost <= equity) {
            setEquity(prev => prev - cost);
            setPositions(prev => [...prev, { symbol, amount, entryPrice: price, type: 'LONG' }]);
            setMessages(prev => [...prev, { type: 'success', content: `ORDER_FILLED: LONG ${amount} ${symbol} @ $${price.toFixed(2)}`, timestamp: new Date() }]);
          } else {
            setMessages(prev => [...prev, { type: 'error', content: `INSUFFICIENT_FUNDS: Required $${cost.toFixed(2)}, available $${equity.toFixed(2)}`, timestamp: new Date() }]);
          }
       } else if (type === 'SELL') {
          setEquity(prev => prev + (amount * price));
          setPositions(prev => [...prev, { symbol, amount, entryPrice: price, type: 'SHORT' }]);
          setMessages(prev => [...prev, { type: 'success', content: `ORDER_FILLED: SHORT ${amount} ${symbol} @ $${price.toFixed(2)}`, timestamp: new Date() }]);
       }
    }
    
    setMessages(prev => [...prev, { type: 'ai', content: response.terminalOutput, timestamp: new Date() }]);
    if (response.instructorCommentary) {
      setMessages(prev => [...prev, { type: 'mentor', content: `[MENTOR]: ${response.instructorCommentary}`, timestamp: new Date() }]);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#020617] text-slate-200">
      <Header currentStation={station} setStation={setStation} equity={equity} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950/50 p-6 flex flex-col gap-8 shrink-0">
            <div className="flex-1 flex flex-col min-h-0">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Neural Library</p>
                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 pb-4">
                    {Object.values(BotStrategy).map(s => (
                        <button 
                            key={s} 
                            onClick={() => { setCurrentStrategy(s); handleStartLecture(s); setStation(Station.ACADEMY); }}
                            className={`w-full text-left p-3 rounded-xl text-[10px] font-bold border transition-all ${currentStrategy === s ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-auto p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Target Asset</p>
                <select 
                    value={currentAssetId} 
                    onChange={(e) => setCurrentAssetId(e.target.value)}
                    className="w-full bg-black text-white p-2 rounded-lg border border-slate-800 text-[11px] font-mono focus:border-blue-500 outline-none"
                >
                    {getLiveAssetList().map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </aside>

        {/* Main Content Station */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#050a0f]">
            {station === Station.ACADEMY && (
                <TutorBoard 
                    lecture={lecture} 
                    onNextStep={advanceLecture} 
                    onStartLecture={handleStartLecture} 
                    isMaximized={false} 
                    onToggleMaximize={() => {}} 
                    isLoading={isLectureLoading}
                    isPlayingAudio={isSpeaking}
                    error={lectureError}
                />
            )}

            {station === Station.TACTICAL && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 relative border-b border-slate-800">
                        <Visualizer target={activeAsset} isMaximized={false} onToggleMaximize={() => {}} />
                        <div className="absolute top-4 left-4 z-10 bg-black/80 p-4 border border-emerald-500/30 rounded-xl backdrop-blur-md">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Methodology</p>
                            <p className="text-sm font-bold text-white uppercase">{currentStrategy}</p>
                        </div>
                    </div>
                    <Terminal messages={messages} onSendCommand={handleCommand} isProcessing={isProcessing} onToggleMaximize={() => {}} />
                </div>
            )}
        </section>
      </main>

      <BossWidget onVoiceCommand={handleCommand} isProcessing={isProcessing} isSpeaking={isSpeaking} />
    </div>
  );
};

export default App;
