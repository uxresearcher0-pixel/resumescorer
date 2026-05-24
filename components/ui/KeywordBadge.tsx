import { Badge } from "flowbite-react";
import { CheckCircle, XCircle } from "lucide-react";

interface KeywordBadgeProps {
  keyword: string;
  matched: boolean;
  importance?: "required" | "preferred";
  category?: string;
}

export default function KeywordBadge({
  keyword,
  matched,
  importance,
  category,
}: KeywordBadgeProps) {
  return (
    <span
      title={`${matched ? "Found" : "Missing"} keyword${importance ? ` — ${importance}` : ""}${category ? ` (${category})` : ""}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
        matched
          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
          : importance === "required"
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"
          : "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
      }`}
      role="listitem"
      aria-label={`${keyword}: ${matched ? "found in resume" : "missing from resume"}`}
    >
      {matched ? (
        <CheckCircle className="h-3 w-3" aria-hidden="true" />
      ) : (
        <XCircle className="h-3 w-3" aria-hidden="true" />
      )}
      {keyword}
      {!matched && importance === "required" && (
        <span className="ml-0.5 text-xs opacity-70">*</span>
      )}
    </span>
  );
}
