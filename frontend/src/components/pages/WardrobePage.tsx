import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AvatarPreview, CosmeticGrid } from "@/components/organisms"
import { Button } from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"

function WardrobePage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [selectedCombo, setSelectedCombo] = React.useState({
    hat: undefined as string | undefined,
    dress: undefined as string | undefined,
    shoes: undefined as string | undefined,
    accessory: undefined as string | undefined,
  })

  type Cosmetic = {
    cosmetic_id: string
    name: string
    category: "hat" | "dress" | "accessory" | "shoes"
    emoji?: string
    r2_url?: string
  }

  const cosmetics: Cosmetic[] = [
    { cosmetic_id: "hat_1", name: "Sombrero Decorativo", category: "hat", emoji: "🎩" },
    { cosmetic_id: "dress_1", name: "Vestido Ahorrador", category: "dress", emoji: "👗" },
    { cosmetic_id: "shoes_1", name: "Zapatos de Éxito", category: "shoes", emoji: "👠" },
    { cosmetic_id: "accessory_1", name: "Anillo Brillante", category: "accessory", emoji: "💍" },
  ]

  const unlockedCosmeticIds = ["hat_1", "dress_1"]

  const handleSelect = (cosmetic: Cosmetic) => {
    setSelectedCombo((prev) => ({
      ...prev,
      [cosmetic.category]: prev[cosmetic.category] === cosmetic.cosmetic_id
        ? undefined
        : cosmetic.cosmetic_id,
    }))
  }

  const handleApply = () => {
    addToast({
      message: "¡Look aplicado! Tu compañera está feliz 😍",
      type: "success",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-surface p-4 space-y-6">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-foreground">Guardarropa</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/dashboard")}
        >
          ← Volver
        </Button>
      </header>

      <AvatarPreview
        baseUrl=""
        combo={selectedCombo}
        size="lg"
      />

      <CosmeticGrid
        cosmetics={cosmetics}
        selectedCombo={selectedCombo}
        unlockedCosmeticIds={unlockedCosmeticIds}
        onSelect={handleSelect}
      />

      <Button
        onClick={handleApply}
        variant="pop"
        size="lg"
        className="w-full"
      >
        Aplicar look ✨
      </Button>
    </div>
  )
}

export { WardrobePage }
