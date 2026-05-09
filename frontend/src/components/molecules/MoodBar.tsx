import * as React from "react"
import { cn } from "@/lib/utils"

export interface MoodBarProps {
  mood: number
}

function MoodBar({ mood }: MoodBarProps) {
  const clampedMood = Math.min(100, Math.max(0, mood))

  const getMoodEmoji = (mood: number) => {
    if (mood <= 25) return "😢"
    if (mood <= 50) return "😐"
    if (mood <= 75) return "🙂"
    return "😍"
  }

  const getMoodState = (mood: number) => {
    if (mood <= 25) return "sad"
    if (mood <= 50) return "neutral"
    if (mood <= 75) return "happy"
    return "excited"
  }

  const emoji = getMoodEmoji(clampedMood)
  const state = getMoodState(clampedMood)

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-foreground">Estado de ánimo</span>
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            state === "excited" && "bg-pop",
            state === "happy" && "bg-primary",
            state === "neutral" && "bg-accent",
            state === "sad" && "bg-muted-foreground"
          )}
          style={{ width: `${clampedMood}%` }}
        />
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ left: `${clampedMood}%` }}
        >
          <span className="text-sm">{emoji}</span>
        </div>
      </div>
    </div>
  )
}

export { MoodBar }
