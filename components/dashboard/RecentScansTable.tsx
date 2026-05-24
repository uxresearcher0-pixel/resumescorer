"use client";

import { Table, Badge, Button, Spinner } from "flowbite-react";
import { Eye, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/format";
import { getScoreBadgeColor, getScoreLabel } from "@/lib/scoring/engine";
import EmptyState from "@/components/ui/EmptyState";
import { History } from "lucide-react";

interface ScanRow {
  id: string;
  jobTitle: string;
  company?: string;
  score: number;
  status: "completed" | "processing" | "failed";
  createdAt: string;
}

interface RecentScansTableProps {
  scans: ScanRow[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function RecentScansTable({
  scans,
  loading,
  onDelete,
}: RecentScansTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" aria-label="Loading scans" />
      </div>
    );
  }

  if (!scans.length) {
    return (
      <EmptyState
        icon={<History className="h-7 w-7" />}
        title="No analyses yet"
        description="Upload a resume and paste a job description to get your first score."
        actionLabel="Analyze Resume"
        actionHref="/upload"
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Job Title</Table.HeadCell>
          <Table.HeadCell>Company</Table.HeadCell>
          <Table.HeadCell>Score</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Actions</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {scans.map((scan) => {
            const color = getScoreBadgeColor(scan.score) as "green" | "blue" | "yellow" | "red";
            return (
              <Table.Row
                key={scan.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  {scan.jobTitle}
                </Table.Cell>
                <Table.Cell className="text-gray-500 dark:text-gray-400">
                  {scan.company || "—"}
                </Table.Cell>
                <Table.Cell>
                  {scan.status === "completed" ? (
                    <Badge color={color} className="font-bold">
                      {scan.score}/100 · {getScoreLabel(scan.score)}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      scan.status === "completed"
                        ? "green"
                        : scan.status === "processing"
                        ? "yellow"
                        : "red"
                    }
                  >
                    {scan.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="text-gray-500 dark:text-gray-400 text-sm">
                  {formatRelativeTime(scan.createdAt)}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    {scan.status === "completed" && (
                      <Button
                        size="xs"
                        color="blue"
                        href={`/report/${scan.id}`}
                        aria-label={`View report for ${scan.jobTitle}`}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => onDelete(scan.id)}
                        aria-label={`Delete scan for ${scan.jobTitle}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
