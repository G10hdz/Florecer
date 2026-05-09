/**
 * VisionBoard — The emotional heart of Florecer
 *
 * Displays the user's savings goal as a beautiful vision board
 * with progress overlay, avatar, and aspirational messaging.
 * Designed to make the future feel present.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { ProgressBar } from "@/components/molecules/ProgressBar"

export interface VisionBoardProps {
  imageUrl: string
  goalName: string
  progressPercent: number
  currentAmount: number
  targetAmount: number
  currency: string
  avatarUrl?: string
  pixelArtAvatarSrc?: string
  milestoneDots?: number[]
  className?: string
}

function VisionBoard({
  imageUrl,
  goalName,
  progressPercent,
  currentAmount,
  targetAmount,
  currency,
  avatarUrl,
  pixelArtAvatarSrc,
  milestoneDots = [25, 50, 75, 100],
  className,
}: VisionBoardProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercent))
  const remaining = targetAmount - currentAmount

  return (
    <div
      className={cn(
        "relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-border",
        className
      )}
    >
      {/* Background Image */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10]">
        <img
          src={imageUrl}
          alt={goalName}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

        {/* Milestone Markers on Image */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
          {milestoneDots.map((pct) => (
            <div
              key={pct}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-500",
                clampedProgress >= pct
                  ? "bg-pop border-pop shadow-lg shadow-pop/50 scale-110"
                  : "bg-white/40 border-white/60"
              )}
              style={{ left: `${pct}%`, transform: `translate(-50%, -50%)` }}
            />
          ))}
          {/* Progress Fill */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-pop transition-all duration-700 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* Avatar Overlay */}
        {(avatarUrl || pixelArtAvatarSrc) && (
          <div className="absolute top-4 right-4">
            <div className="relative">
              {pixelArtAvatarSrc ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-4 border-white/90 shadow-xl overflow-hidden bg-surface flex items-center justify-center p-1">
                  <img
                    src={pixelArtAvatarSrc}
                    alt="Tu avatar"
                    className="w-full h-full object-contain [image-rendering:pixelated] [image-rendering:crisp-edges]"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/90 shadow-xl overflow-hidden bg-surface">
                  <img
                    src={avatarUrl}
                    alt="Tu avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {clampedProgress >= 100 && (
                <div className="absolute -bottom-1 -right-1 text-2xl animate-bounce">
                  🎉
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 space-y-3">
          {/* Goal Name */}
          <div>
            <p className="text-white/80 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">
              Estás construyendo
            </p>
            <h2 className="text-white text-xl sm:text-2xl font-bold leading-tight">
              {goalName}
            </h2>
          </div>

          {/* Progress Info */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <ProgressBar
                percent={clampedProgress}
                showValue
                size="lg"
                animated
              />
            </div>
            <div className="text-right text-white shrink-0">
              <p className="text-xs sm:text-sm text-white/70">
                {currentAmount.toLocaleString()} {currency}
              </p>
              <p className="text-lg sm:text-xl font-bold">
                {targetAmount.toLocaleString()} {currency}
              </p>
            </div>
          </div>

          {/* Emotional Message */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <p className="text-white text-sm sm:text-base font-medium">
              {clampedProgress >= 100
                ? "🎉 ¡Lo lograste! Tu dedicación construyó esto."
                : clampedProgress >= 75
                ? `🔥 ¡Casi llegas! Solo ${remaining.toLocaleString()} ${currency} más.`
                : clampedProgress >= 50
                ? `💪 Vas por la mitad. Cada depósito te acerca a ${goalName}.`
                : clampedProgress >= 25
                ? `🌱 Buen inicio. ${remaining.toLocaleString()} ${currency} te separan de tu meta.`
                : `✨ Este es el primer paso hacia ${goalName}.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export { VisionBoard }
