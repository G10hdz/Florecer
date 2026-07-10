import * as React from "react"
import { CompanionSprite } from "@/components/molecules/CompanionSprite"
import { PixelArtSprite } from "@/components/molecules/PixelArtSprite"
import { MoodBar } from "@/components/molecules/MoodBar"
import { StreakBadge } from "@/components/molecules/StreakBadge"
import { Badge } from "@/components/ui/Badge"

export interface CompanionWidgetProps {
  mood: number
  streak: number
  hoursUntilBreak?: number
  pixelArtSrc?: string
}

function CompanionWidget({ mood, streak, hoursUntilBreak, pixelArtSrc }: CompanionWidgetProps) {
  const [animationEndedForMood, setAnimationEndedForMood] = React.useState<number | null>(null)
  const animating = animationEndedForMood !== mood

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimationEndedForMood(mood), 1000)
    return () => clearTimeout(timer)
  }, [mood])

  const getMoodState = (mood: number): "sad" | "neutral" | "happy" | "excited" => {
    if (mood <= 25) return "sad"
    if (mood <= 50) return "neutral"
    if (mood <= 75) return "happy"
    return "excited"
  }

  const moodState = getMoodState(mood)

  return (
    <div className="w-full bg-gradient-to-r from-base to-surface rounded-2xl border-2 border-border p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Tu compañera</h3>
        <StreakBadge streak={streak} hoursUntilBreak={hoursUntilBreak} />
      </div>

      <div className="flex items-center gap-6">
        {pixelArtSrc ? (
          <PixelArtSprite
            src={pixelArtSrc}
            mood={moodState}
            animating={animating}
            size="lg"
          />
        ) : (
          <CompanionSprite mood={mood} animating={animating} size="lg" />
        )}
        
        <div className="flex-1 space-y-4">
          <MoodBar mood={mood} />
          
          <div className="flex gap-2">
            {hoursUntilBreak !== undefined && hoursUntilBreak < 24 && (
              <Badge variant="warning" size="sm">
                ¡Deposita pronto para mantener tu racha!
              </Badge>
            )}
            {mood >= 76 && (
              <Badge variant="pop" size="sm">
                ¡Tu compañera está emocionada! 🎉
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { CompanionWidget }
