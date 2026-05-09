import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/Tooltip"

interface Milestone {
  sequence: number
  xp_threshold: number
  cosmetic_id: string
  emoji: string
}

export interface MilestoneTrackProps {
  currentXP: number
  milestones?: Milestone[]
  nextMilestone?: Milestone
}

function MilestoneTrack({ currentXP, milestones = [], nextMilestone }: MilestoneTrackProps) {
  const defaultMilestones: Milestone[] = [
    { sequence: 1, xp_threshold: 500, cosmetic_id: "hat_1", emoji: "🎩" },
    { sequence: 2, xp_threshold: 1500, cosmetic_id: "dress_1", emoji: "👗" },
    { sequence: 3, xp_threshold: 3000, cosmetic_id: "shoes_1", emoji: "👠" },
    { sequence: 4, xp_threshold: 5000, cosmetic_id: "accessory_1", emoji: "💍" },
    { sequence: 5, xp_threshold: 10000, cosmetic_id: "hat_2", emoji: "🎩" },
  ]

  const displayMilestones = milestones.length > 0 ? milestones : defaultMilestones

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-foreground">Hitos</span>
        {nextMilestone && (
          <span className="text-xs text-muted-foreground">
            Siguiente: {nextMilestone.emoji} en {nextMilestone.xp_threshold - currentXP} XP
          </span>
        )}
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-secondary rounded-full -translate-y-1/2" />
        
        {/* Milestone Dots */}
        <div className="flex justify-between relative">
          {displayMilestones.map((milestone, index) => {
            const unlocked = currentXP >= milestone.xp_threshold
            const isNext = !unlocked && (!nextMilestone || milestone.cosmetic_id === nextMilestone.cosmetic_id)

            return (
              <Tooltip
                key={milestone.cosmetic_id}
                content={
                  <div className="text-center">
                    <div className="text-lg mb-1">{milestone.emoji}</div>
                    <div className="font-medium">{milestone.cosmetic_id.replace("_", " ")}</div>
                    <div className="text-xs text-muted-foreground">{milestone.xp_threshold} XP</div>
                  </div>
                }
                side="top"
              >
                <button
                  className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300",
                    unlocked
                      ? "bg-primary text-white shadow-lg scale-110"
                      : isNext
                      ? "bg-accent text-white ring-2 ring-accent ring-opacity-50 animate-pulse"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {unlocked ? milestone.emoji : "🔒"}
                </button>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { MilestoneTrack }
