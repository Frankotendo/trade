
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { TradeSetup, Asset, SimulationResponse, AssetClass, Lecture, Portfolio, NewsItem } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const PRIMARY_MODEL = 'gemini-3-flash-preview';
const FALLBACK_MODEL = 'gemini-2.0-flash-exp';

// ... (keep helper functions like cleanJSON) ...
const cleanJSON = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.replace(/```json\s*|```/g, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  
  let start = -1;
  let end = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
  } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
  }

  if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned.trim();
};

async function generateWithFallback(prompt: string, config: any) {
    const ai = getAI();
    try {
        return await ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: config
        });
    } catch (error: any) {
        // Fallback doesn't support tools usually, so we strip them if retrying with lighter model
        const newConfig = { ...config };
        if (newConfig.tools) delete newConfig.tools;

        return await ai.models.generateContent({
            model: FALLBACK_MODEL,
            contents: prompt,
            config: newConfig
        });
    }
}

export const fetchMarketNews = async (tickers: string[]): Promise<NewsItem[]> => {
    if (!process.env.API_KEY) return [];

    const prompt = `Find the latest financial news for: ${tickers.join(', ')}. 
    Return 3 most critical headlines affecting these assets right now.`;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            headline: { type: Type.STRING },
                            source: { type: Type.STRING },
                            sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] }
                        }
                    }
                }
            }
        });

        // Extract grounding metadata if available for URLs
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const webChunks = chunks.filter((c: any) => c.web);
        
        const rawItems = JSON.parse(cleanJSON(response.text || "[]"));
        
        return rawItems.map((item: any, idx: number) => ({
            id: `news-${Date.now()}-${idx}`,
            headline: item.headline,
            source: item.source || 'Market Wire',
            sentiment: item.sentiment,
            timestamp: Date.now(),
            url: webChunks[idx]?.web?.uri || '#'
        }));

    } catch (e) {
        console.error("News Fetch Failed", e);
        return [
            { id: 'err', headline: 'AI News Feed Offline - Rely on Price Action', source: 'System', sentiment: 'Neutral', timestamp: Date.now() }
        ];
    }
}

export const generateStrategicPlan = async (portfolio: Portfolio, assets: Asset[]): Promise<string> => {
    if (!process.env.API_KEY) return "System Offline.";

    const assetSummary = assets.map(a => `${a.ticker}: $${a.price.toFixed(2)} (${a.trend})`).join('\n');
    const portSummary = `Cash: ${portfolio.balance}, Equity: ${portfolio.equity}. Pos: ${portfolio.positions.map(p => p.symbol).join(', ')}`;

    const prompt = `
        ACT AS: Apex (Hedge Fund Manager).
        TASK: Analyze this portfolio and market data. Suggest a specific high-probability trade strategy.
        MARKET DATA:
        ${assetSummary}
        PORTFOLIO:
        ${portSummary}

        OUTPUT: A concise, tactical trade plan (Entry, Stop Loss, Rationale). Be direct.
    `;

    const response = await generateWithFallback(prompt, { responseMimeType: 'text/plain' });
    return response.text || "Hold positions.";
}

// ... (Existing functions: executeCommand, generateLiveTradeCommentary, generateSpeech, generateNewMissions, generateTarget, generateLecture) ...

