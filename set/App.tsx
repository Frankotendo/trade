
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Terminal from './components/Terminal';
import MissionHub from './components/MissionHub';
import Visualizer from './components/Visualizer';
import TutorBoard from './components/TutorBoard';
import BossWidget from './components/BossWidget';
import IntelTerminal from './components/IntelTerminal'; // NEW
import { GameState, TradeSetup, Asset, TerminalLine, AssetClass, Lecture, Portfolio, TradingMode, NewsItem, WhaleAlert } from './types';
import { executeCommand, generateSpeech, generateTarget, generateNewMissions, generateLecture, generateLiveTradeCommentary, fetchMarketNews, generateStrategicPlan } from './services/geminiService';
import { MarketService, createInitialLiveAssets, getLiveAssetList } from './services/marketService'; // Updated
import { TrendingUp, Monitor, Activity, Radio, GraduationCap, Wifi, WifiOff, Globe } from 'lucide-react';

const TRADING_SCENARIOS: TradeSetup[] = [
  {
    id: 's1',
    title: 'SETUP: BITCOIN BREAKOUT',
    difficulty: 'Beginner',
    description: 'BTC/USD is consolidating near $95k resistance. Identify the breakout pattern.',
    objectives: ['Identify Resistance', 'Check Volume', 'Long on Breakout'],
    assetId: 'a1',
    completed: false,
    recommendedTools: ['RSI', 'Volume', 'Trendline'],
    briefing: "Apex here. Bitcoin is coiling up like a spring. We are seeing lower highs and higher lows. This is a classic compression. Watch the volume. If it breaks $95k, we ride."
  },
  {
    id: 's2',
    title: 'SETUP: TESLA REVERSAL',
    difficulty: 'Intermediate',
    description: 'TSLA has dropped 15% in 3 days. RSI is oversold (22). Look for a bounce.',
    objectives: ['Confirm Oversold RSI', 'Spot Bullish Divergence', 'Catch the Knife'],
    assetId: 'a2',
    completed: false,
    recommendedTools: ['RSI', 'MACD', 'Fibonacci'],
    briefing: "Tesla is bleeding, but the panic selling is drying up. RSI is screaming oversold. I smell a dead cat bounce or a full reversal. Don't be greedy."
  },
  {
    id: 's3',
    title: 'SETUP: FOREX SCALP',
    difficulty: 'Advanced',
    description: 'EUR/USD liquidity sweep on the 15m chart. Short the deviation.',
    objectives: ['Identify Liquidity Grab', 'Short the Reclaim', 'Tight Stop Loss'],
    assetId: 'a3',
    completed: false,
    recommendedTools: ['Order Block', 'FVG'],
    briefing: "Euro just took out the Asian session highs. That's a fake out. Retail is trapped long. We short the reclaim of the range. Precision execution needed."
  }
];

