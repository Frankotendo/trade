
import React, { useState, useRef, useEffect } from 'react';
import { TerminalMessage } from '../types';
import { Maximize2, Minimize2, Circle, Bot } from 'lucide-react';

interface TerminalProps {
  messages: TerminalMessage[];
  onSendCommand: (cmd: string) => void;
  isProcessing: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ messages, onSendCommand, isProcessing, isMaximized, onToggleMaximize }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendCommand(input);
      setInput('');
    }
  };

  return (
    <div className={`${isMaximized ? 'h-full' : 'h-80'} border-t border-slate-800 bg-slate-950 flex flex-col font-mono text-xs overflow-hidden transition-all duration-300`} onClick={() => inputRef.current?.focus()}>
      <div className="p-3 border-b border-slate-900 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <span className="text-green-500">_</span> EXECUTION_TERMINAL_V9
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1 items-center mr-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] text-emerald-500">UPLINK_READY</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggleMaximize?.(); }} className="text-slate-600 hover:text-slate-400 cursor-pointer p-1">
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar selection:bg-green-500 selection:text-black">
        {messages.map((msg, i) => (
          <div key={i} className="leading-relaxed break-words">
            {msg.type === 'user' && <span className="text-blue-400 font-bold">trader@alpha:~$ </span>}
            {msg.type === 'bot' && <span className="text-purple-400 font-bold flex items-center gap-1"><Bot size={10}/> BOT_PROC: </span>}
            <span className={`
              ${msg.type === 'system' ? 'text-slate-500 italic' : ''}
              ${msg.type === 'ai' ? 'text-green-500' : ''}
              ${msg.type === 'error' ? 'text-red-500 font-bold' : ''}
              ${msg.type === 'success' ? 'text-green-400 font-bold' : ''}
              ${msg.type === 'user' ? 'text-slate-100' : ''}
              ${msg.type === 'bot' ? 'text-purple-300' : ''}
            `}>
              {msg.content}
            </span>
          </div>
        ))}
        {isProcessing && (
          <div className="text-slate-500 animate-pulse">
            <span className="text-blue-400 font-bold">trader@alpha:~$ </span>
            <span>_ Intelligence core processing...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-900 bg-slate-900/20 flex items-center">
        <span className="text-blue-400 font-bold mr-2">trader@alpha:~$ </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-700"
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default Terminal;
