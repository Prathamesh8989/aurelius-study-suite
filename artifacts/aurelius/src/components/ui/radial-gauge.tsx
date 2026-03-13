import React from "react";
import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function RadialGauge({ 
  value, 
  max = 100, 
  size = 120, 
  strokeWidth = 8,
  className,
  label
}: RadialGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeValue = Math.min(Math.max(value, 0), max);
  const percent = safeValue / max;
  const offset = circumference - percent * circumference;

  let colorClass = "text-primary";
  if (percent < 0.5) colorClass = "text-destructive";
  else if (percent < 0.8) colorClass = "text-warning";
  else colorClass = "text-success";

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-border"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colorClass}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-serif font-bold text-foreground">
          {Math.round(value)}
        </span>
        {label && <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}
