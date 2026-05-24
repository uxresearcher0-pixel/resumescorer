"use client";

import { useState } from "react";
import { Card, Button, Alert } from "flowbite-react";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { Metadata } from "next";
import ResumeDropzone from "@/components/resume/ResumeDropzone";
import { useAnalysisStore } from "@/store/analysisStore";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const { setSelectedResume } = useAnalysisStore();
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleUploadComplete = (resumeId: string, fileName: string) => {
    setUploadedResumeId(resumeId);
    setUploadedFileName(fileName);
  };

  const handleContinue = () => {
    if (!uploadedResumeId) return;
    router.push(`/job-description?resumeId=${uploadedResumeId}`);
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
          <span>Upload Resume</span>
          <span className="text-gray-300 dark:text-gray-600">→</span>
          <span className="opacity-50">Job Description</span>
          <span className="text-gray-300 dark:text-gray-600 opacity-50">→</span>
          <span className="opacity-50">Get Score</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload your resume</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          We&apos;ll extract text from your file and analyze it against the job description.
        </p>
      </div>

      <Card>
        <ResumeDropzone onUploadComplete={handleUploadComplete} />

        {uploadedResumeId && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-700">
            <Alert color="success" icon={CheckCircle} className="flex-1 mr-4">
              <span className="font-medium">{uploadedFileName}</span> is ready to analyze.
            </Alert>
            <Button color="blue" onClick={handleContinue} className="flex-shrink-0 font-semibold">
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Tips */}
      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">💡 Tips for best results</h3>
        <ul className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          <li>• Use PDF format for best ATS compatibility</li>
          <li>• Avoid tables, columns, or graphics-heavy layouts</li>
          <li>• Make sure your contact email is clearly visible</li>
          <li>• Include standard section headings (Experience, Education, Skills)</li>
        </ul>
      </div>
    </div>
  );
}
