"use client";

import { Suspense, useState } from "react";
import { Card, Button, Label, TextInput, Textarea, Select, Alert, Spinner } from "flowbite-react";
import { ArrowRight, AlertCircle, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROLE_CATEGORIES } from "@/lib/utils/constants";

function JobDescriptionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const resumeId = params.get("resumeId");

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [roleCategory, setRoleCategory] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = descriptionText.length;
  const isReady = jobTitle.trim() && descriptionText.trim().length >= 100;

  const handleAnalyze = async () => {
    if (!isReady || !resumeId) return;
    setLoading(true);
    setError(null);

    try {
      // Save JD
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

      // Create report (triggers analysis pipeline)
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
          Paste the full job posting so we can match your resume against it.
        </p>
      </div>

      <Card>
        {error && (
          <Alert color="failure" icon={AlertCircle} className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-5">
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
                {charCount} chars {charCount < 100 ? `(min 100)` : ""}
              </span>
            </div>
            <Textarea
              id="jdText"
              placeholder="Paste the full job description here — including requirements, responsibilities, and preferred qualifications…"
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              rows={12}
              required
              className="resize-y font-mono text-sm leading-relaxed"
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Include the full posting for the most accurate keyword analysis.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
            <Button color="light" href={`/upload`}>
              ← Back
            </Button>
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
