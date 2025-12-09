import { GoogleGenAI } from "@google/genai";
import { Candidate } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeElection = async (candidates: Candidate[]): Promise<string> => {
  try {
    const candidateData = candidates.map(c => `${c.name} (${c.party}): ${c.votes} votes`).join('\n');
    
    const prompt = `
      You are a seasoned political election analyst for a decentralized organization.
      Analyze the following live election results:
      
      ${candidateData}
      
      Provide a concise, 2-3 sentence commentary on the current state of the race. 
      Mention who is leading, by how much, and make a brief prediction or observation about the trend.
      Keep the tone professional yet engaging, like a live news ticker.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Unable to connect to AI Analyst node.";
  }
};
