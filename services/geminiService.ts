
import { GoogleGenAI, Type } from "@google/genai";
import { Language, ExplanationMode, ServiceResult, ServiceDetail, CodingHelpResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const searchServices = async (query: string, language: Language): Promise<ServiceResult[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Identify 3-4 real Indian government, healthcare, or educational digital services matching this query: "${query}". 
    The response must be in ${language}.
    Target users: Indian citizens looking for help.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            officialUrl: { type: Type.STRING },
            category: { type: Type.STRING },
            whyRecommended: { type: Type.STRING }
          },
          required: ["name", "description", "officialUrl", "category", "whyRecommended"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse services:", e);
    return [];
  }
};

export const getServiceDetails = async (
  serviceName: string, 
  language: Language, 
  mode: ExplanationMode
): Promise<ServiceDetail> => {
  const modeInstruction = {
    [ExplanationMode.PROFESSIONAL]: "Use formal and precise language suitable for official documentation.",
    [ExplanationMode.SIMPLE]: "Use extremely simple language as if explaining to a beginner or child. Use bullet points.",
    [ExplanationMode.STORY]: "Explain the process through a short relatable story of a character using the service."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a detailed guide for the Indian service: "${serviceName}".
    Language: ${language}.
    Tone/Mode: ${modeInstruction[mode]}.
    Include: Overview, step-by-step application steps, required documents, and any known deadlines.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          documents: { type: Type.ARRAY, items: { type: Type.STRING } },
          deadlines: { type: Type.STRING },
          recommendationReason: { type: Type.STRING }
        },
        required: ["overview", "steps", "documents", "deadlines", "recommendationReason"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Failed to fetch service details");
  }
};

export const getCodingHelp = async (input: string, language: Language): Promise<CodingHelpResponse> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Help a student understand this technical or coding issue: "${input}".
    Translate and explain the technical terms in ${language}.
    Provide a simplified explanation and clear terms meanings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          simplifiedCode: { type: Type.STRING },
          terms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                meaning: { type: Type.STRING }
              }
            }
          }
        },
        required: ["explanation", "simplifiedCode", "terms"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Failed to fetch coding help");
  }
};
