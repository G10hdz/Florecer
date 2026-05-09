import * as React from "react"
import { cn } from "@/lib/utils"
import { CosmeticCard } from "@/components/molecules/CosmeticCard"

interface Cosmetic {
  cosmetic_id: string
  name: string
  category: "hat" | "dress" | "accessory" | "shoes"
  emoji?: string
  r2_url?: string
}

export interface CosmeticGridProps {
  cosmetics: Cosmetic[]
  selectedCombo: {
    hat?: string
    dress?: string
    shoes?: string
    accessory?: string
  }
  unlockedCosmeticIds: string[]
  onSelect: (cosmetic: Cosmetic) => void
}

function CosmeticGrid({ cosmetics, selectedCombo, unlockedCosmeticIds, onSelect }: CosmeticGridProps) {
  const [activeCategory, setActiveCategory] = React.useState<"all" | "hat" | "dress" | "shoes" | "accessory">("all")

  const categories = [
    { id: "all", label: "Todos", emoji: "✨" },
    { id: "hat", label: "Sombreros", emoji: "🎩" },
    { id: "dress", label: "Vestidos", emoji: "👗" },
    { id: "shoes", label: "Zapatos", emoji: "👠" },
    { id: "accessory", label: "Accesorios", emoji: "💍" },
  ] as const

  const filteredCosmetics = activeCategory === "all"
    ? cosmetics
    : cosmetics.filter((c) => c.category === activeCategory)

  return (
    <div className="w-full space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeCategory === id
                ? "bg-primary text-white shadow-md"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredCosmetics.map((cosmetic) => (
          <CosmeticCard
            key={cosmetic.cosmetic_id}
            cosmetic={cosmetic}
            unlocked={unlockedCosmeticIds.includes(cosmetic.cosmetic_id)}
            selected={selectedCombo[cosmetic.category] === cosmetic.cosmetic_id}
            onSelect={() => onSelect(cosmetic)}
          />
        ))}
      </div>

      {filteredCosmetics.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay cosméticos en esta categoría aún
        </div>
      )}
    </div>
  )
}

export { CosmeticGrid }
