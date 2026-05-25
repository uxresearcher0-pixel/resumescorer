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

export interface FailureReason {
  rank: number;
  reason: string;
  category: "keywords" | "skills" | "experience" | "formatting" | "ats" | "impact";
  impact: "high" | "medium" | "low";
  fix: string;
}

export interface GapAnalysis {
  keyword: string;
  skills: string;
  experience: string;
  impact: string;
  overall: string;
}

export interface RoadmapWeek {
  week: number;
  focus: string;
  actions: string[];
  score_impact: string;
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
  failure_reasons: FailureReason[];
  gap_analysis: GapAnalysis;
  improvement_roadmap: RoadmapWeek[];
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
  failure_reasons: FailureReason[];
  gap_analysis: GapAnalysis | null;
  improvement_roadmap: RoadmapWeek[];
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  created_at: string;
}
