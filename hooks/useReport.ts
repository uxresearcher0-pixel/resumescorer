"use client";

import { useState, useEffect, useCallback } from "react";
import type { Report } from "@/types/report";

export function useReport(reportId: string | null) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/report/${id}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setReport(data.report);
      return data.report as Report;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll until completed when status is pending/processing
  useEffect(() => {
    if (!reportId) return;

    let interval: NodeJS.Timeout;

    const poll = async () => {
      const r = await fetchReport(reportId);
      if (r && (r.status === "completed" || r.status === "failed")) {
        clearInterval(interval);
      }
    };

    poll();
    interval = setInterval(poll, 2500);

    return () => clearInterval(interval);
  }, [reportId, fetchReport]);

  return { report, loading, error, refetch: () => reportId && fetchReport(reportId) };
}
