import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import { Tooltip } from "@/components/ui/Tooltip"

export interface StreakBadgeProps {
  streak: number
  hoursUntilBreak?: number
}

function StreakBadge({ streak, hoursUntilBreak }: StreakBadgeProps) {
  if (streak === 0) {
    return null
  }

  const isLongStreak = streak >= 5
  const isWarning = hoursUntilBreak !== undefined && hoursUntilBreak < 12

  return (
    <Tooltip
      content={
        isWarning
          ? `¡Cuidado! Tu racha se rompe en ${hoursUntilBreak}h`
          : `${streak} días de racha`
      }
      side="bottom"
    >
      <Badge
        variant={isLongStreak ? "pop" : "default"}
        size="md"
        className={cn(
          "gap-1.5",
          isLongStreak && "animate-pulse shadow-lg shadow-pop/50",
          isWarning && "animate-bounce"
        )}
      >
        <span>🔥</span>
        <span>{streak}</span>
      </Badge>
    </Tooltip>
  )
}

export { StreakBadge }
