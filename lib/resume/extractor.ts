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
