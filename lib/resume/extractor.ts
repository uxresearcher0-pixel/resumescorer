export interface ParsedResume {
  extractedText: string;
  wordCount: number;
  sections: {
    name?: string;
    contact?: string;
    summary?: string;
    experience?: string[];
    education?: string[];
    skills?: string[];
    certifications?: string[];
    projects?: string[];
  };
}

export async function extractResumeText(
  fileUrl: string,
  fileType: string
): Promise<ParsedResume> {
  const parserUrl = process.env.PYTHON_PARSER_URL || "http://localhost:8000";

  const response = await fetch(`${parserUrl}/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_url: fileUrl, file_type: fileType }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Parser service error: ${error}`);
  }

  const data = await response.json();
  return data as ParsedResume;
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function hasContactInfo(text: string): boolean {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?1?\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  return emailRegex.test(text) || phoneRegex.test(text);
}