export const executeCommand = async (
  command: string,
  mission: TradeSetup,
  asset: Asset,
  historySummary: string
): Promise<SimulationResponse> => {
  
  if (!process.env.API_KEY) {
      return {
          terminalOutput: `[SYSTEM ERROR] MARKET DATA DISCONNECTED.\n\nERROR CODE: NO_LIQUIDITY_PROVIDER\nDETAILS: API_KEY missing.`,
          instructorCommentary: "We are flying blind here. Get the API key fixed or we lose money.",
          missionUpdate: { status: 'failed' }
      };
  }

  const prompt = `
    ACT AS: "Apex" (The Wolf of this Market).
    PERSONALITY: You are a ruthless, high-performance Hedge Fund Manager. You care about Alpha, Risk-Reward Ratios, and Psychology. You speak in trading axioms (e.g., "The trend is your friend," "Buy the fear," "Liquidity hunt"). 
    TONE: Sharp, professional, demanding, but mentorship-focused. Use financial slang (e.g., "Bagholder," "Moonbag," "Rekt," "Wick," "FUD," "Alpha").
    
    KNOWLEDGE BASE (REAL TRADING INTEGRATION):
    If the user asks about "Real Trading", "Binance API Key", or "Real Money", you MUST explain:
    1. SECURITY WARNING: Never put API Secret Keys in a frontend/browser app. It leads to funds being stolen.
    2. ARCHITECTURE: To trade for real, they need a "Backend-for-Frontend" (Node.js/Python server) to hold the keys and sign requests.
    3. CURRENT STATE: This terminal is currently in "Paper Mode" (Real Data, Fake Money) for safety.
    
    CONTEXT: The user is a Junior Analyst/Trader in a simulation terminal.
    
    TRADE SETUP:
    - Operation: ${mission.title}
    - Objective: ${mission.description}
    - Asset: ${asset.ticker} (${asset.type})
    - Price: ${asset.price}
    - Trend: ${asset.trend}
    - Indicators: ${asset.indicators.join(', ')}
    
    CONSOLE HISTORY (Last 5 lines):
    ${historySummary}
    
    USER INPUT: "${command}"
    
    TASK: Generate a simulation response in JSON.
    
    GUIDELINES:
    1. INPUT ANALYSIS:
       - If input is ANALYTICAL (e.g. 'analyze', 'chart', 'rsi', 'volume'): Provide technical analysis output.
       - If input is EXECUTION (e.g. 'long', 'short', 'buy', 'sell'): Calculate a fictional outcome. Did they profit? Did they hit stop loss?
       - If input is HELP/CHAT: Mentor them on the psychology of the current setup.
       
    2. 'terminalOutput': 
       - MUST look like a financial terminal (Bloomberg/TradingView style). Use formatted tables or bullet points.
       
    3. 'instructorCommentary': The "Apex" giving feedback. Harsh if they gamble, praising if they managed risk.
    
    4. 'assetUpdate': Update price/indicators dynamically based on the "story" of the trade.
  `;

  try {
    const response = await generateWithFallback(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            terminalOutput: { type: Type.STRING },
            instructorCommentary: { type: Type.STRING },
            missionUpdate: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['ongoing', 'completed', 'failed'] },
                progressLog: { type: Type.STRING }
              }
            },
            assetUpdate: {
              type: Type.OBJECT,
              properties: {
                price: { type: Type.NUMBER },
                indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                change24h: { type: Type.NUMBER },
                trend: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] }
              }
            },
            systemAction: { type: Type.STRING, enum: ['none', 'generate_missions'] },
            suggestedMissionTopic: { type: Type.STRING }
          }
        }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(cleanJSON(text)) as SimulationResponse;
  } catch (error: any) {
    console.error("Simulation Error:", error);
    return {
      terminalOutput: `[EXCHANGE ERROR] Order book unavailable.\n\nDEBUG INFO:\n${error.message}`,
      instructorCommentary: "The exchange is down. Sit on your hands.",
      missionUpdate: { status: 'ongoing' }
    };
  }
};

