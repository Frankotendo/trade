
import React, { useState, useEffect } from 'react';
import { NewsItem, NewsDecode } from '../types';
import { decodeMarketNews } from '../services/geminiService';
import { Newspaper, HelpCircle, TrendingUp, TrendingDown, Maximize2, Minimize2, Lightbulb, Activity, ArrowRight, BookOpen } from 'lucide-react';

interface NewsDecoderTerminalProps {
  news: NewsItem[];
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const NewsDecoderTerminal: React.FC<NewsDecoderTerminalProps> = ({ news, isMaximized, onToggleMaximize }) => {
  const [decoded, setDecoded] = useState<NewsDecode | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (news.length > 0) {
      handleDecode();
    }
  }, [news.length]);

  const handleDecode = async () => {
    setLoading(true);
    const data = await decodeMarketNews(news);
    setDecoded(data);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#fafaf9] text-slate-900 font-sans overflow-hidden relative selection:bg-amber-200">
      <div className="p-5 border-b-2 border-slate-200 bg-white flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Newspaper size={24} className="text-amber-700" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight uppercase">The Layman's Market Decoder</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Translating Institutional Chaos into Common Sense</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDecode}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all font-bold text-xs uppercase"
          >
            {loading ? <Activity size={14} className="animate-spin" /> : <BookOpen size={14} />}
            {loading ? 'Translating...' : 'Refresh Decoder'}
          </button>
          <button onClick={onToggleMaximize} className="text-slate-400 hover:text-slate-900 p-2">
            {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 py-20">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Simplifying Macro-Economics...</p>
          </div>
        ) : decoded ? (
          <div className="max-w-4xl mx-auto space-y-12">
            
            <section className="bg-white border-2 border-slate-200 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <HelpCircle size={120} />
              </div>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                    <Lightbulb size={24} />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight">What's actually happening?</h3>
              </div>
              <p className="text-lg leading-relaxed text-slate-700 font-medium italic">
                "{decoded.laymanSummary}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <section className="bg-slate-100 p-8 rounded-[2rem] border border-slate-200">
                  <h4 className="text-sm font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                     <ArrowRight size={16} /> Why it matters to you
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600 font-bold">
                    {decoded.whyItMatters}
                  </p>
               </section>
               <section className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100">
                  <h4 className="text-sm font-black uppercase text-amber-700/50 mb-4 flex items-center gap-2">
                     <TrendingUp size={16} /> What to expect next
                  </h4>
                  <p className="text-sm leading-relaxed text-amber-900 font-bold">
                    {decoded.expectedOutcome}
                  </p>
               </section>
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-stretch">
               <div className="flex-1 p-8 bg-white border-2 border-slate-100 rounded-3xl flex flex-col justify-between">
                  <div className="text-xs font-black uppercase text-slate-400 mb-6">Market Sentiment Flux</div>
                  <div className="flex items-center gap-8">
                     <div className="text-6xl font-black tracking-tighter text-slate-900">{decoded.sentimentScore}%</div>
                     <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                              className={`h-full transition-all duration-1000 ${decoded.sentimentScore > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${decoded.sentimentScore}%` }}
                           ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                           <span>Fearful</span>
                           <span>Greedy</span>
                        </div>
                     </div>
                  </div>
               </div>
               <div className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center w-64 ${
                  decoded.volatilityForecast === 'Explosive' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                  decoded.volatilityForecast === 'Volatile' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                  'bg-emerald-50 border-emerald-100 text-emerald-700'
               }`}>
                  <div className="text-[10px] font-black uppercase mb-2">Volatility Risk</div>
                  <div className="text-xl font-black uppercase tracking-widest">{decoded.volatilityForecast}</div>
                  <Activity size={32} className={`mt-4 ${decoded.volatilityForecast === 'Explosive' ? 'animate-bounce' : 'animate-pulse'}`} />
               </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center opacity-30 text-slate-400 uppercase tracking-[0.4em] font-black">
             No news uplink established.
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDecoderTerminal;
