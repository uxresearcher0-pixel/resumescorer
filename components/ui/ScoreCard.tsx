import { Card, Badge, Progress } from "flowbite-react";
import { getScoreBadgeColor, getScoreLabel } from "@/lib/scoring/engine";

interface ScoreCardProps {
  label: string;
  description?: string;
  score: number;
  icon?: React.ReactNode;
}

export default function ScoreCard({ label, description, score, icon }: ScoreCardProps) {
  const color = getScoreBadgeColor(score) as "green" | "blue" | "yellow" | "red";
  const grade = getScoreLabel(score);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>
        <Badge color={color} className="text-sm font-bold px-2.5 py-1">
          {score}
        </Badge>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{grade}</span>
          <span>{score}/100</span>
        </div>
        <Progress
          progress={score}
          color={color}
          size="sm"
          aria-label={`${label} score: ${score} out of 100`}
        />
      </div>
    </Card>
  );
}