export const generateLiveTradeCommentary = async (
    action: string,
    asset: Asset,
    portfolio: Portfolio
): Promise<string> => {
    if (!process.env.API_KEY) return "Trade executed.";

    const prompt = `
    ACT AS: "Apex" (Hedge Fund Manager).
    CONTEXT: LIVE MARKET TRADING (Paper Money, Real Data).
    
    USER ACTION: ${action}
    ASSET: ${asset.ticker} @ $${asset.price}
    PORTFOLIO EQUITY: $${portfolio.equity.toFixed(2)}
    
    TASK: Comment on this live market move. Be brief (1-2 sentences). 
    If they bought a dip, praise the guts. If they FOMO'd at highs (check price vs volatility), mock them.
    `;

    try {
         const response = await generateWithFallback(prompt, {
            responseMimeType: "text/plain",
         });
         return response.text || "Trade executed on the live books.";
    } catch (e) {
        return "Order filled.";
    }
}

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  if (!text || text.trim().length === 0) return null;
  if (!process.env.API_KEY) return null;

  try {
    const ai = getAI();
    const safeText = text.slice(0, 4000); 

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: safeText }] }],
      config: {
        responseModalities: ["AUDIO" as any], 
        speechConfig: {
          voiceConfig: {
            // 'Fenrir' is a deeper, more authoritative male voice suitable for "Apex"
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error: any) {
    console.error("TTS generation failed:", error);
    return null;
  }
};

export const generateNewMissions = async (completedCount: number, focusTopic?: string): Promise<TradeSetup[]> => {
    if (!process.env.API_KEY) return [];

    const level = completedCount < 5 ? 'Beginner' : completedCount < 15 ? 'Intermediate' : 'Advanced';
    
    let prompt = `Generate 3 unique Trading Setups (Missions) for a trader at ${level} level.`;
    
    if (focusTopic) {
        prompt += `\nFOCUS TOPIC: "${focusTopic}".`;
    } else {
        prompt += `\nMix assets: Crypto, Forex, Stocks.`;
    }
    
    prompt += `\nReturn a JSON array. Briefing should be in the style of "Apex" (Hedge Fund Manager).`;

    try {
        const response = await generateWithFallback(prompt, {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        description: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        assetId: { type: Type.STRING },
                        completed: { type: Type.BOOLEAN },
                        recommendedTools: { type: Type.ARRAY, items: { type: Type.STRING } },
                        briefing: { type: Type.STRING }
                    }
                }
            }
        });
        
        return JSON.parse(cleanJSON(response.text || "[]"));
    } catch (e) {
        return [];
    }
}

export const generateTarget = async (targetId: string, typeHint: string): Promise<Asset> => {
    if (!process.env.API_KEY) {
        return {
            id: targetId,
            ticker: "NULL",
            name: "Offline Asset",
            type: AssetClass.STOCKS,
            price: 0,
            change24h: 0,
            volatility: 'Low',
            trend: 'Neutral',
            indicators: [],
            description: "No data.",
            newsFlash: "System Offline"
        };
    }

    const prompt = `Generate a detailed simulated financial asset profile.
    ID: ${targetId}
    Context Hint: ${typeHint}
    Return JSON.`;

    try {
       const response = await generateWithFallback(prompt, {
           responseMimeType: "application/json",
           responseSchema: {
               type: Type.OBJECT,
               properties: {
                   id: {type: Type.STRING},
                   ticker: {type: Type.STRING},
                   name: {type: Type.STRING}, 
                   type: {type: Type.STRING, enum: ['Crypto', 'Forex', 'Index', 'Commodity', 'Equity']}, 
                   price: {type: Type.NUMBER},
                   change24h: {type: Type.NUMBER},
                   volatility: {type: Type.STRING, enum: ['Low', 'Medium', 'Extreme']},
                   trend: {type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral']},
                   indicators: {type: Type.ARRAY, items: {type: Type.STRING}},
                   description: {type: Type.STRING},
                   newsFlash: {type: Type.STRING}
               }
           }
       });
       return JSON.parse(cleanJSON(response.text || "{}")) as Asset;
    } catch (e) {
        return {
            id: targetId,
            ticker: "UNK",
            name: "Unknown Asset",
            type: AssetClass.STOCKS,
            price: 100,
            change24h: 0,
            volatility: 'Low',
            trend: 'Neutral',
            indicators: [],
            description: "Generation Failed",
            newsFlash: "N/A"
        };
    }
}

export const generateLecture = async (topic: string): Promise<Lecture> => {
    if (!process.env.API_KEY) {
        return {
            topic: "System Offline",
            steps: [{ voiceScript: "Cannot access the library.", boardNotes: "API KEY MISSING" }],
            currentStepIndex: 0
        };
    }

    const prompt = `
        ACT AS: "Apex" (Hedge Fund Manager).
        TASK: Create a masterclass on trading topic: "${topic}".
        STRUCTURE: 3-5 steps.
        STYLE: Direct, insightful, focused on profitability and risk. Use ASCII charts for boardNotes where possible.
    `;

    try {
        const response = await generateWithFallback(prompt, {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    steps: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                voiceScript: { type: Type.STRING },
                                boardNotes: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        });

        const data = JSON.parse(cleanJSON(response.text));
        return {
            topic,
            steps: data.steps || [],
            currentStepIndex: 0
        };
    } catch (e: any) {
         return {
            topic: "Error",
            steps: [{ voiceScript: "Network error.", boardNotes: "ERROR" }],
            currentStepIndex: 0
        };
    }
}
