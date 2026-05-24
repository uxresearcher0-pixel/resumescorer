export interface ATSCheckResult {
  score: number;
  issues: { issue: string; severity: "low" | "medium" | "high"; deduction: number }[];
}

interface ATSInput {
  fileType: string;
  wordCount?: number;
  pageCount?: number;
  extractedText: string;
  hasContactEmail?: boolean;
}

export function calculateATSScore(input: ATSInput): ATSCheckResult {
  let score = 100;
  const issues: ATSCheckResult["issues"] = [];

  // File type check
  if (input.fileType === "txt") {
    score -= 5;
    issues.push({ issue: "Plain text file — consider PDF or DOCX for better formatting", severity: "low", deduction: 5 });
  }

  // Page length check
  if (input.pageCount && input.pageCount > 3) {
    score -= 5;
    issues.push({ issue: `Resume is ${input.pageCount} pages — aim for 1–2 pages`, severity: "low", deduction: 5 });
  }

  // Word count check
  if (input.wordCount && input.wordCount < 200) {
    score -= 10;
    issues.push({ issue: "Resume is too short — add more relevant content", severity: "medium", deduction: 10 });
  }

  // Missing contact email
  if (!input.hasContactEmail) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (!emailRegex.test(input.extractedText)) {
      score -= 10;
      issues.push({ issue: "No email address found — contact info is required", severity: "high", deduction: 10 });
    }
  }

  // Check for standard section headings
  const text = input.extractedText.toLowerCase();
  const standardSections = [
    { name: "experience", aliases: ["work experience", "employment", "career"] },
    { name: "education", aliases: ["academic", "qualifications"] },
    { name: "skills", aliases: ["technical skills", "competencies", "expertise"] },
  ];

  standardSections.forEach(({ name, aliases }) => {
    const allVariants = [name, ...aliases];
    const found = allVariants.some((v) => text.includes(v));
    if (!found) {
      score -= 8;
      issues.push({
        issue: `Missing "${name}" section — standard sections help ATS parse your resume`,
        severity: "medium",
        deduction: 8,
      });
    }
  });

  // Check for table-like structures (pipe characters, excessive whitespace patterns)
  const pipeCount = (input.extractedText.match(/\|/g) || []).length;
  if (pipeCount > 5) {
    score -= 10;
    issues.push({ issue: "Table formatting detected — ATS systems struggle to parse tables", severity: "high", deduction: 10 });
  }

  // Check for very long lines (possible column layouts)
  const lines = input.extractedText.split("\n");
  const longLines = lines.filter((l) => l.length > 200).length;
  if (longLines > 3) {
    score -= 8;
    issues.push({ issue: "Multi-column layout detected — use single-column for ATS compatibility", severity: "high", deduction: 8 });
  }

  return { score: Math.max(0, score), issues };
}
