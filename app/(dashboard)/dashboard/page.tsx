import type { Metadata } from "next";
import { Button, Card } from "flowbite-react";
import { ArrowRight, Upload, FileText, BarChart3, Target } from "lucide-react";
import QuickStatCard from "@/components/dashboard/QuickStatCard";
import RecentScansTable from "@/components/dashboard/RecentScansTable";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch recent reports
  const { data: reportsRaw } = await supabase
    .from("reports")
    .select(`
      id, overall_score, status, created_at,
      job_descriptions ( job_title, company_name )
    `)
    .eq("user_id", user?.id!)
    .order("created_at", { ascending: false })
    .limit(10);

  const reports = (reportsRaw || []) as Array<{
    id: string;
    overall_score: number;
    status: string;
    created_at: string;
    job_descriptions: { job_title: string; company_name: string | null } | null;
  }>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, scans_used, scans_limit, plan")
    .eq("id", user?.id!)
    .single();

  const completedReports = reports.filter((r) => r.status === "completed");
  const avgScore =
    completedReports.length > 0
      ? Math.round(
          completedReports.reduce((sum, r) => sum + (r.overall_score || 0), 0) /
            completedReports.length
        )
      : 0;
  const bestScore = completedReports.length > 0
    ? Math.max(...completedReports.map((r) => r.overall_score || 0))
    : 0;

  const scans = reports.map((r) => ({
    id: r.id,
    jobTitle: (r.job_descriptions as any)?.job_title || "Unknown Role",
    company: (r.job_descriptions as any)?.company_name,
    score: r.overall_score || 0,
    status: r.status as "completed" | "processing" | "failed",
    createdAt: r.created_at,
  }));

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {getTimeOfDay()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Here&apos;s your resume analysis overview.
          </p>
        </div>
        <Button color="blue" href="/upload" className="font-semibold">
          <Upload className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickStatCard
          label="Total Scans"
          value={reports?.length || 0}
          icon={<BarChart3 className="h-5 w-5" />}
          color="blue"
        />
        <QuickStatCard
          label="Average Score"
          value={completedReports.length ? avgScore : "—"}
          subLabel={completedReports.length ? "across all analyses" : "No analyses yet"}
          icon={<Target className="h-5 w-5" />}
          color={avgScore >= 70 ? "green" : avgScore >= 50 ? "yellow" : "red"}
        />
        <QuickStatCard
          label="Best Score"
          value={completedReports.length ? bestScore : "—"}
          icon={<FileText className="h-5 w-5" />}
          color="purple"
        />
        <QuickStatCard
          label="Scans Left"
          value={profile ? `${profile.scans_limit - profile.scans_used}/${profile.scans_limit}` : "—"}
          subLabel={profile?.plan === "free" ? "Free plan — upgrade for unlimited" : "Pro plan"}
          icon={<Upload className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* CTA prompt if no scans */}
      {!reports?.length && (
        <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex flex-col items-center gap-4 py-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
              <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Analyze your first resume</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload a resume and paste a job description to get your ATS score and keyword gaps.
              </p>
            </div>
            <Button color="blue" href="/upload" className="flex-shrink-0 font-semibold">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Recent scans */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Analyses</h2>
          {(reports?.length || 0) > 5 && (
            <Button color="light" href="/history" size="xs">
              View all
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <RecentScansTable scans={scans.slice(0, 5)} />
      </Card>
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
