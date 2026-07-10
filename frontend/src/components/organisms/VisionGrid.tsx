/**
 * VisionGrid — Your goals as a gallery of futures
 *
 * Each card is a window into a version of yourself.
 * Tap one to focus on it. The focused goal gets the
 * big vision board treatment.
 */
import * as React from "react"
import { cn } from "@/lib/utils"

export interface VisionGoal {
  goal_id: string
  name: string
  progress_percent: number
  current_amount: number
  target_amount: number
  currency: string
  vision_image_url: string
  priority: "urgent" | "soon" | "future" | "dream"
  emoji: string
  goal_icon_url?: string
}

export interface VisionGridProps {
  goals: VisionGoal[]
  focusedGoalId: string
  onFocus: (goalId: string) => void
  className?: string
}

const priorityConfig = {
  urgent: { label: "Urgente", color: "#FF6B6B", bg: "bg-red-500/10", border: "border-red-500/30" },
  soon: { label: "Pronto", color: "#FFD93D", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  future: { label: "Futuro", color: "#6BCB77", bg: "bg-green-500/10", border: "border-green-500/30" },
  dream: { label: "Sueño", color: "#C9A96E", bg: "bg-amber-500/10", border: "border-amber-500/30" },
}

function VisionGrid({ goals, focusedGoalId, onFocus, className }: VisionGridProps) {
  const sortedGoals = [...goals].sort((a, b) => {
    const priorityOrder = { urgent: 0, soon: 1, future: 2, dream: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">✨ Tu futuro</h3>
        <span className="text-xs text-muted-foreground">
          {goals.length} metas activas
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sortedGoals.map((goal) => {
          const isFocused = goal.goal_id === focusedGoalId
          const priority = priorityConfig[goal.priority]
          const progress = Math.min(100, Math.max(0, goal.progress_percent))

          return (
            <button
              key={goal.goal_id}
              onClick={() => onFocus(goal.goal_id)}
              className={cn(
                "relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left",
                "hover:scale-[1.02] hover:shadow-lg",
                isFocused
                  ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20"
                  : "border-border opacity-80 hover:opacity-100"
              )}
            >
              {/* Image */}
              <div className="relative aspect-[4/3]">
                <img
                  src={goal.vision_image_url}
                  alt={goal.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Priority Badge */}
                <div
                  className={cn(
                    "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    priority.bg,
                    priority.border
                  )}
                  style={{ color: priority.color }}
                >
                  {priority.label}
                </div>

                {/* Focused Indicator */}
                {isFocused && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    ★
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    {goal.goal_icon_url && (
                      <img
                        src={goal.goal_icon_url}
                        alt=""
                        className="pixelart w-6 h-6 shrink-0 object-contain drop-shadow"
                      />
                    )}
                    <span className="text-white text-xs font-semibold truncate">
                      {goal.name}
                    </span>
                  </div>

                  {/* Mini Progress */}
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-pop transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white/80 text-[10px]">
                      {progress}%
                    </span>
                    <span className="text-white/80 text-[10px]">
                      {goal.current_amount.toLocaleString()} /{" "}
                      {goal.target_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { VisionGrid }
