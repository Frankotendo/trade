import React, { useEffect, useState } from 'react';
import { Lecture, LectureStep } from '../types';
import { Maximize2, Minimize2, GraduationCap, ChevronRight, Play, Check, BookOpen, Loader2, Search, Library } from 'lucide-react';

interface TutorBoardProps {
  lecture: Lecture | null;
  onNextStep: () => void;
  onStartLecture: (topic: string) => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  isLoading: boolean;
  isPlayingAudio: boolean;
}

const TutorBoard: React.FC<TutorBoardProps> = ({ 
    lecture, 
    onNextStep, 
    onStartLecture,
    isMaximized, 
    onToggleMaximize, 
    isLoading,
    isPlayingAudio 
}) => {
  const [currentStep, setCurrentStep] = useState<LectureStep | null>(null);
  const [topicInput, setTopicInput] = useState('');

  useEffect(() => {
    if (lecture && lecture.steps[lecture.currentStepIndex]) {
      setCurrentStep(lecture.steps[lecture.currentStepIndex]);
    }
  }, [lecture]);

  const handleStartSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (topicInput.trim()) {
          onStartLecture(topicInput);
          setTopicInput('');
      }
  };

  const PRESET_TOPICS = [
      { name: 'SMC / ICT 2022', icon: '💎' },
      { name: 'Wyckoff Accumulation', icon: '📊' },
      { name: 'Market Structure', icon: '⛓️' },
      { name: 'Fibonacci Levels', icon: '📐' },
      { name: 'Livermore Tape Reading', icon: '📜' }
  ];

  if (!lecture || !currentStep) {
    return (
      <div className="h-full flex flex-col bg-[#1a1c1e] border-8 border-[#3D2B1F] rounded-lg relative overflow-hidden shadow-2xl">
         <div className="absolute top-4 right-4 z-50">
            <button onClick={onToggleMaximize} className="text-slate-500 hover:text-white transition-colors p-2 bg-black/50 rounded-full">
                {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_center,rgba(40,40,40,1)_0%,rgba(20,20,20,1)_100%)]">
             {isLoading ? (
                 <div className="flex flex-col items-center gap-6">
                     <div className="relative">
                        <Loader2 className="w-24 h-24 text-emerald-500 animate-spin" />
                        <Library className="absolute inset-0 m-auto text-emerald-500/50" size={32} />
                     </div>
                     <div className="space-y-2">
                        <p className="font-mono text-xl text-emerald-500 animate-pulse uppercase tracking-[0.3em] font-black">Neural Library Access...</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Searching 1,000+ Strategies & Financial Texts</p>
                     </div>
                 </div>
             ) : (
                <div className="max-w-3xl w-full">
                    <div className="mb-10 flex justify-center">
                        <div className="bg-emerald-500/10 p-6 rounded-3xl border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <GraduationCap size={64} className="text-emerald-500" />
                        </div>
                    </div>
                    <h2 className="font-mono text-5xl font-black text-white mb-4 uppercase tracking-tighter">Apex Trading Academy</h2>
                    <p className="font-mono text-base text-slate-400 mb-12 uppercase tracking-widest leading-relaxed">
                        Access the Infinite Wisdom of Institutional Algorithmic Logic.
                    </p>
                    
                    <form onSubmit={handleStartSubmit} className="relative group mb-12">
                        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative flex">
                            <div className="absolute inset-y-0 left-6 flex items-center text-slate-500">
                                <Search size={20} />
                            </div>
                            <input 
                                type="text"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                placeholder="Search Strategy, Book, or Great (e.g. 'ICT', 'Dalio', 'Livermore')..."
                                className="w-full pl-16 pr-8 py-6 rounded-2xl border-2 border-slate-700 font-mono text-base bg-black text-white focus:outline-none focus:border-emerald-500 transition-all shadow-2xl"
                            />
                            <button 
                                type="submit"
                                disabled={!topicInput.trim()}
                                className="absolute right-4 top-4 bottom-4 bg-emerald-500 text-black px-8 rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
                            >
                                STUDY <BookOpen size={16} />
                            </button>
                        </div>
                    </form>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 opacity-70">
                        {PRESET_TOPICS.map(t => (
                            <button 
                                key={t.name}
                                onClick={() => onStartLecture(t.name)}
                                className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all hover:bg-emerald-500/5"
                            >
                                <div className="text-xl mb-2">{t.icon}</div>
                                <div className="uppercase font-bold tracking-tighter">{t.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
             )}
         </div>
      </div>
    );
  }

  const progress = ((lecture.currentStepIndex + 1) / lecture.steps.length) * 100;

  return (
    <div className="h-full flex flex-col bg-[#0a0c0e] border-[16px] border-[#2A1E16] rounded-2xl relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
      
      {/* Chalkboard Interface */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
         
         {/* Top Header */}
         <div className="h-16 bg-black/50 border-b-4 border-white/5 flex items-center justify-between px-10">
            <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></div>
                <div>
                    <h2 className="text-slate-300 font-mono text-xs font-black uppercase tracking-[0.4em]">
                        Neural_Session: {lecture.topic}
                    </h2>
                    <p className="text-[8px] text-slate-600 uppercase font-bold mt-1 tracking-widest">Instructor: Apex Librarian v5.2</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{lecture.currentStepIndex + 1} / {lecture.steps.length}</span>
                    <div className="h-1.5 w-40 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progress}%` }}></div>
                    </div>
                 </div>
                 <button onClick={onToggleMaximize} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all">
                    {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                 </button>
            </div>
         </div>

         <div className="flex-1 p-16 overflow-y-auto custom-scrollbar relative bg-[#0a0c0e]">
            {/* Visualizer Background Lines */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:50px_50px]"></div>

            {/* Professor / Boss Avatar Component */}
            <div className="fixed bottom-28 left-14 flex items-center gap-6 z-20 group">
                <div className={`w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] ${isPlayingAudio ? 'animate-[bounce_0.5s_infinite]' : ''} border-4 border-black transition-transform group-hover:scale-110`}>
                    <GraduationCap size={40} className="text-black" />
                </div>
                <div className="flex flex-col">
                    <div className={`bg-black/90 backdrop-blur-xl border border-emerald-500/30 p-5 rounded-2xl text-[11px] font-mono text-emerald-400 shadow-2xl transition-all ${isPlayingAudio ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <div className="flex gap-1 mb-2">
                            <div className="w-1 bg-emerald-500 animate-[h_0.8s_infinite] h-2"></div>
                            <div className="w-1 bg-emerald-500 animate-[h_1.2s_infinite] h-3"></div>
                            <div className="w-1 bg-emerald-500 animate-[h_0.6s_infinite] h-1"></div>
                        </div>
                        {isPlayingAudio ? "UPLINKING_CURRICULUM_DATA..." : "STANDBY"}
                    </div>
                </div>
            </div>

            {/* Board Content - Chalkboard Style */}
            <div className="font-mono text-4xl text-emerald-50/90 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500 selection:text-black tracking-tight filter drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] max-w-5xl mx-auto">
                <span className="text-emerald-500/40 text-xl block mb-6">{" >> "} ANALYSIS_DUMP:</span>
                {currentStep.boardNotes}
            </div>
         </div>

         {/* Control Tray */}
         <div className="h-28 bg-black border-t-4 border-slate-900/50 flex items-center justify-between px-12">
            <div className="text-[11px] font-mono text-slate-700 uppercase tracking-[0.3em] font-black">
                Neural_Librarian_v5.2 // Global_Strategy_Index
            </div>

            <div className="flex items-center gap-8">
                {lecture.currentStepIndex > 0 && (
                     <button 
                        onClick={() => {/* Implement back logic if needed */}}
                        className="text-slate-500 font-mono text-xs uppercase font-bold hover:text-slate-300 transition-colors"
                    >
                        [ PREVIOUS_SLIDE ]
                    </button>
                )}
                
                <button 
                    onClick={onNextStep}
                    disabled={isPlayingAudio}
                    className={`
                        flex items-center gap-4 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
                        ${isPlayingAudio 
                            ? 'bg-slate-900 text-slate-700 cursor-not-allowed border-2 border-slate-800' 
                            : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                        }
                    `}
                >
                    {lecture.currentStepIndex === lecture.steps.length - 1 ? (
                        <>COMPLETE_MODULE <Check size={20} /></>
                    ) : (
                        <>NEXT_THESIS <ChevronRight size={20} /></>
                    )}
                </button>
            </div>
         </div>
      </div>
      
      <style>{`
          @keyframes h {
              0%, 100% { height: 4px; }
              50% { height: 12px; }
          }
      `}</style>
    </div>
  );
};

export default TutorBoard;
