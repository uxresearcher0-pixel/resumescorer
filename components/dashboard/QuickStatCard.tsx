import { Card } from "flowbite-react";
import { cn } from "@/lib/utils/cn";

interface QuickStatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

const colorMap = {
  blue:   "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green:  "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  red:    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function QuickStatCard({
  label,
  value,
  subLabel,
  icon,
  trend,
  trendValue,
  color = "blue",
}: QuickStatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subLabel && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subLabel}</p>
          )}
          {trendValue && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend === "up" ? "text-green-600 dark:text-green-400" : "",
                trend === "down" ? "text-red-600 dark:text-red-400" : "",
                trend === "neutral" ? "text-gray-500 dark:text-gray-400" : ""
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </p>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colorMap[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
