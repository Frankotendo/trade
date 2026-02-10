
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const DEFAULT_MODEL = 'gemini-3-flash-preview';

/**
 * Internal Peter.js resilient wrapper for standalone calls.
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 8): Promise<T | null> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      const msg = e.message?.toLowerCase() || "";
      if (msg.includes('429') || msg.includes('quota') || msg.includes('503')) {
        const delay = Math.min(2000 * Math.pow(2, attempt) + Math.random() * 1000, 60000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  return null;
};

export const getAIResponse = async (prompt: string, context?: string) => {
  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          systemInstruction: `You are the TradeSim Alpha AI, a sophisticated trading assistant. 
          Your tone is professional, futuristic (2077 aesthetic). Current Simulation Context: ${context || 'General Terminal'}.`,
          temperature: 0.7,
        },
      });
    });
    return response?.text || "UPLINK_FAILURE: Quota exhausted. [PETER.JS] Cooling down.";
  } catch (error) {
    return "SYSTEM ERROR: Neural core link severed.";
  }
};

export const getMarketIntel = async (assetSymbol: string) => {
  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: `Provide a brief, high-level technical analysis for ${assetSymbol} in a futuristic trading tone.`,
        config: {
          systemInstruction: "You are the TradeSim Intel Engine.",
        },
      });
    });
    return response?.text || "UNABLE TO RETRIEVE INTEL DUE TO QUOTA LIMIT.";
  } catch (error) {
    return "INTEL_LINK_ERROR";
  }
};
