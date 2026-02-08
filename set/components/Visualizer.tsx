
import React, { useEffect, useRef } from 'react';
import { Asset } from '../types';
import { BarChart2 } from 'lucide-react';

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

const Visualizer: React.FC<VisualizerProps> = ({ target, isMaximized }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSymbolRef = useRef<string | null>(null);

  useEffect(() => {
    const targetSymbol = target?.tvSymbol || (target ? `BINANCE:${target.ticker}` : null);
    if (targetSymbol === currentSymbolRef.current && !isMaximized) return;
    currentSymbolRef.current = targetSymbol;

    const initWidget = () => {
        if (!target || !containerRef.current || !window.TradingView) return;
        containerRef.current.innerHTML = ''; 
        new window.TradingView.widget({
          "width": "100%",
          "height": "100%",
          "symbol": targetSymbol,
          "interval": "15",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "save_image": false,
          "backgroundColor": "rgba(5, 10, 15, 1)",
          "gridColor": "rgba(42, 46, 57, 0.3)",
          "container_id": "tradingview_widget",
          "toolbar_bg": "#050a0f",
          "studies": ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
          "disabled_features": ["header_compare", "header_symbol_search"]
        });
    };

    if (!document.getElementById('tv-widget-script')) {
      const script = document.createElement('script');
      script.id = 'tv-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else if (window.TradingView) {
      initWidget();
    }
  }, [target?.id, isMaximized]); 

  if (!target) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#050a0f] border border-gray-800 rounded relative group">
         <div className="flex flex-col items-center text-gray-700">
            <BarChart2 className="mb-4 text-gray-800 animate-pulse" size={64} />
            <p className="font-tech text-lg tracking-widest uppercase opacity-40">Awaiting Target Initialization</p>
         </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#050a0f] border border-gray-800 rounded relative overflow-hidden font-tech">
      <div id="tradingview_widget" ref={containerRef} className="w-full h-full"></div>
    </div>
  );
};

export default Visualizer;
