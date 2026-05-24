import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/utils/constants";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateResumeFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
    };
  }

  const allowedTypes = ALLOWED_MIME_TYPES as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Please upload a PDF, DOCX, or TXT file.`,
    };
  }

  return { valid: true };
}

export function getFileType(mimeType: string): "pdf" | "docx" | "txt" {
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  return "txt";
}
