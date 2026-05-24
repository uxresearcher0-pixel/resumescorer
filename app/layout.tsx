import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ResumeFit AI — ATS Resume Analyzer",
    template: "%s | ResumeFit AI",
  },
  description:
    "AI-powered resume scorer that checks ATS compatibility, keyword match, and gives you actionable improvements to land more interviews.",
  keywords: ["resume", "ATS", "resume scorer", "job search", "resume analyzer"],
  authors: [{ name: "ResumeFit AI" }],
  openGraph: {
    title: "ResumeFit AI — ATS Resume Analyzer",
    description: "Score your resume against any job description in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
