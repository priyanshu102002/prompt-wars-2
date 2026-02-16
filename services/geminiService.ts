
import { GoogleGenAI } from "@google/genai";
import { BoardState, Color } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTacticalWhisper = async (color: Color, board: BoardState): Promise<string> => {
  try {
    const prompt = `You are a cryptic battlefield advisor in a Fog of War chess match. 
    The current player is ${color === 'w' ? 'White' : 'Black'}.
    The board is partially hidden. Give a short, mysterious 1-sentence tactical tip or omen. Max 15 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Move with the silence of the void.";
  } catch (error) {
    return "Shadows lengthen across the board.";
  }
};
