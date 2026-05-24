"use client";

import { useEffect, useState } from "react";
import { scoreToRingColor } from "@/lib/utils/format";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  animated?: boolean;
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  animated = true,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const color = scoreToRingColor(score);

  useEffect(() => {
    if (!animated) return;
    let start = 0;
    const step = score / 60; // 60 frames ~1s
    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [score, animated]);

  return (
    <div
      className="flex flex-col items-center gap-1"
      role="img"
      aria-label={`Score: ${score} out of 100${label ? ` for ${label}` : ""}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="dark:stroke-gray-700"
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: animated ? "none" : "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      {/* Score number overlay */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size, marginTop: 0 }}
      >
        <span
          className="text-2xl font-bold text-gray-900 dark:text-white"
          style={{ fontSize: size > 100 ? "1.75rem" : "1.25rem" }}
        >
          {displayScore}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">/100</span>
      </div>
      {label && (
        <span className="mt-1 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );
}