const INITIAL_ASSETS: Record<string, Asset> = {
  'a1': {
    id: 'a1',
    ticker: 'BTC/USD',
    name: 'Bitcoin',
    type: AssetClass.CRYPTO,
    price: 94850.00,
    change24h: 2.4,
    volatility: 'Medium',
    trend: 'Bullish',
    indicators: ['Volume Spike', 'Resistance Test'],
    description: 'Digital Gold.',
    newsFlash: 'SEC hints at new crypto regulations.',
    tvSymbol: 'BINANCE:BTCUSDT'
  },
  'a2': {
    id: 'a2',
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    type: AssetClass.STOCKS,
    price: 210.50,
    change24h: -5.2,
    volatility: 'Extreme',
    trend: 'Bearish',
    indicators: ['RSI Oversold (22)', 'High Sell Volume'],
    description: 'EV Manufacturer.',
    newsFlash: 'Production delays reported in Berlin factory.',
    tvSymbol: 'NASDAQ:TSLA'
  },
  'a3': {
    id: 'a3',
    ticker: 'EUR/USD',
    name: 'Euro / US Dollar',
    type: AssetClass.FOREX,
    price: 1.0850,
    change24h: 0.1,
    volatility: 'Low',
    trend: 'Neutral',
    indicators: ['Liquidity Sweep'],
    description: 'Major Forex Pair.',
    newsFlash: 'ECB Rate Decision pending.',
    tvSymbol: 'FX:EURUSD'
  }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type PanelId = 'none' | 'mission' | 'visualizer' | 'terminal' | 'tutor' | 'intel';
type RightPanelMode = 'tactical' | 'classroom' | 'intel';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    mode: 'SIMULATION',
    portfolio: {
        balance: 100000,
        positions: [],
        equity: 100000
    },
    currentMissionId: null,
    missions: TRADING_SCENARIOS,
    targets: INITIAL_ASSETS,
    terminalHistory: [{ type: 'system', content: 'TradeSim Alpha OS v4.2 Initialized...\nMarket Data Feed: CONNECTED.\nType "help" for commands.\nType "learn [topic]" for masterclass.', timestamp: Date.now() }],
    newsFeed: [],
    whaleAlerts: [],
    isProcessing: false,
    isPlayingAudio: false,
    activeLecture: null
  });

  const [maximizedPanel, setMaximizedPanel] = useState<PanelId>('none');
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('tactical');
  
  // Unified Market Service
  const marketService = useRef<MarketService | null>(null);

  const toggleMaximize = (panel: PanelId) => {
    setMaximizedPanel(prev => prev === panel ? 'none' : panel);
  };

  const audioContextRef = useRef<AudioContext | null>(null);

  const pcmToAudioBuffer = (
    data: ArrayBuffer,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): AudioBuffer => {
    const dataInt16 = new Int16Array(data);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const playAudio = useCallback(async (buffer: ArrayBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    try {
      const audioBuffer = pcmToAudioBuffer(buffer, ctx);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      setGameState(prev => ({ ...prev, isPlayingAudio: true }));
      
      source.onended = () => {
        setGameState(prev => ({ ...prev, isPlayingAudio: false }));
      };
      
      source.start(0);
    } catch (e) {
      setGameState(prev => ({ ...prev, isPlayingAudio: false }));
    }
  }, []);

  const speak = useCallback(async (text: string) => {
      if (!process.env.API_KEY) {
          return;
      }
      const audioData = await generateSpeech(text);
      if (audioData) {
        playAudio(audioData);
      }
  }, [playAudio]);

  // Handle Mode Switch
  const toggleTradingMode = useCallback(() => {
    setGameState(prev => {
        const nextMode = prev.mode === 'SIMULATION' ? 'LIVE_PAPER' : 'SIMULATION';
        const msg = nextMode === 'LIVE_PAPER' 
            ? 'SWITCHING TO LIVE DATA FEED (BINANCE + GLOBAL SYNTH). PAPER EXECUTION ENABLED.' 
            : 'RETURNING TO SIMULATION SCENARIOS.';
        
        // Handle WS connection
        if (nextMode === 'LIVE_PAPER') {
            if (!marketService.current) {
                marketService.current = new MarketService(
                    (updates) => {
                        setGameState(current => {
                            const newTargets = { ...current.targets };
                            updates.forEach(u => {
                                if (newTargets[u.id!]) {
                                    newTargets[u.id!] = { ...newTargets[u.id!], ...u };
                                }
                            });
                            
                            // Update Portfolio Equity
                            let currentEquity = current.portfolio.balance;
                            const newPositions = current.portfolio.positions.map(pos => {
                                 const asset = newTargets[pos.symbol];
                                 const currentPrice = asset ? asset.price : pos.entryPrice;
                                 const upnl = (currentPrice - pos.entryPrice) * pos.size * (pos.side === 'LONG' ? 1 : -1);
                                 currentEquity += (pos.entryPrice * pos.size) + upnl; 
                                 return { ...pos, unrealizedPnL: upnl };
                            });

                            return {
                                ...current,
                                targets: newTargets,
                                portfolio: {
                                    ...current.portfolio,
                                    positions: newPositions,
                                    equity: currentEquity
                                }
                            };
                        });
                    },
                    (whale) => {
                        setGameState(current => ({
                            ...current,
                            whaleAlerts: [whale, ...current.whaleAlerts].slice(0, 20)
                        }));
                    }
                );
            }
            
            // Connect to Live List
            const liveList = getLiveAssetList().filter(s => s.endsWith('USDT')); // Filter for Binance only part
            marketService.current.connect(liveList);
            
            const liveAssets = createInitialLiveAssets();
            const liveMissions = Object.keys(liveAssets).map((sym, i) => ({
                 id: `live-m-${i}`,
                 title: `LIVE: ${sym}`,
                 difficulty: 'Whale' as any,
                 description: 'Real-time market trading.',
                 objectives: ['Profit'],
                 assetId: sym,
                 completed: false,
                 recommendedTools: ['Price Action'],
                 briefing: 'Live fire exercise. Real data. Paper money. Don\'t lose it all.'
            }));

            // Refresh news for live assets
            fetchMarketNews(['BTC', 'ETH', 'TSLA', 'SPY', 'EURUSD']).then(news => {
                setGameState(c => ({...c, newsFeed: news}));
            });

            return {
                ...prev,
                mode: nextMode,
                targets: liveAssets,
                missions: liveMissions,
                currentMissionId: liveMissions[0].id,
                terminalHistory: [...prev.terminalHistory, { type: 'system', content: msg, timestamp: Date.now() }]
            };
        } else {
            marketService.current?.disconnect();
            return {
                ...prev,
                mode: nextMode,
                targets: INITIAL_ASSETS,
                missions: TRADING_SCENARIOS,
                currentMissionId: TRADING_SCENARIOS[0].id,
                terminalHistory: [...prev.terminalHistory, { type: 'system', content: msg, timestamp: Date.now() }]
            };
        }
    });
  }, []);

  const handleSelectMission = async (id: string) => {
    const mission = gameState.missions.find(m => m.id === id);
    if (!mission) return;

    if (gameState.mode === 'SIMULATION') {
        let asset = gameState.targets[mission.assetId];
        if (!asset) {
            setGameState(prev => ({...prev, isProcessing: true}));
            const typeHint = mission.title.includes('CRYPTO') ? 'Crypto' : 
                            mission.title.includes('FOREX') ? 'Forex' : 'Stocks';

            asset = await generateTarget(mission.assetId, `${mission.description} Asset Type: ${typeHint}`);
            setGameState(prev => ({
                ...prev,
                isProcessing: false,
                targets: { ...prev.targets, [asset.id]: asset }
            }));
        }
    }

    setGameState(prev => ({
      ...prev,
      currentMissionId: id,
      terminalHistory: [
        ...prev.terminalHistory,
        { type: 'system', content: `\n// SWITCHING FEED: ${mission.title}`, timestamp: Date.now() }
      ]
    }));
    
    setRightPanelMode('tactical');
    if (gameState.mode === 'SIMULATION') {
        speak(mission.briefing);
    }
  };

  // --- LECTURE LOGIC ---

  const handleStartLecture = async (topic: string) => {
      setRightPanelMode('classroom');
      setGameState(prev => ({
            ...prev,
            isProcessing: true,
            terminalHistory: [...prev.terminalHistory, { type: 'system', content: `\n// ACCESSING ALPHA LIBRARY: ${topic.toUpperCase()}...`, timestamp: Date.now() }]
      }));

      const lecture = await generateLecture(topic);
        
      setGameState(prev => ({
            ...prev,
            isProcessing: false,
            activeLecture: lecture,
            terminalHistory: [
                ...prev.terminalHistory,
                { type: 'system', content: `// MASTERCLASS READY: ${topic.toUpperCase()}`, timestamp: Date.now() }
            ]
      }));
        
      if (lecture.steps.length > 0) {
            speak(lecture.steps[0].voiceScript);
      }
  };

  const handleNextLectureStep = () => {
      if (!gameState.activeLecture) return;

      const nextIndex = gameState.activeLecture.currentStepIndex + 1;
      
      if (nextIndex < gameState.activeLecture.steps.length) {
          const nextStep = gameState.activeLecture.steps[nextIndex];
          setGameState(prev => ({
              ...prev,
              activeLecture: {
                  ...prev.activeLecture!,
                  currentStepIndex: nextIndex
              }
          }));
          speak(nextStep.voiceScript);
      } else {
           setGameState(prev => ({
              ...prev,
              activeLecture: null,
              terminalHistory: [
                  ...prev.terminalHistory,
                  { type: 'system', content: `\n// SESSION ENDED: ${prev.activeLecture!.topic}. BACK TO THE CHARTS.`, timestamp: Date.now() }
              ]
          }));
          speak("Class dismissed. Now show me you can make money.");
      }
  };

  const handleNewsRefresh = async () => {
      setGameState(prev => ({
          ...prev,
          terminalHistory: [...prev.terminalHistory, { type: 'system', content: '// FETCHING GLOBAL INTELLIGENCE...', timestamp: Date.now() }]
      }));
      
      // Get tickers from active missions
      const tickers = gameState.missions.map(m => m.title.split(':')[1]?.trim() || 'BTC').slice(0, 4);
      const uniqueTickers = Array.from(new Set(tickers));
      
      const news = await fetchMarketNews(uniqueTickers);
      setGameState(prev => ({ ...prev, newsFeed: news }));
  };

  const handleCommand = async (cmd: string) => {
    if (cmd === 'clear') {
      setGameState(prev => ({ ...prev, terminalHistory: [] }));
      return;
    }
    if (cmd === 'help') {
      const helpText = gameState.mode === 'LIVE_PAPER'
        ? 'COMMANDS (LIVE):\n- long [ticker] [amt] : Buy\n- short [ticker] [amt] : Sell\n- portfolio : View PnL\n- strategy : AI Plan\n- intel : Check News'
        : 'COMMANDS (SIM):\n- analyze [ticker]\n- long [ticker]\n- learn [topic]\n- gen setups';
        
      setGameState(prev => ({ 
        ...prev, 
        terminalHistory: [...prev.terminalHistory, { type: 'system', content: helpText, timestamp: Date.now() }] 
      }));
      return;
    }
    
    // --- STRATEGY COMMAND ---
    if (cmd === 'strategy' || cmd === 'plan') {
         setGameState(prev => ({ 
            ...prev, 
            terminalHistory: [...prev.terminalHistory, { type: 'input', content: cmd, timestamp: Date.now() }, { type: 'system', content: '// ANALYZING ALPHA OPPORTUNITIES...', timestamp: Date.now() }] 
        }));
        
        const activeAssets = Object.values(gameState.targets).slice(0, 5); // Take top assets
        const plan = await generateStrategicPlan(gameState.portfolio, activeAssets);
        
        setGameState(prev => ({ 
            ...prev, 
            terminalHistory: [...prev.terminalHistory, { type: 'output', content: `[APEX STRATEGY]\n${plan}`, timestamp: Date.now() }] 
        }));
        speak(plan);
        return;
    }

    // --- PORTFOLIO COMMAND ---
    if (cmd === 'portfolio' || cmd === 'bal' || cmd === 'pnl') {
        const p = gameState.portfolio;
        const positionsTable = p.positions.length > 0 
            ? p.positions.map(pos => {
                const pnl = pos.unrealizedPnL;
                const pnlStr = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
                return `${pos.symbol.padEnd(8)} ${pos.side.padEnd(6)} ${pos.entryPrice.toFixed(2).padEnd(10)} ${pnlStr}`;
              }).join('\n')
            : 'NO OPEN POSITIONS';

        const table = `
=== PORTFOLIO REPORT ===
CASH:   $${p.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
EQUITY: $${p.equity.toLocaleString(undefined, {minimumFractionDigits: 2})}
------------------------------------
SYMBOL   SIDE   ENTRY      PNL
${positionsTable}
        `;
        setGameState(prev => ({ 
            ...prev, 
            terminalHistory: [...prev.terminalHistory, { type: 'input', content: cmd, timestamp: Date.now() }, { type: 'output', content: table, timestamp: Date.now() }] 
        }));
        return;
    }

    if (cmd === 'intel') {
        setRightPanelMode('intel');
        return;
    }

    if (cmd === 'gen setups' || cmd === 'scan') {
        if (gameState.mode === 'LIVE_PAPER') {
            setGameState(prev => ({
                ...prev,
                terminalHistory: [...prev.terminalHistory, { type: 'error', content: 'Scan not available in LIVE mode.', timestamp: Date.now() }]
            }));
            return;
        }
        setGameState(prev => ({
            ...prev,
            terminalHistory: [...prev.terminalHistory, { type: 'input', content: cmd, timestamp: Date.now() }]
        }));
        // ... (existing logic)
        return;
    }

    if (cmd.startsWith('learn ') || cmd.startsWith('teach ')) {
        const topic = cmd.replace(/^(learn|teach)\s+/, '');
        handleStartLecture(topic);
        return;
    }

    // --- LIVE MODE EXECUTION ---
    if (gameState.mode === 'LIVE_PAPER' && (cmd.startsWith('long') || cmd.startsWith('short') || cmd.startsWith('buy') || cmd.startsWith('sell'))) {
         setGameState(prev => ({ 
            ...prev, 
            terminalHistory: [...prev.terminalHistory, { type: 'input', content: cmd, timestamp: Date.now() }] 
        }));

        const parts = cmd.split(' ');
        const side = parts[0].toLowerCase().includes('long') || parts[0].includes('buy') ? 'LONG' : 'SHORT';
        const ticker = parts[1]?.toUpperCase();
        const amount = parseFloat(parts[2]) || 0;

        if (!ticker || !amount) {
            setGameState(prev => ({ 
                ...prev, 
                terminalHistory: [...prev.terminalHistory, { type: 'error', content: `USAGE: ${side.toLowerCase()} [SYMBOL] [AMOUNT]`, timestamp: Date.now() }] 
            }));
            return;
        }

        // Simple validation
        const asset = Object.values(gameState.targets).find(a => a.ticker === ticker);
        if (!asset || asset.price === 0) {
             setGameState(prev => ({ 
                ...prev, 
                terminalHistory: [...prev.terminalHistory, { type: 'error', content: `ERROR: Invalid Ticker or No Liquidity for ${ticker}`, timestamp: Date.now() }] 
            }));
            return;
        }

        const cost = asset.price * amount;
        if (cost > gameState.portfolio.balance) {
             setGameState(prev => ({ 
                ...prev, 
                terminalHistory: [...prev.terminalHistory, { type: 'error', content: `ERROR: Insufficient Buying Power. Req: $${cost.toFixed(2)}`, timestamp: Date.now() }] 
            }));
            return;
        }

        // Execute Live Paper Trade
        const newPos = {
            symbol: asset.ticker,
            side: side,
            entryPrice: asset.price,
            size: amount,
            unrealizedPnL: 0
        };

        setGameState(prev => ({
            ...prev,
            portfolio: {
                ...prev.portfolio,
                balance: prev.portfolio.balance - cost,
                positions: [...prev.portfolio.positions, newPos as any]
            },
            terminalHistory: [...prev.terminalHistory, { type: 'output', content: `[EXECUTION] ${side} ${amount} ${ticker} @ ${asset.price}\nORDER ID: ${Date.now()}`, timestamp: Date.now() }]
        }));

        // Get AI Commentary
        const commentary = await generateLiveTradeCommentary(`${side} ${amount} ${ticker}`, asset, gameState.portfolio);
        speak(commentary);
        return;
    }

    // --- SIMULATION LOGIC ---
    let mission = gameState.currentMissionId ? gameState.missions.find(m => m.id === gameState.currentMissionId)! : null;
    let asset = mission ? gameState.targets[mission.assetId] : null;

    if (!mission) {
         mission = { id: 'lobby', title: 'MARKET OVERVIEW', difficulty: 'Beginner', description: 'General Market', objectives: [], assetId: 'none', completed: false, recommendedTools: [], briefing: '' };
         asset = { id: 'none', ticker: 'SPY', name: 'S&P 500', type: AssetClass.INDICES, price: 450.00, change24h: 0.5, volatility: 'Low', trend: 'Neutral', indicators: [], description: 'General Market', newsFlash: '' };
    }

    setGameState(prev => ({ 
        ...prev, 
        isProcessing: true,
        terminalHistory: [...prev.terminalHistory, { type: 'input', content: cmd, timestamp: Date.now() }] 
    }));

    const isExecution = cmd.includes('long') || cmd.includes('short') || cmd.includes('buy') || cmd.includes('sell');
    if (isExecution) await wait(1000);

    const historySummary = gameState.terminalHistory.slice(-5).map(l => l.content).join('\n');
    const result = await executeCommand(cmd, mission, asset, historySummary);

    // ... (rest of update logic) ...
    let newMissions = [...gameState.missions];
    let newAssets = { ...gameState.targets };
    let didCompleteMission = false;

    if (result.assetUpdate && mission && mission.id !== 'lobby') {
        const currentAsset = newAssets[mission.assetId];
        newAssets[mission.assetId] = {
            ...currentAsset,
            ...result.assetUpdate,
            indicators: Array.from(new Set([...currentAsset.indicators, ...(result.assetUpdate.indicators || [])]))
        };
    }

    if (result.missionUpdate?.status === 'completed' && mission && mission.id !== 'lobby') {
         const mIndex = newMissions.findIndex(m => m.id === mission.id);
         if (mIndex > -1 && !newMissions[mIndex].completed) {
             newMissions[mIndex].completed = true;
             didCompleteMission = true;
         }
    }

    setGameState(prev => ({
        ...prev,
        isProcessing: false,
        missions: newMissions,
        targets: newAssets,
        terminalHistory: [
            ...prev.terminalHistory,
            { type: 'output', content: result.terminalOutput, timestamp: Date.now() },
        ]
    }));

    speak(result.instructorCommentary);
    // ...
  };

  const handleVoiceCommand = (text: string) => {
    setGameState(prev => ({
        ...prev,
        terminalHistory: [...prev.terminalHistory, { type: 'system', content: `\n// VOICE COMMS: "${text}"`, timestamp: Date.now() }]
    }));
    handleCommand(text);
  };

  return (
    <div className="relative w-screen h-screen bg-[#010203] text-gray-200 overflow-hidden font-rajdhani crt">
      <div className="relative z-10 flex flex-col h-full p-2 md:p-4 gap-4">
        
        {/* Header */}
        <header className="flex items-center justify-between bg-[#050a0f] border border-gray-800 p-3 rounded shrink-0 z-50">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-900/20 border border-emerald-500/50 rounded flex items-center justify-center">
                    <TrendingUp className="text-emerald-400" size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-widest text-white uppercase font-tech">TradeSim <span className="text-emerald-500">ALPHA</span></h1>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                         {gameState.mode === 'LIVE_PAPER' ? (
                            <div className="flex items-center gap-2 text-red-500 animate-pulse font-bold">
                                <Wifi size={12} /> LIVE FEED (MULTI-ASSET)
                            </div>
                         ) : (
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                MARKET SIMULATION
                            </div>
                         )}
                    </div>
                </div>
            </div>
            
            {/* Mode Switcher */}
            <div className="hidden md:flex bg-gray-900 rounded p-1 border border-gray-800">
                <button 
                    onClick={() => setRightPanelMode('tactical')}
                    className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${rightPanelMode === 'tactical' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Activity size={14} /> TERMINAL
                </button>
                <button 
                    onClick={() => setRightPanelMode('intel')}
                    className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${rightPanelMode === 'intel' ? 'bg-orange-900/50 text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Globe size={14} /> INTEL
                </button>
                <button 
                     onClick={() => setRightPanelMode('classroom')}
                    className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${rightPanelMode === 'classroom' ? 'bg-emerald-900/50 text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <GraduationCap size={14} /> ACADEMY
                </button>
                <div className="w-[1px] bg-gray-700 mx-1"></div>
                <button 
                     onClick={toggleTradingMode}
                     className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${gameState.mode === 'LIVE_PAPER' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {gameState.mode === 'LIVE_PAPER' ? 'LIVE MODE' : 'SIM MODE'}
                </button>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Portfolio Equity</div>
                    <div className={`text-sm font-mono ${gameState.portfolio.equity >= 100000 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${gameState.portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Paper)
                    </div>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 relative z-30">
            {/* Left Panel (Missions/Setups) */}
            <div className={`
                ${maximizedPanel === 'mission' ? 'md:col-span-12 z-40 absolute inset-0 bg-[#020202]' : 'md:col-span-3'} 
                ${maximizedPanel !== 'none' && maximizedPanel !== 'mission' ? 'hidden' : 'flex'}
                flex-col h-full min-h-0 transition-all duration-300
            `}>
                <MissionHub 
                    missions={gameState.missions} 
                    currentMissionId={gameState.currentMissionId}
                    onSelectMission={handleSelectMission}
                    targets={gameState.targets}
                    isMaximized={maximizedPanel === 'mission'}
                    onToggleMaximize={() => toggleMaximize('mission')}
                />
            </div>

            {/* Right Panel Container */}
            <div className={`
                ${maximizedPanel === 'visualizer' || maximizedPanel === 'terminal' || maximizedPanel === 'tutor' || maximizedPanel === 'intel' ? 'md:col-span-12 z-40 absolute inset-0 bg-[#020202]' : 'md:col-span-9'}
                ${maximizedPanel === 'mission' ? 'hidden' : 'flex'}
                flex-col gap-4 h-full min-h-0 transition-all duration-300
            `}>
                
                {/* Visualizer / Tutor / Intel Area */}
                <div className={`
                    ${maximizedPanel === 'visualizer' || maximizedPanel === 'tutor' || maximizedPanel === 'intel' ? 'h-full' : 'h-[40%]'}
                    ${maximizedPanel === 'terminal' ? 'hidden' : 'block'}
                    transition-all duration-300
                `}>
                    {rightPanelMode === 'tactical' ? (
                        <Visualizer 
                            target={gameState.currentMissionId ? gameState.targets[gameState.missions.find(m => m.id === gameState.currentMissionId)!.assetId] : null} 
                            isMaximized={maximizedPanel === 'visualizer'}
                            onToggleMaximize={() => toggleMaximize('visualizer')}
                        />
                    ) : rightPanelMode === 'intel' ? (
                        <IntelTerminal 
                            news={gameState.newsFeed}
                            whales={gameState.whaleAlerts}
                            onRefreshNews={handleNewsRefresh}
                            isMaximized={maximizedPanel === 'intel'}
                            onToggleMaximize={() => toggleMaximize('intel')}
                        />
                    ) : (
                        <TutorBoard 
                            lecture={gameState.activeLecture}
                            onNextStep={handleNextLectureStep}
                            onStartLecture={handleStartLecture}
                            isMaximized={maximizedPanel === 'tutor'}
                            onToggleMaximize={() => toggleMaximize('tutor')}
                            isLoading={gameState.isProcessing}
                            isPlayingAudio={gameState.isPlayingAudio}
                        />
                    )}
                </div>
                
                {/* Terminal */}
                <div className={`
                    ${maximizedPanel === 'terminal' ? 'h-full' : 'flex-1'}
                    ${maximizedPanel === 'visualizer' || maximizedPanel === 'tutor' || maximizedPanel === 'intel' ? 'hidden' : 'block'}
                    min-h-0 transition-all duration-300
                `}>
                    <Terminal 
                        history={gameState.terminalHistory} 
                        onCommand={handleCommand} 
                        isProcessing={gameState.isProcessing}
                        isMaximized={maximizedPanel === 'terminal'}
                        onToggleMaximize={() => toggleMaximize('terminal')}
                        mode={gameState.mode}
                    />
                </div>
            </div>
        </main>
        
        <BossWidget 
            onVoiceCommand={handleVoiceCommand}
            isProcessing={gameState.isProcessing}
            isSpeaking={gameState.isPlayingAudio}
        />

      </div>
    </div>
  );
};

export default App;
