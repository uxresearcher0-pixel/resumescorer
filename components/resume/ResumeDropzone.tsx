"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Spinner, Progress } from "flowbite-react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { validateResumeFile } from "@/lib/resume/validator";
import { formatFileSize } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface ResumeDropzoneProps {
  onUploadComplete: (resumeId: string, fileName: string) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function ResumeDropzone({ onUploadComplete }: ResumeDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const dropped = acceptedFiles[0];
      if (!dropped) return;

      const validation = validateResumeFile(dropped);
      if (!validation.valid) {
        setError(validation.error!);
        return;
      }

      setFile(dropped);
      setError(null);
      setUploadState("uploading");
      setProgress(20);

      try {
        const formData = new FormData();
        formData.append("file", dropped);

        setProgress(50);
        const uploadRes = await fetch("/api/resume/upload", {
          method: "POST",
          body: formData,
        });

        setProgress(80);

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Upload failed");
        }

        const { resumeId } = await uploadRes.json();
        setProgress(100);
        setUploadState("success");
        onUploadComplete(resumeId, dropped.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setUploadState("error");
        setProgress(0);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: uploadState === "uploading",
  });

  const reset = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
    setError(null);
  };

  return (
    <div className="w-full">
      {/* Dropzone */}
      {uploadState === "idle" && (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all",
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/10"
          )}
          aria-label="Upload resume — drag and drop or click to browse"
        >
          <input {...getInputProps()} aria-label="Resume file input" />
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            {isDragActive ? "Drop your resume here" : "Upload your resume"}
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Drag and drop, or{" "}
            <span className="font-medium text-blue-600 dark:text-blue-400">browse files</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            PDF, DOCX, or TXT · Max 5MB
          </p>
        </div>
      )}

      {/* Uploading state */}
      {uploadState === "uploading" && file && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 dark:border-blue-800 dark:bg-blue-900/20"
          role="status" aria-live="polite" aria-label="Uploading resume">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
            </div>
            <Spinner size="sm" aria-hidden="true" />
          </div>
          <Progress progress={progress} size="sm" color="blue" aria-label={`Upload progress: ${progress}%`} />
          <p className="mt-2 text-center text-sm text-blue-600 dark:text-blue-400">
            Uploading and extracting text…
          </p>
        </div>
      )}

      {/* Success state */}
      {uploadState === "success" && file && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20"
          role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white">Resume uploaded!</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">{file.name} · {formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={reset}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
              aria-label="Remove uploaded file and start over"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {(uploadState === "error" || error) && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={reset}
            className="text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
