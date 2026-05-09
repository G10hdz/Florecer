import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"

export interface CosmeticCardProps {
  cosmetic: {
    cosmetic_id: string
    name: string
    category: "hat" | "dress" | "accessory" | "shoes"
    emoji?: string
    r2_url?: string
  }
  selected: boolean
  unlocked: boolean
  onSelect?: () => void
}

function CosmeticCard({ cosmetic, selected, unlocked, onSelect }: CosmeticCardProps) {
  return (
    <div
      onClick={unlocked ? onSelect : undefined}
      className={cn(
        "relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer",
        unlocked && "hover:shadow-md hover:scale-105",
        selected && "border-pop shadow-lg",
        !unlocked && "opacity-60 cursor-not-allowed border-muted-foreground",
        !selected && unlocked && "border-border bg-surface"
      )}
    >
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-10">
          <span className="text-2xl">🔒</span>
        </div>
      )}
      
      <div className="aspect-square w-full flex items-center justify-center mb-2">
        {cosmetic.r2_url ? (
          <img
            src={cosmetic.r2_url}
            alt={cosmetic.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-4xl">{cosmetic.emoji || "✨"}</span>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground truncate">
          {cosmetic.name}
        </p>
        {selected && (
          <Badge variant="pop" size="sm" className="mt-1">
            Equipado
          </Badge>
        )}
      </div>
    </div>
  )
}

export { CosmeticCard }
