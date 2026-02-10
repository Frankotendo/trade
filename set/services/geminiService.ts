
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  Asset, SimulationResponse, BotStrategy, Lecture,
  SentimentData, NeuralConsensus, ShadowIntel, CorrelationData, NewsDecode, 
  OrchestratorAction, OptimizationReport, AlphaSignal, NewsItem
} from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODELS = {
  PRO: 'gemini-3-pro-preview',
  FLASH: 'gemini-3-flash-preview'
};

/**
 * Resilient wrapper to handle 429 (quota) and 503 (server) errors with exponential backoff.
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T | null> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      const msg = e.message?.toLowerCase() || "";
      if (msg.includes('429') || msg.includes('quota') || msg.includes('503') || msg.includes('resource_exhausted')) {
        // Shorter delays for better UX, but still backing off
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 10000);
        console.warn(`[Gemini] Resource exhausted. Retrying in ${Math.round(delay)}ms... (${attempt + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      console.error("[Gemini Service Error]", e);
      throw e;
    }
  }
  return null;
};

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

/**
 * Generates an educational lecture on any specific trading topic or strategy.
 * Switched to FLASH for speed and higher quota.
 */
export const generateLecture = async (topic: string): Promise<Lecture | null> => {
  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `You are the Universal Trading Librarian in the year 2077. 
      The user wants to study the specific strategy or concept: "${topic}".
      Provide a highly detailed 3-step lecture module.
      
      Step 1: Foundational Logic & History.
      Step 2: Core Execution Mechanics & Rules.
      Step 3: Advanced Optimization & Common Pitfalls.
      
      Return valid JSON with this structure:
      {
        "topic": "${topic}",
        "steps": [
          { "boardNotes": "Markdown formatted technical notes", "speechText": "Natural narration for the AI instructor" }
        ]
      }`,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: `You represent the Apex Capital Academy. Master of 5,900+ strategies. 
        Current topic focus: ${topic}. 
        Provide institutional-grade logic in a futuristic tone.`
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    const data = JSON.parse(cleanJSON(text));
    return { ...data, currentStepIndex: 0 };
  }) || null;
};

/**
 * Mentors the user based on their practice commands.
 */
export const executeCommand = async (cmd: string, strategy: BotStrategy, asset: Asset, balance: number): Promise<SimulationResponse> => {
  const result = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `COMMAND: "${cmd}". STRATEGY: ${strategy}. ASSET: ${asset.ticker} @ $${asset.price}.
      
      Evaluate and return JSON:
      {
        "terminalOutput": "AI response",
        "instructorCommentary": "Short critique",
        "tradeAction": { "type": "BUY|SELL|CLOSE|NONE", "amount": number, "price": number, "symbol": "string" }
      }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });

  return result || { 
    terminalOutput: "ERROR: Neural link unstable. Quota exhausted.", 
    instructorCommentary: "Connection failed." 
  };
};

/**
 * Speech synthesis for the AI Instructor.
 */
export const generateSpeech = async (text: string): Promise<Uint8Array | null> => {
  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
      },
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) return null;
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }, 2) || null; // Fewer retries for speech to maintain speed
};

export const fetchStrategyRankings = async (): Promise<string[]> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: "Rank top 5 strategies. Return JSON array.",
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || [];
};

export const fetchAlphaSignals = async (assets: Asset[]): Promise<AlphaSignal[]> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Generate signals for: ${assets.map(a => a.ticker).join(', ')}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || [];
};

export const fetchSentimentAnalysis = async (ticker: string, price: number): Promise<SentimentData> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Sentiment for ${ticker} @ $${price}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || { score: 50, label: 'Neutral', volatilityIndex: 0.5, smartMoneySignal: 'Neutral', liquidityClusters: [], topBuzzwords: [] };
};

export const generateNeuralConsensus = async (ticker: string, bids: any[], asks: any[]): Promise<NeuralConsensus> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Consensus for ${ticker}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || { verdict: 'HALT', intelConfidence: 0, quantAlignment: 0, summary: 'Offline.' };
};

export const fetchShadowIntel = async (query: string, category?: string): Promise<ShadowIntel[]> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Shadow Intel for ${query}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || [];
};

export const calculateAssetCorrelations = async (assets: Asset[]): Promise<CorrelationData[]> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Correlations for ${assets.map(a => a.ticker).join(', ')}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || [];
};

export const decodeMarketNews = async (news: NewsItem[]): Promise<NewsDecode> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Decode news: ${JSON.stringify(news)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || { laymanSummary: 'N/A', whyItMatters: 'N/A', expectedOutcome: 'N/A', sentimentScore: 50, volatilityForecast: 'Stable' };
};

export const executeOrchestratorLogic = async (context: any): Promise<OrchestratorAction[]> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Orchestrator logic for ${JSON.stringify(context)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || [];
};

export const generateDeepOptimization = async (stats: any, logs: any[], strategy: BotStrategy): Promise<OptimizationReport> => {
  const res = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Optimize ${strategy} with ${JSON.stringify(stats)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text));
  });
  return res || { currentMetrics: {}, suggestedMetrics: {}, strategicNarrative: 'Offline.', parameterAdjustments: [] };
};
