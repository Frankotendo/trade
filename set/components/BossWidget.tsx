
import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface BossWidgetProps {
  onVoiceCommand: (text: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
}

const BossWidget: React.FC<BossWidgetProps> = ({ onVoiceCommand, isProcessing, isSpeaking }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onstart = () => setIsListening(true);
      recognizer.onend = () => setIsListening(false);
      recognizer.onerror = (event: any) => {
        setIsListening(false);
      };
      recognizer.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onVoiceCommand(transcript);
        }
      };

      setRecognition(recognizer);
    } else {
      setIsSupported(false);
    }
  }, [onVoiceCommand]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  }, [recognition, isListening]);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4">
        
      {(isSpeaking || isListening || isProcessing) && (
          <div className="mb-4 bg-black/80 backdrop-blur-md border border-emerald-500/50 p-3 rounded-lg text-sm font-mono text-emerald-200 shadow-xl max-w-[200px] animate-in slide-in-from-bottom-5 fade-in duration-300">
              {isProcessing ? (
                  <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span> Analysing...</span>
              ) : isListening ? (
                  <span className="text-red-400 font-bold">Listening...</span>
              ) : isSpeaking ? (
                  <span className="flex items-center gap-2"><Volume2 size={12} className="animate-pulse"/> Apex Speaking...</span>
              ) : null}
          </div>
      )}

      <div className="relative group">
          {isSpeaking && (
             <>
                <div className="absolute inset-0 rounded-full bg-emerald-600 opacity-20 animate-ping"></div>
                <div className="absolute -inset-2 rounded-full bg-emerald-600 opacity-10 animate-ping delay-100"></div>
             </>
          )}

          <div className="w-20 h-20 rounded-full bg-gradient-to-b from-gray-800 to-black border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,100%_100%] pointer-events-none z-20"></div>

              {isListening ? (
                  <div className="text-red-500 animate-pulse">
                      <Mic size={32} />
                  </div>
              ) : (
                  <div className={`transition-all duration-300 ${isSpeaking ? 'scale-110 text-emerald-300' : 'text-emerald-600 grayscale opacity-80'}`}>
                      {/* Lion/Wolf Abstract Icon */}
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15 10 22 10 16 15 18 22 12 18 6 22 8 15 2 10 9 10 12 2" />
                        </svg>
                  </div>
              )}
          </div>

          <button 
             onClick={toggleListening}
             disabled={isProcessing}
             className="absolute inset-0 w-full h-full rounded-full z-30 cursor-pointer focus:outline-none"
             title="Talk to Apex"
          >
          </button>

          <div className="absolute bottom-1 right-1 w-4 h-4 bg-gray-900 rounded-full border border-gray-700 flex items-center justify-center z-40">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
          
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-[10px] text-emerald-400 px-2 py-0.5 rounded border border-emerald-900 font-tech tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              APEX MANAGER
          </div>
      </div>
    </div>
  );
};

export default BossWidget;