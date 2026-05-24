export interface MissingKeyword {
  keyword: string;
  importance: "required" | "preferred";
  category: "technical" | "soft" | "tool" | "domain" | "certification";
}

export interface ATSIssue {
  issue: string;
  severity: "low" | "medium" | "high";
  recommendation?: string;
}

export interface BulletRewrite {
  original: string;
  rewritten: string;
  section: string;
  improvement?: string;
}

export interface SectionSuggestion {
  section: string;
  suggestion: string;
  priority?: "high" | "medium" | "low";
}

export interface AIAnalysisResult {
  keyword_match: {
    matched: string[];
    missing: MissingKeyword[];
  };
  skills: {
    matched: string[];
    missing: string[];
  };
  ats_issues: ATSIssue[];
  strengths: string[];
  weaknesses: string[];
  experience_relevance_notes: string;
  bullet_rewrites: BulletRewrite[];
  section_suggestions: SectionSuggestion[];
  scores: {
    keyword: number;
    skills: number;
    experience: number;
    impact: number;
  };
}

export interface Report {
  id: string;
  user_id: string;
  resume_id: string;
  job_description_id: string;
  overall_score: number;
  ats_score: number;
  keyword_score: number;
  skills_score: number;
  experience_score: number;
  impact_score: number;
  formatting_score: number;
  strengths: string[];
  weaknesses: string[];
  ats_issues: ATSIssue[];
  matched_keywords: string[];
  missing_keywords: MissingKeyword[];
  skills_matched: string[];
  skills_missing: string[];
  bullet_rewrites: BulletRewrite[];
  section_suggestions: SectionSuggestion[];
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  created_at: string;
}
