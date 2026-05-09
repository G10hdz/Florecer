import * as React from "react"
import { cn } from "@/lib/utils"

export interface GoalProgressSummaryProps {
  progressPercent: number
  currency: string
  currentAmount?: number
  targetAmount?: number
  showAmounts?: boolean
}

function GoalProgressSummary({
  progressPercent,
  currency,
  currentAmount,
  targetAmount,
  showAmounts = false,
}: GoalProgressSummaryProps) {
  const clampedPercent = Math.min(100, Math.max(0, progressPercent))

  return (
    <div className="w-full text-center space-y-2">
      <div className={cn(
        "text-3xl font-bold transition-colors duration-300",
        clampedPercent >= 100 ? "text-pop" :
        clampedPercent >= 50 ? "text-primary" :
        "text-accent"
      )}>
        {Math.round(clampedPercent)}%
      </div>
      
      {showAmounts && currentAmount !== undefined && targetAmount !== undefined && (
        <div className="text-sm text-muted-foreground">
          {currentAmount.toLocaleString()} / {targetAmount.toLocaleString()} {currency}
        </div>
      )}
      
      <div className="flex justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const threshold = (i + 1) * 20
          return (
            <span
              key={i}
              className={cn(
                "text-lg transition-all duration-300",
                clampedPercent >= threshold ? "text-primary scale-110" : "text-muted-foreground"
              )}
            >
              ●
            </span>
          )
        })}
      </div>
    </div>
  )
}

export { GoalProgressSummary }
