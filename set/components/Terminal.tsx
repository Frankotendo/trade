
import React, { useState, useEffect, useRef } from 'react';
import { TerminalLine, TradingMode } from '../types';
import { Maximize2, Minimize2, TrendingUp, Wifi, AlertTriangle } from 'lucide-react';

interface TerminalProps {
  history: TerminalLine[];
  onCommand: (cmd: string) => void;
  isProcessing: boolean;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  mode: TradingMode;
}

const Terminal: React.FC<TerminalProps> = ({ history, onCommand, isProcessing, isMaximized, onToggleMaximize, mode }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleClick = () => {
    inputRef.current?.focus();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onCommand(input);
    setInput('');
  };

  const isLive = mode === 'LIVE_PAPER';
  const promptText = isLive ? 'LIVE@EXECUTION:~$' : 'trader@alpha:~$';
  const promptColor = isLive ? 'text-red-500' : 'text-emerald-600';
  const headerBg = isLive ? 'bg-red-950/30 border-red-900/50' : 'bg-[#0d151c] border-gray-800';
  const textColor = isLive ? 'text-red-100' : 'text-[#e5e5e5]';

  return (
    <div 
      className={`flex flex-col h-full bg-[#050a0f] border rounded shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-sm transition-colors duration-500 ${isLive ? 'border-red-900/50' : 'border-gray-800'}`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b select-none transition-colors duration-500 ${headerBg}`}>
        <div className={`flex items-center gap-2 ${isLive ? 'text-red-500' : 'text-emerald-500/80'}`}>
          {isLive ? <Wifi size={12} className="animate-pulse" /> : <TrendingUp size={12} />}
          <span className="text-[10px] font-bold tracking-wider">
            {isLive ? 'LIVE_EXECUTION_LINK_ACTIVE' : 'EXECUTION_TERMINAL_V9'}
          </span>
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}
                className="text-gray-500 hover:text-white transition-colors"
             >
                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
             </button>
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isLive ? 'bg-red-600 animate-pulse' : 'bg-emerald-700 hover:bg-emerald-500'}`}></div>
            </div>
        </div>
      </div>

      {/* Output Area */}
      <div className={`flex-1 p-3 overflow-y-auto space-y-0.5 cursor-text relative ${textColor}`}>
        
        {/* Watermark for Live Mode */}
        {isLive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
                <AlertTriangle size={200} className="text-red-500" />
            </div>
        )}

        <div className="relative z-10">
            <div className={`mb-2 font-tech text-xs ${isLive ? 'text-red-400/60' : 'text-gray-500'}`}>
            TradeSim Alpha [Version 4.2.0]<br/>
            (c) 2077 Apex Capital Systems. All markets connected.<br/>
            <br/>
            Data Feed: <span className={isLive ? 'text-red-500 font-bold' : 'text-emerald-500'}>
                {isLive ? 'BINANCE WSS (LIVE)' : 'SIMULATED'}
            </span><br/>
            Risk Engine: <span className={isLive ? 'text-red-500 font-bold' : 'text-emerald-500'}>
                {isLive ? 'UNRESTRICTED' : 'ACTIVE'}
            </span><br/>
            </div>
            
            {history.map((line, idx) => (
            <div key={idx} className="break-words">
                {line.type === 'input' ? (
                <div className="mt-2 mb-1">
                    <span className={`${promptColor} font-bold`}>{promptText}</span> <span className="text-white">{line.content}</span>
                </div>
                ) : line.type === 'error' ? (
                <div className="text-red-400 whitespace-pre-wrap font-tech bg-red-900/10 p-1 border-l-2 border-red-500">{line.content}</div>
                ) : line.type === 'system' ? (
                <div className={`border-l-2 pl-2 my-2 py-1 font-tech text-xs ${isLive ? 'text-red-300 border-red-500 bg-red-900/10' : 'text-blue-400 border-blue-500 bg-blue-900/10'}`}>
                    {line.content}
                </div>
                ) : (
                <div className={`whitespace-pre-wrap font-mono text-xs leading-relaxed opacity-90 ${isLive ? 'text-red-100' : 'text-[#00ff9d]'}`}>
                    {line.content}
                </div>
                )}
            </div>
            ))}
            
            {isProcessing && (
            <div className="mt-2 text-gray-500 animate-pulse">
                <span className={`${promptColor} font-bold`}>{promptText}</span> <span className="inline-block w-2 h-4 bg-gray-500 align-middle ml-1"></span>
            </div>
            )}

            {/* Active Input Line */}
            {!isProcessing && (
            <form onSubmit={handleSubmit} className="mt-2 flex flex-row items-center">
                <span className={`${promptColor} font-bold mr-2`}>{promptText}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-700 font-bold"
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                />
            </form>
            )}
            
            <div ref={bottomRef} className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default Terminal;