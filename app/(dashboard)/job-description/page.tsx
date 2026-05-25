"use client";

import { Suspense, useState } from "react";
import { Card, Button, Label, TextInput, Textarea, Select, Alert, Spinner } from "flowbite-react";
import { ArrowRight, AlertCircle, FileText, Link, Clipboard, CheckCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROLE_CATEGORIES } from "@/lib/utils/constants";

type InputMode = "url" | "manual";

function JobDescriptionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const resumeId = params.get("resumeId");

  const [mode, setMode] = useState<InputMode>("url");
  const [jobUrl, setJobUrl] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [urlFetched, setUrlFetched] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [roleCategory, setRoleCategory] = useState("");
  const [descriptionText, setDescriptionText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = descriptionText.length;
  const isReady = jobTitle.trim() && descriptionText.trim().length >= 100;

  // ── Fetch job info from URL ────────────────────────────────
  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) return;
    setFetchingUrl(true);
    setUrlError(null);
    setUrlFetched(false);

    try {
      const res = await fetch("/api/jd/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setUrlError(data.error || "Failed to fetch URL");
        return;
      }

      // Auto-fill all fields
      setJobTitle(data.job_title || "");
      setCompany(data.company_name || "");
      setRoleCategory(data.role_category || "");
      setDescriptionText(data.description_text || "");
      setUrlFetched(true);
    } catch {
      setUrlError("Network error. Try copying the job description manually.");
    } finally {
      setFetchingUrl(false);
    }
  };

  // ── Submit & analyze ───────────────────────────────────────
  const handleAnalyze = async () => {
    if (!isReady || !resumeId) return;
    setLoading(true);
    setError(null);

    try {
      const jdRes = await fetch("/api/jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle,
          company_name: company,
          description_text: descriptionText,
          role_category: roleCategory,
        }),
      });
      if (!jdRes.ok) throw new Error("Failed to save job description");
      const { jdId } = await jdRes.json();

      const reportRes = await fetch("/api/report/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescriptionId: jdId }),
      });
      if (!reportRes.ok) throw new Error("Failed to start analysis");
      const { reportId } = await reportRes.json();

      router.push(`/analyzing?reportId=${reportId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Progress header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">✓</span>
          <span className="text-green-600 dark:text-green-400">Resume Uploaded</span>
          <span className="text-gray-300 dark:text-gray-600">→</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
          <span>Job Description</span>
          <span className="text-gray-300 dark:text-gray-600 opacity-50">→</span>
          <span className="opacity-50">Get Score</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add the job description</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Paste the job posting URL or enter the details manually.
        </p>
      </div>

      {/* Input mode tabs */}
      <div className="mb-4 flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => setMode("url")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === "url"
              ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Link className="h-4 w-4" />
          Paste Job URL
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === "manual"
              ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Clipboard className="h-4 w-4" />
          Enter Manually
        </button>
      </div>

      <Card>
        {error && (
          <Alert color="failure" icon={AlertCircle} className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-5">
          {/* URL input mode */}
          {mode === "url" && (
            <div>
              <Label htmlFor="jobUrl" value="Job posting URL" className="mb-1.5 block" />
              <div className="flex gap-2">
                <TextInput
                  id="jobUrl"
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/... or any job posting URL"
                  value={jobUrl}
                  onChange={(e) => {
                    setJobUrl(e.target.value);
                    setUrlFetched(false);
                    setUrlError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                  className="flex-1"
                  icon={Link}
                />
                <Button
                  color="blue"
                  onClick={handleFetchUrl}
                  disabled={!jobUrl.trim() || fetchingUrl}
                  isProcessing={fetchingUrl}
                  className="flex-shrink-0 font-semibold"
                >
                  {fetchingUrl ? "Fetching…" : "Fetch"}
                </Button>
              </div>

              {urlError && (
                <Alert color="warning" icon={AlertCircle} className="mt-3">
                  <span className="font-medium">Could not auto-fetch:</span> {urlError}
                  <button
                    onClick={() => setMode("manual")}
                    className="ml-2 underline font-medium"
                  >
                    Switch to manual entry →
                  </button>
                </Alert>
              )}

              {urlFetched && (
                <Alert color="success" icon={CheckCircle} className="mt-3">
                  <span className="font-medium">Job info extracted!</span> Review the fields below and click Analyze Resume.
                </Alert>
              )}

              {fetchingUrl && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching and extracting job details…
                </div>
              )}
            </div>
          )}

          {/* Manual mode hint */}
          {mode === "manual" && (
            <Alert color="info" className="text-sm">
              Paste the full job description below — include responsibilities, requirements, and preferred qualifications for the most accurate score.
            </Alert>
          )}

          {/* Shared fields — shown after URL fetch or always in manual mode */}
          {(urlFetched || mode === "manual") && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="jobTitle" value="Job title *" className="mb-1.5 block" />
                  <TextInput
                    id="jobTitle"
                    placeholder="e.g. Senior UX Designer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    icon={FileText}
                  />
                </div>
                <div>
                  <Label htmlFor="company" value="Company name" className="mb-1.5 block" />
                  <TextInput
                    id="company"
                    placeholder="e.g. Figma"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="roleCategory" value="Role category" className="mb-1.5 block" />
                <Select
                  id="roleCategory"
                  value={roleCategory}
                  onChange={(e) => setRoleCategory(e.target.value)}
                >
                  <option value="">Select a category…</option>
                  {ROLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label htmlFor="jdText" value="Job description *" />
                  <span className={`text-xs ${charCount < 100 ? "text-red-500" : "text-gray-400"}`}>
                    {charCount} chars {charCount < 100 ? "(min 100)" : ""}
                  </span>
                </div>
                <Textarea
                  id="jdText"
                  placeholder="Full job description will appear here after fetching, or paste it manually…"
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  rows={12}
                  required
                  className="resize-y font-mono text-sm leading-relaxed"
                />
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  Include the full posting for the most accurate keyword analysis. You can edit the auto-filled text.
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
            <Button color="light" href="/upload">
              ← Back
            </Button>
            {(urlFetched || mode === "manual") && (
              <Button
                color="blue"
                onClick={handleAnalyze}
                disabled={!isReady || loading}
                isProcessing={loading}
                className="font-semibold"
              >
                {loading ? "Starting analysis…" : "Analyze Resume"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function JobDescriptionPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>}>
      <JobDescriptionForm />
    </Suspense>
  );
}
