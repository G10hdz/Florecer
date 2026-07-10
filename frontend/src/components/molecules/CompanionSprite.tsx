import * as React from "react"
import { cn } from "@/lib/utils"

export interface CompanionSpriteProps {
  mood: number
  animating?: boolean
  size?: "sm" | "md" | "lg"
}

function CompanionSprite({ mood, animating = false, size = "md" }: CompanionSpriteProps) {
  const getMoodState = (mood: number) => {
    if (mood <= 25) return "sad"
    if (mood <= 50) return "neutral"
    if (mood <= 75) return "happy"
    return "excited"
  }

  const state = getMoodState(mood)

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const getSpriteEmoji = (state: string) => {
    switch (state) {
      case "sad": return "😢"
      case "neutral": return "😐"
      case "happy": return "🙂"
      case "excited": return "😍"
      default: return "🙂"
    }
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br from-base to-surface shadow-lg",
        sizeClasses[size],
        animating && "animate-bounce",
        state === "excited" && "ring-4 ring-pop ring-opacity-50",
        state === "happy" && "ring-2 ring-primary ring-opacity-30"
      )}
    >
      <span className="text-4xl">{getSpriteEmoji(state)}</span>
      
      {state === "excited" && (
        <div className="absolute -top-2 -right-2 text-lg animate-ping">
          ✨
        </div>
      )}
    </div>
  )
}

export { CompanionSprite }
