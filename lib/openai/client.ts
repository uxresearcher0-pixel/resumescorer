import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return client;
}

// gemini-2.5-flash = FREE tier, confirmed working
export const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";
