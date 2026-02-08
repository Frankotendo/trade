
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { TradeSetup, Asset, SimulationResponse, AssetClass, NewsItem, Position, BotStrategy, TradeAction, SentimentData, Lecture, AlphaSignal, ShadowIntel, CorrelationData, NewsDecode, OrchestratorAction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const PRIMARY_MODEL = 'gemini-3-pro-preview';

const cleanJSON = (text: string | undefined): string => {
  if (!text) return "{}";
  let cleaned = text.replace(/```json\s*|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const startArr = cleaned.indexOf('[');
  const endArr = cleaned.lastIndexOf(']');
  
  if (start !== -1 && (startArr === -1 || start < startArr)) {
    return cleaned.substring(start, end + 1);
  } else if (startArr !== -1) {
    return cleaned.substring(startArr, endArr + 1);
  }
  return cleaned;
};

class QuotaController {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minInterval = 3000;
  private globalPauseUntil = 0;

  async enqueue<T>(fn: () => Promise<T>): Promise<T | null> {
    return new Promise((resolve) => {
      this.queue.push(async () => {
        const result = await this.executeWithRetry(fn);
        resolve(result);
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      if (now < this.globalPauseUntil) await new Promise(r => setTimeout(r, this.globalPauseUntil - now));
      const timeSinceLast = Date.now() - this.lastRequestTime;
      if (timeSinceLast < this.minInterval) await new Promise(r => setTimeout(r, this.minInterval - timeSinceLast));

      const nextTask = this.queue.shift();
      if (nextTask) {
        this.lastRequestTime = Date.now();
        await nextTask();
      }
    }
    this.isProcessing = false;
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, retries = 12): Promise<T | null> {
    let delay = 4000;
    for (let i = 0; i < retries; i++) {
      try {
        const result = await fn();
        return result;
      } catch (e: any) {
        const msg = e.message?.toLowerCase() || "";
        if (msg.includes('429') || msg.includes('quota') || msg.includes('503')) {
          if (msg.includes('429')) this.globalPauseUntil = Date.now() + 20000;
          const backoff = Math.min(delay * Math.pow(1.5, i), 60000);
          await new Promise(r => setTimeout(r, backoff + (Math.random() * 3000)));
          continue;
        }
        throw e;
      }
    }
    return null;
  }
}

const peterJS = new QuotaController();

const SYSTEM_INSTRUCTION = `You are the APEX TRADING CORE, an elite institutional hedge fund AI. 
You use Smart Money Concepts (SMC), ICT, Liquidity Grabs, and Fair Value Gaps (FVG). 
Your tone is clinical, high-conviction, and professional. 
You ignore retail noise and focus on institutional order flow.`;

/**
 * Translates complex news into layman's terms and forecasts outcomes.
 */
export const decodeMarketNews = async (news: NewsItem[]): Promise<NewsDecode | null> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `DECODE THIS NEWS FEED: ${JSON.stringify(news.slice(0, 10))}. 
      Explain everything in layman's understanding. 
      Clearly state: 
      1. What is happening?
      2. Why does it matter to a regular person?
      3. What should be expected to happen next in the markets?
      Return as a JSON object with fields: laymanSummary, whyItMatters, expectedOutcome, sentimentScore, volatilityForecast.`,
      config: {
        systemInstruction: "You are a world-class financial communicator who makes complex macro-economics simple for everyone.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            laymanSummary: { type: Type.STRING },
            whyItMatters: { type: Type.STRING },
            expectedOutcome: { type: Type.STRING },
            sentimentScore: { type: Type.NUMBER },
            volatilityForecast: { type: Type.STRING, enum: ['Stable', 'Volatile', 'Explosive'] }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result;
};

/**
 * The Central AI Orchestrator that manages all terminals.
 */
export const executeOrchestratorLogic = async (context: any): Promise<OrchestratorAction[]> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `CENTRAL_ORCHESTRATOR STATUS UPDATE. 
      CURRENT_CONTEXT: ${JSON.stringify(context)}. 
      Analyze all terminal inputs (Shadow, Liquidity, Intel, Execution). 
      Suggest the next 5 critical autonomous actions the AI system should take. 
      Return as a JSON array of OrchestratorAction objects.`,
      config: {
        systemInstruction: "You are the God-Mode AI Orchestrator. You link all systems and execute high-level strategy.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              timestamp: { type: Type.NUMBER },
              module: { type: Type.STRING },
              action: { type: Type.STRING },
              status: { type: Type.STRING, enum: ['PENDING', 'EXECUTING', 'COMPLETED', 'FAILED'] },
              result: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || [];
};

export const fetchShadowIntel = async (query: string, category?: string): Promise<ShadowIntel[]> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `PERFORM DEEP_SHADOW SCAN. CATEGORY: ${category || 'ALL'}. QUERY: "${query}". 
      Access fragments of institutional dark pools, private equity leaks, and HFT anomaly data. 
      Cross-reference for Signal Accuracy. Return as a JSON array of ShadowIntel objects.`,
      config: {
        systemInstruction: "You are the Shadow Intel Relay. Extract non-public institutional markers. Use clinical terminology.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              source: { type: Type.STRING },
              threatLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
              summary: { type: Type.STRING },
              rawFragment: { type: Type.STRING },
              timestamp: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              confidence: { type: Type.NUMBER },
              verificationSeal: { type: Type.STRING },
              expiryMinutes: { type: Type.NUMBER },
              category: { type: Type.STRING, enum: ['DARK_POOL', 'INSIDER', 'MACRO_LEAK', 'HFT_ANOMALY'] }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || [];
};

export const calculateAssetCorrelations = async (assets: Asset[]): Promise<CorrelationData[]> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `ANALYZE STATISTICAL CORRELATIONS for: ${assets.map(a => a.ticker).join(', ')}. 
      Identify Decoupled, Positive, and Inverse relationships in the current regime. 
      Return JSON array of CorrelationData.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              base: { type: Type.STRING },
              target: { type: Type.STRING },
              coefficient: { type: Type.NUMBER },
              regime: { type: Type.STRING, enum: ['Decoupled', 'Positive', 'Inverse'] }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || [];
};

export const fetchSentimentAnalysis = async (ticker: string, price: number): Promise<SentimentData | null> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Perform a High-Resolution Liquidity & Sentiment Analysis for ${ticker} currently at $${price}.
      Simulate institutional order book clusters (BUY/SELL walls) around the current price.
      Identify if we are in a phase of Accumulation or Distribution.
      Return JSON with precision fields: liquidityClusters, volatilityIndex, and smartMoneySignal.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            socialVolume: { type: Type.STRING },
            topBuzzwords: { type: Type.ARRAY, items: { type: Type.STRING } },
            smartMoneySignal: { type: Type.STRING, enum: ['Accumulation', 'Distribution', 'Neutral'] },
            volatilityIndex: { type: Type.NUMBER },
            liquidityClusters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  price: { type: Type.NUMBER },
                  volume: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ['BUY', 'SELL'] }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result;
};

