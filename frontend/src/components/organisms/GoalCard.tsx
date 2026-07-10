import * as React from "react"
import { ProgressBar } from "@/components/molecules/ProgressBar"
import { XPBar } from "@/components/molecules/XPBar"
import { StreakBadge } from "@/components/molecules/StreakBadge"
import { Button } from "@/components/ui/Button"
import { MilestoneTrack } from "./MilestoneTrack"

interface Milestone {
  sequence: number
  xp_threshold: number
  cosmetic_id: string
  emoji: string
}

export interface GoalCardProps {
  goal: {
    goal_id: string
    name: string
    progress_percent: number
    current_amount: number
    target_amount: number
    currency: string
    deadline: string
    xp_total: number
    next_milestone: Milestone | null
  }
  streak: number
  onDeposit?: () => void
}

function GoalCard({ goal, streak, onDeposit }: GoalCardProps) {
  const [renderedAt] = React.useState(() => Date.now())
  const daysUntilDeadline = Math.ceil(
    (new Date(goal.deadline).getTime() - renderedAt) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="w-full bg-surface rounded-2xl border-2 border-border p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">{goal.name}</h2>
          <p className="text-sm text-muted-foreground">
            {daysUntilDeadline > 0 ? `${daysUntilDeadline} días restantes` : "¡Meta vencida!"}
          </p>
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <ProgressBar
          percent={goal.progress_percent}
          label="Progreso"
          size="lg"
          showValue
        />
        
        <div className="text-sm text-muted-foreground text-center">
          {goal.current_amount.toLocaleString()} / {goal.target_amount.toLocaleString()} {goal.currency}
        </div>
      </div>

      {/* XP Bar */}
      <XPBar
        currentXP={goal.xp_total}
        nextMilestoneXP={goal.next_milestone?.xp_threshold || goal.xp_total + 500}
        label="XP hacia próximo hito"
      />

      {/* Milestone Track */}
      {goal.next_milestone && (
        <MilestoneTrack
          currentXP={goal.xp_total}
          nextMilestone={goal.next_milestone}
        />
      )}

      {/* Deposit Button */}
      <Button
        onClick={onDeposit}
        variant="pop"
        size="lg"
        className="w-full"
      >
        💰 Registrar depósito
      </Button>
    </div>
  )
}

export { GoalCard }
