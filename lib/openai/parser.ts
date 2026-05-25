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

    // Ensure new fields have safe fallbacks if Gemini omits them
    return {
      keyword_match: parsed.keyword_match ?? { matched: [], missing: [] },
      skills: parsed.skills ?? { matched: [], missing: [] },
      ats_issues: parsed.ats_issues ?? [],
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      experience_relevance_notes: parsed.experience_relevance_notes ?? "",
      bullet_rewrites: parsed.bullet_rewrites ?? [],
      section_suggestions: parsed.section_suggestions ?? [],
      scores: parsed.scores ?? { keyword: 0, skills: 0, experience: 0, impact: 0 },
      failure_reasons: parsed.failure_reasons ?? [],
      gap_analysis: parsed.gap_analysis ?? {
        keyword: "",
        skills: "",
        experience: "",
        impact: "",
        overall: "",
      },
      improvement_roadmap: parsed.improvement_roadmap ?? [],
    } as AIAnalysisResult;
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
      failure_reasons: [],
      gap_analysis: { keyword: "", skills: "", experience: "", impact: "", overall: "" },
      improvement_roadmap: [],
    };
  }
}