export const fetchAlphaSignals = async (assets: Asset[]): Promise<AlphaSignal[]> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `SCAN GLOBAL MARKETS FOR HIGH-CONVICTION ALPHA SIGNALS. 
      Analyze: ${JSON.stringify(assets.map(a => ({ t: a.ticker, p: a.price, ch: a.change24h })))}
      Identify institutional entries. Return top 5 signals in JSON array format.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              asset: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['LONG', 'SHORT'] },
              entry: { type: Type.NUMBER },
              stopLoss: { type: Type.NUMBER },
              takeProfit: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              timeframe: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || [];
};

export const executeBotStrategy = async (strategy: BotStrategy, assets: Asset[], portfolio: any, news: NewsItem[]): Promise<TradeAction> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `APPLY STRATEGY: ${strategy}. 
      ASSETS: ${JSON.stringify(assets.slice(0, 5))}
      PORTFOLIO: ${JSON.stringify(portfolio)}
      NEWS: ${JSON.stringify(news.slice(0, 3))}
      Execute order flow analysis. Return JSON action.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['BUY', 'SELL', 'CLOSE', 'NONE'] },
            amount: { type: Type.NUMBER },
            price: { type: Type.NUMBER },
            symbol: { type: Type.STRING },
            reason: { type: Type.STRING },
            analysis: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || { type: 'NONE', amount: 0, price: 0, symbol: '', confidence: 0 };
};

export const executeCommand = async (cmd: string, mission: any, asset: Asset, portfolio: any): Promise<SimulationResponse> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `COMMAND: ${cmd}. TARGET: ${asset.ticker}. MISSION_CONTEXT: ${mission?.title}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            terminalOutput: { type: Type.STRING },
            instructorCommentary: { type: Type.STRING },
            tradeAction: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['BUY', 'SELL', 'CLOSE', 'NONE'] },
                    amount: { type: Type.NUMBER },
                    price: { type: Type.NUMBER },
                    symbol: { type: Type.STRING }
                }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || { terminalOutput: "UPLINK_TIMEOUT...", instructorCommentary: "Neural link saturated." };
};

export const generateNewMissions = async (count: number): Promise<TradeSetup[]> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Generate ${count} institutional trading missions. Focus on liquidity grabs and risk management.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              assetId: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
              completed: { type: Type.BOOLEAN }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || [];
};

export const fetchMarketNews = async (): Promise<NewsItem[]> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: "Search for high-impact macro-economic news from last 24h. Focus on FOMC, CPI, and institutional shifts.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              headline: { type: Type.STRING },
              source: { type: Type.STRING },
              sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
              timestamp: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || [];
};

export const generateLecture = async (topic: string): Promise<Lecture | null> => {
    const result = await peterJS.enqueue(async () => {
        const response = await ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: `Teach the theory of "${topic}" from the perspective of a legendary hedge fund manager.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    boardNotes: { type: Type.STRING },
                                    speechText: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        const data = JSON.parse(cleanJSON(response.text));
        return { ...data, currentStepIndex: 0 };
    });
    return result;
};

export const generateSpeech = async (text: string): Promise<Uint8Array | null> => {
  try {
    const result = await peterJS.enqueue(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
        },
      });
      return response;
    });
    if (!result) return null;
    const data = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) return null;
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch { return null; }
};

export const getProfitabilityTips = async (ticker: string, strategy: BotStrategy): Promise<string[]> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Provide 5 high-signal profitability tips for trading ${ticker} using the ${strategy} strategy. Focus on institutional risk management. Return as a JSON array of strings.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || [];
};

export const fetchStrategyRankings = async (): Promise<string[]> => {
  const result = await peterJS.enqueue(async () => {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: `Identify the current top 5 institutional-grade trading strategies based on global market liquidity and volatility. Return as a JSON array of strings.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return result || [];
};
