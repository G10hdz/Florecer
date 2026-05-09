import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarPreviewProps {
  baseUrl: string
  combo: {
    hat?: string
    dress?: string
    shoes?: string
    accessory?: string
  }
  size?: "sm" | "md" | "lg"
}

function AvatarPreview({ baseUrl, combo, size = "md" }: AvatarPreviewProps) {
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({})

  const sizeClasses = {
    sm: "w-32 h-48",
    md: "w-48 h-64",
    lg: "w-64 h-80",
  }

  const handleImageError = (layer: string) => {
    setImageErrors((prev) => ({ ...prev, [layer]: true }))
  }

  const layers = [
    { key: "base", src: baseUrl, zIndex: 0 },
    { key: "dress", src: combo.dress, zIndex: 1 },
    { key: "shoes", src: combo.shoes, zIndex: 2 },
    { key: "hat", src: combo.hat, zIndex: 3 },
    { key: "accessory", src: combo.accessory, zIndex: 4 },
  ]

  return (
    <div className={cn("relative mx-auto", sizeClasses[size])}>
      {layers.map(({ key, src, zIndex }) => {
        if (!src || imageErrors[key]) return null
        
        return (
          <img
            key={key}
            src={src}
            alt={key}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ zIndex }}
            onError={() => handleImageError(key)}
          />
        )
      })}
      
      {!baseUrl && (
        <div className="w-full h-full flex items-center justify-center bg-secondary rounded-full">
          <span className="text-4xl">👤</span>
        </div>
      )}
    </div>
  )
}

export { AvatarPreview }
