import type { AIAnalysisResult } from "@/types/report";

export function parseAnalysisResponse(raw: string): AIAnalysisResult {
  try {
    // Gemini sometimes wraps output in ```json ... ``` — strip it
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return parsed as AIAnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error, "\nRaw:", raw);
    return {
      keyword_match: { matched: [], missing: [] },
      skills: { matched: [], missing: [] },
      ats_issues: [],
      strengths: ["Unable to parse AI response — please retry"],
      weaknesses: [],
      experience_relevance_notes: "",
      bullet_rewrites: [],
      section_suggestions: [],
      scores: { keyword: 0, skills: 0, experience: 0, impact: 0 },
    };
  }
}
