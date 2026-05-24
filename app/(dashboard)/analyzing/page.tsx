"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { useReport } from "@/hooks/useReport";
import { ANALYSIS_STEPS } from "@/lib/utils/constants";

export default function AnalyzingPage() {
  const params = useSearchParams();
  const reportId = params.get("reportId");
  const router = useRouter();
  const { report } = useReport(reportId);
  const [currentStep, setCurrentStep] = useState(0);

  // Advance steps on a timer for UX
  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length - 1) return;
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 1800);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Redirect when done
  useEffect(() => {
    if (report?.status === "completed") {
      router.push(`/report/${reportId}`);
    }
    if (report?.status === "failed") {
      router.push(`/dashboard?error=analysis_failed`);
    }
  }, [report, reportId, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-md text-center">
        {/* Spinning logo */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-9 w-9 text-white" aria-hidden="true" />
          </motion.div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Analyzing your resume
        </h1>
        <p className="mb-10 text-gray-500 dark:text-gray-400">
          Our AI is comparing your resume against the job description…
        </p>

        {/* Step list */}
        <div className="space-y-3 text-left" role="status" aria-live="polite" aria-label="Analysis progress">
          {ANALYSIS_STEPS.map((step, index) => {
            const isDone = index < currentStep;
            const isActive = index === currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: index <= currentStep ? 1 : 0.35, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  isActive
                    ? "border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                    : "bg-transparent"
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-200 dark:border-gray-600" aria-hidden="true" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isDone
                      ? "text-green-700 dark:text-green-400"
                      : isActive
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
          This usually takes 10–20 seconds
        </p>
      </div>
    </div>
  );
}
