import { SCORE_WEIGHTS, type CategoryScores } from "./weights";

export function calculateOverallScore(scores: CategoryScores): number {
  const weighted =
    scores.ats        * SCORE_WEIGHTS.ats +
    scores.keyword    * SCORE_WEIGHTS.keyword +
    scores.skills     * SCORE_WEIGHTS.skills +
    scores.experience * SCORE_WEIGHTS.experience +
    scores.impact     * SCORE_WEIGHTS.impact +
    scores.formatting * SCORE_WEIGHTS.formatting;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function clampScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)));
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Needs Work";
  return "Critical";
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 85) return "green";
  if (score >= 70) return "blue";
  if (score >= 55) return "yellow";
  return "red";
}

export function getScoreInsight(category: string, score: number): string {
  if (score >= 85) return `Your ${category} is strong.`;
  if (score >= 70) return `Your ${category} is good with minor room for improvement.`;
  if (score >= 55) return `Your ${category} needs some attention.`;
  return `Your ${category} needs significant improvement.`;
}
