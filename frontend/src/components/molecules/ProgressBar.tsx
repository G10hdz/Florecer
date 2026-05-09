import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps {
  percent: number
  label?: string
  animated?: boolean
  size?: "sm" | "md" | "lg"
  showValue?: boolean
}

function ProgressBar({
  percent,
  label,
  animated = true,
  size = "md",
  showValue = false,
}: ProgressBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent))

  const heightClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }

  const getColorClass = (percent: number) => {
    if (percent >= 100) return "bg-pop"
    if (percent >= 50) return "bg-primary"
    return "bg-accent"
  }

  return (
    <div className="w-full space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="text-muted-foreground font-medium">
              {Math.round(clampedPercent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-secondary overflow-hidden",
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getColorClass(clampedPercent),
            animated && "animate-in slide-in-from-left-0"
          )}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar }
