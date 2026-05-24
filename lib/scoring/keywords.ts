export interface KeywordMatchResult {
  score: number;
  matchedRequired: string[];
  matchedPreferred: string[];
  missingRequired: string[];
  missingPreferred: string[];
}

interface Keyword {
  keyword: string;
  importance: "required" | "preferred";
}

export function calculateKeywordScore(
  resumeText: string,
  keywords: Keyword[]
): KeywordMatchResult {
  const normalizedResume = resumeText.toLowerCase();

  const requiredKeywords = keywords.filter((k) => k.importance === "required");
  const preferredKeywords = keywords.filter((k) => k.importance === "preferred");

  const matchKeyword = (kw: string): boolean => {
    const normalized = kw.toLowerCase().trim();
    return (
      normalizedResume.includes(normalized) ||
      // Partial match for compound terms (e.g. "user research" matches "ux research")
      normalized.split(" ").every((word) => word.length > 3 && normalizedResume.includes(word))
    );
  };

  const matchedRequired = requiredKeywords
    .filter((k) => matchKeyword(k.keyword))
    .map((k) => k.keyword);

  const missingRequired = requiredKeywords
    .filter((k) => !matchKeyword(k.keyword))
    .map((k) => k.keyword);

  const matchedPreferred = preferredKeywords
    .filter((k) => matchKeyword(k.keyword))
    .map((k) => k.keyword);

  const missingPreferred = preferredKeywords
    .filter((k) => !matchKeyword(k.keyword))
    .map((k) => k.keyword);

  const requiredScore =
    requiredKeywords.length > 0
      ? (matchedRequired.length / requiredKeywords.length) * 70
      : 70;

  const preferredScore =
    preferredKeywords.length > 0
      ? (matchedPreferred.length / preferredKeywords.length) * 30
      : 30;

  const score = Math.round(requiredScore + preferredScore);

  return {
    score: Math.min(100, score),
    matchedRequired,
    matchedPreferred,
    missingRequired,
    missingPreferred,
  };
}

export function calculateFormattingScore(
  wordCount: number,
  pageCount: number,
  hasSummary: boolean,
  hasContactInfo: boolean
): number {
  let score = 100;

  if (wordCount < 200) score -= 15;
  if (wordCount > 1200) score -= 10;
  if (pageCount > 2) score -= 10;
  if (!hasSummary) score -= 10;
  if (!hasContactInfo) score -= 15;

  return Math.max(0, score);
}
