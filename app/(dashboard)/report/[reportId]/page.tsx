import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, Badge, Button, Alert } from "flowbite-react";
import { Download, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ScoreCard from "@/components/ui/ScoreCard";
import KeywordBadge from "@/components/ui/KeywordBadge";
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type ScoreCategory } from "@/lib/scoring/weights";
import { getScoreBadgeColor, getScoreLabel } from "@/lib/scoring/engine";
import type { Report, MissingKeyword, ATSIssue, BulletRewrite } from "@/types/report";

export const metadata: Metadata = { title: "Resume Score Report" };

export default async function ReportPage({ params }: { params: { reportId: string } }) {
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select(`*, job_descriptions ( job_title, company_name ), resumes ( file_name )`)
    .eq("id", params.reportId)
    .single();

  if (!report) notFound();
  if (report.status === "processing" || report.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-gray-500">Analysis still in progress…</p>
        <Button href={`/analyzing?reportId=${params.reportId}`} color="blue" className="mt-4">
          View progress
        </Button>
      </div>
    );
  }
  if (report.status === "failed") {
    return (
      <Alert color="failure" icon={XCircle}>
        Analysis failed: {report.error_message || "Unknown error"}. Please try again.
      </Alert>
    );
  }

  const jd = report.job_descriptions as any;
  const resume = report.resumes as any;
  const overallColor = getScoreBadgeColor(report.overall_score ?? 0) as "green" | "blue" | "yellow" | "red";
  const missingKeywords = (report.missing_keywords as unknown as MissingKeyword[]) || [];
  const matchedKeywords = (report.matched_keywords as unknown as string[]) || [];
  const atsIssues = (report.ats_issues as unknown as ATSIssue[]) || [];
  const strengths = (report.strengths as unknown as string[]) || [];
  const weaknesses = (report.weaknesses as unknown as string[]) || [];
  const bulletRewrites = (report.bullet_rewrites as unknown as BulletRewrite[]) || [];

  const categories: ScoreCategory[] = ["ats", "keyword", "skills", "experience", "impact", "formatting"];
  const categoryScores: Record<ScoreCategory, number> = {
    ats: report.ats_score ?? 0,
    keyword: report.keyword_score ?? 0,
    skills: report.skills_score ?? 0,
    experience: report.experience_score ?? 0,
    impact: report.impact_score ?? 0,
    formatting: report.formatting_score ?? 0,
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Score Report</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {resume?.file_name} → {jd?.job_title}
            {jd?.company_name ? ` @ ${jd.company_name}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button color="light" size="sm" href={`/report/${params.reportId}/improve`}>
            <TrendingUp className="mr-1.5 h-4 w-4" />
            Improve Resume
          </Button>
          <Button color="blue" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Overall score hero */}
      <Card className="text-center">
        <div className="py-4">
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Overall Resume Score</p>
          <div className="text-6xl font-extrabold text-gray-900 dark:text-white">
            {report.overall_score}
            <span className="text-2xl text-gray-400 dark:text-gray-500">/100</span>
          </div>
          <div className="mt-3">
            <Badge color={overallColor} className="px-4 py-1.5 text-sm font-semibold">
              {getScoreLabel(report.overall_score ?? 0)}
            </Badge>
          </div>
          <p className="mt-4 mx-auto max-w-lg text-sm text-gray-500 dark:text-gray-400">
            {getOverallInsight(report.overall_score ?? 0, missingKeywords.length, atsIssues.length)}
          </p>
        </div>
      </Card>

      {/* Category breakdown */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Score Breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => (
            <ScoreCard
              key={cat}
              label={CATEGORY_LABELS[cat]}
              description={CATEGORY_DESCRIPTIONS[cat]}
              score={categoryScores[cat] || 0}
            />
          ))}
        </div>
      </div>

      {/* Keywords */}
      <Card>
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Keyword Analysis</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          {matchedKeywords.length} matched · {missingKeywords.length} missing
        </p>

        {missingKeywords.length > 0 && (
          <div className="mb-5">
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Missing keywords
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {missingKeywords.filter((k) => k.importance === "required").length} required
              </span>
            </p>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Missing keywords">
              {missingKeywords.map((kw) => (
                <KeywordBadge key={kw.keyword} keyword={kw.keyword} matched={false} importance={kw.importance} category={kw.category} />
              ))}
            </div>
          </div>
        )}

        {matchedKeywords.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Matched keywords</p>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Matched keywords">
              {matchedKeywords.map((kw) => (
                <KeywordBadge key={kw} keyword={kw} matched={true} />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-6 sm:grid-cols-2">
        {strengths.length > 0 && (
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
              Strengths
            </h2>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {weaknesses.length > 0 && (
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />
              Areas to improve
            </h2>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-500" />
                  {w}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* ATS Issues */}
      {atsIssues.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ATS Issues</h2>
          <div className="space-y-3">
            {atsIssues.map((issue, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg border p-4 ${
                  issue.severity === "high"
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                    : issue.severity === "medium"
                    ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <Badge
                  color={issue.severity === "high" ? "red" : issue.severity === "medium" ? "yellow" : "gray"}
                  className="flex-shrink-0 capitalize"
                >
                  {issue.severity}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{issue.issue}</p>
                  {issue.recommendation && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{issue.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bullet rewrites preview */}
      {bulletRewrites.length > 0 && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Rewrite Suggestions</h2>
            <Button color="blue" size="sm" href={`/report/${params.reportId}/improve`} className="font-medium">
              See all improvements →
            </Button>
          </div>
          <div className="space-y-4">
            {bulletRewrites.slice(0, 2).map((r, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{r.section}</p>
                <p className="mb-3 text-sm text-gray-500 line-through dark:text-gray-500">{r.original}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">✓ {r.rewritten}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function getOverallInsight(score: number, missingCount: number, atsCount: number): string {
  if (score >= 85) return "Excellent match! Your resume is well-optimized for this role.";
  if (score >= 70) {
    return missingCount > 0
      ? `Good resume. Add ${missingCount} missing keyword${missingCount > 1 ? "s" : ""} to improve your score.`
      : "Good resume with room for minor improvements.";
  }
  if (score >= 55) {
    const parts = [];
    if (missingCount > 0) parts.push(`${missingCount} missing keywords`);
    if (atsCount > 0) parts.push(`${atsCount} ATS issue${atsCount > 1 ? "s" : ""}`);
    return `Fair match. Address ${parts.join(" and ")} to strengthen your application.`;
  }
  return "Your resume needs significant optimization for this role. Review the keyword gaps and ATS issues below.";
}
