/**
 * PixelArtSprite — Your companion, in pixel art form
 *
 * Renders pixel art avatars with crisp edges using
 * image-rendering: pixelated. Designed for assets
 * generated via Vertex API and retouched by hand.
 */
import * as React from "react"
import { cn } from "@/lib/utils"

export interface PixelArtSpriteProps {
  src: string
  alt?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  mood?: "sad" | "neutral" | "happy" | "excited"
  animating?: boolean
  className?: string
}

const sizeMap = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
}

function PixelArtSprite({
  src,
  alt = "Sprite",
  size = "md",
  mood = "happy",
  animating = false,
  className,
}: PixelArtSpriteProps) {
  return (
    <div
      className={cn(
        "relative inline-block",
        sizeMap[size],
        animating && "animate-bounce",
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "pixelart w-full h-full object-contain"
        )}
      />
      
      {/* Mood overlay effects */}
      {mood === "excited" && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pop rounded-full animate-ping" />
          <div className="absolute -top-2 -left-1 text-xs animate-pulse">✨</div>
          <div className="absolute -bottom-1 -right-2 text-xs animate-pulse">🌟</div>
        </>
      )}
      
      {mood === "happy" && (
        <div className="absolute -top-1 -right-1 text-xs animate-pulse">✨</div>
      )}
      
      {mood === "sad" && (
        <div className="absolute top-0 right-0 text-xs opacity-50">💧</div>
      )}
    </div>
  )
}

export { PixelArtSprite }
