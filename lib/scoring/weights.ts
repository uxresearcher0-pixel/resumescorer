export const SCORE_WEIGHTS = {
  ats:        0.25,
  keyword:    0.25,
  skills:     0.20,
  experience: 0.15,
  impact:     0.10,
  formatting: 0.05,
} as const;

export type ScoreCategory = keyof typeof SCORE_WEIGHTS;

export interface CategoryScores {
  ats: number;
  keyword: number;
  skills: number;
  experience: number;
  impact: number;
  formatting: number;
}

export const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  ats:        "ATS Compatibility",
  keyword:    "Keyword Match",
  skills:     "Skills Match",
  experience: "Experience Relevance",
  impact:     "Impact & Metrics",
  formatting: "Formatting Quality",
};

export const CATEGORY_DESCRIPTIONS: Record<ScoreCategory, string> = {
  ats:        "How well your resume is readable by Applicant Tracking Systems",
  keyword:    "How many job description keywords appear in your resume",
  skills:     "Coverage of required and preferred skills",
  experience: "Relevance of your experience to the target role",
  impact:     "Use of measurable achievements and strong action verbs",
  formatting: "Resume structure, length, and visual consistency",
};
