
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateLore = async (score: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a single short sentence of ancient temple lore for a runner who has reached a score of ${score}. Make it mysterious and atmospheric.`,
    });
    return response.text || "The walls whisper of those who came before...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ancient spirits watch your every step.";
  }
};

export const generateDeathReason = async (score: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a poetic and short reason why an adventurer died in a mysterious jungle temple after reaching a score of ${score}. Use dramatic language.`,
    });
    return response.text || "The jungle claimed another soul.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Your journey was cut short by the temple's wrath.";
  }
};
