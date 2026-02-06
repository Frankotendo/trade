
import React, { useEffect, useRef } from 'react';
import { Asset } from '../types';
import { Maximize2, Minimize2, BarChart2 } from 'lucide-react';

interface VisualizerProps {
  target: Asset | null;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const Visualizer: React.FC<VisualizerProps> = ({ target, isMaximized, onToggleMaximize }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load the TradingView script if not present
    if (!document.getElementById('tv-widget-script')) {
      const script = document.createElement('script');
      script.id = 'tv-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
          if (target?.tvSymbol) initWidget();
      };
      document.head.appendChild(script);
    } else if (window.TradingView) {
      // If script is already loaded, init widget if symbol changed
      initWidget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.tvSymbol, isMaximized]); // CRITICAL FIX: Only re-run when symbol or layout changes, NOT on every price tick (target change)

  const initWidget = () => {
    if (!target || !containerRef.current || !window.TradingView) return;

    // Determine symbol
    const symbol = target.tvSymbol || `BINANCE:${target.ticker.replace('/', '').replace('-', '')}`;
    
    // Clear previous widget content if needed (TradingView library usually handles this, but safety first)
    if (containerRef.current) {
        containerRef.current.innerHTML = ''; 
    }

    widgetRef.current = new window.TradingView.widget({
      "width": "100%",
      "height": "100%",
      "symbol": symbol,
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1", // 1 = Candles
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "backgroundColor": "rgba(5, 10, 15, 1)",
      "gridColor": "rgba(42, 46, 57, 0.3)",
      "container_id": "tradingview_widget", // Must match the div ID
      "toolbar_bg": "#050a0f",
      "studies": [
        "RSI@tv-basicstudies",
        "MASimple@tv-basicstudies"
      ],
      "disabled_features": [
        "header_compare", 
        "header_symbol_search", 
        "use_localstorage_for_settings"
      ]
    });
  };

  if (!target) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#050a0f] border border-gray-800 rounded relative overflow-hidden group">
         <div className="absolute top-2 right-2 z-50">
            <button onClick={onToggleMaximize} className="text-gray-600 hover:text-white transition-colors p-2">
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
         </div>
         <div className="z-10 flex flex-col items-center text-gray-700">
            <BarChart2 className="mb-4 text-gray-800" size={64} />
            <p className="font-tech text-lg tracking-widest uppercase">Select Asset to Initialize Chart</p>
         </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#050a0f] border border-gray-800 rounded relative overflow-hidden font-tech">
      
      {/* Header Overlay (only visible if not maximized or briefly on hover) */}
      {!isMaximized && (
        <div className="absolute top-0 right-0 z-50 p-2 opacity-0 hover:opacity-100 transition-opacity">
            <button onClick={onToggleMaximize} className="bg-black/50 text-gray-400 hover:text-white p-2 rounded backdrop-blur-md border border-gray-700">
                <Maximize2 size={16} />
            </button>
        </div>
      )}

      {/* Maximize/Minimize when Maximized */}
      {isMaximized && (
        <div className="absolute top-0 right-0 z-50 p-2">
            <button onClick={onToggleMaximize} className="bg-black/50 text-gray-400 hover:text-white p-2 rounded backdrop-blur-md border border-gray-700">
                <Minimize2 size={16} />
            </button>
        </div>
      )}

      {/* TradingView Container - Explicit ID for the library */}
      <div id="tradingview_widget" ref={containerRef} className="w-full h-full"></div>
      
      {/* News Overlay Ticker (Overlaid at bottom) */}
      {target.newsFlash && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-gray-800 text-[10px] font-mono text-gray-400 p-1 px-4 marquee whitespace-nowrap overflow-hidden pointer-events-none z-40">
            <span className="animate-pulse text-red-400 mr-2">[LIVE WIRE]</span> {target.newsFlash}
        </div>
      )}
    </div>
  );
};

export default Visualizer;
