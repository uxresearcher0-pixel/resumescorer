export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;

export const FREE_PLAN_SCAN_LIMIT = 3;

export const SCORE_GRADE = (score: number) => {
  if (score >= 85) return { label: "Excellent", color: "green" };
  if (score >= 70) return { label: "Good", color: "blue" };
  if (score >= 55) return { label: "Fair", color: "yellow" };
  return { label: "Needs Work", color: "red" };
};

export const ROLE_CATEGORIES = [
  "UX Designer",
  "UX Engineer",
  "Product Designer",
  "Product Manager",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Software Engineer",
  "DevOps Engineer",
  "Project Manager",
  "Marketing Manager",
  "Content Writer",
  "Other",
] as const;

export const ANALYSIS_STEPS = [
  { id: "reading",    label: "Reading your resume" },
  { id: "extracting", label: "Extracting sections" },
  { id: "parsing",    label: "Parsing job description" },
  { id: "matching",   label: "Matching keywords" },
  { id: "ats",        label: "Checking ATS compatibility" },
  { id: "scoring",    label: "Generating score" },
  { id: "preparing",  label: "Preparing suggestions" },
] as const;
