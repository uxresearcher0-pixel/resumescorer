import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return client;
}

// gemini-1.5-flash-8b = FREE tier (most generous: 15 req/min, 1500 req/day)
export const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-1.5-flash-8b";
