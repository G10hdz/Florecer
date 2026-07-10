import * as React from "react"
import { ProgressBar } from "./ProgressBar"

export interface XPBarProps {
  currentXP: number
  nextMilestoneXP: number
  label?: string
}

function XPBar({ currentXP, nextMilestoneXP, label = "XP" }: XPBarProps) {
  const percent = nextMilestoneXP > 0
    ? (currentXP / nextMilestoneXP) * 100
    : 0

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground font-medium">
          {currentXP} / {nextMilestoneXP} XP
        </span>
      </div>
      <ProgressBar
        percent={percent}
        size="md"
        animated
        showValue={false}
      />
    </div>
  )
}

export { XPBar }
