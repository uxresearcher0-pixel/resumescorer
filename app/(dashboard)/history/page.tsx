import type { Metadata } from "next";
import { Card, Button } from "flowbite-react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RecentScansTable from "@/components/dashboard/RecentScansTable";

export const metadata: Metadata = { title: "Analysis History" };

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from("reports")
    .select(`id, overall_score, status, created_at, job_descriptions ( job_title, company_name )`)
    .eq("user_id", user?.id!)
    .order("created_at", { ascending: false });

  const scans = (reports || []).map((r) => ({
    id: r.id,
    jobTitle: (r.job_descriptions as any)?.job_title || "Unknown Role",
    company: (r.job_descriptions as any)?.company_name,
    score: r.overall_score || 0,
    status: r.status as "completed" | "processing" | "failed",
    createdAt: r.created_at,
  }));

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            All your resume analyses — {scans.length} total
          </p>
        </div>
        <Button color="blue" href="/upload" className="font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </div>

      <Card>
        <RecentScansTable scans={scans} />
      </Card>
    </div>
  );
}
