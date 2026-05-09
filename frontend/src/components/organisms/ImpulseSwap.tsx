/**
 * ImpulseSwap — Turn impulse spending into savings
 *
 * The most important behavioral feature in Florecer.
 * When you're about to spend on delivery, shopping, or rides,
 * one tap redirects that money to your goal instead.
 *
 * No guilt. Just a better choice.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export interface ImpulseCategory {
  id: string
  emoji: string
  label: string
  description: string
  defaultAmount: number
  color: string
}

export const DEFAULT_IMPULSE_CATEGORIES: ImpulseCategory[] = [
  {
    id: "delivery",
    emoji: "🍔",
    label: "Delivery",
    description: "Uber Eats, Rappi, etc.",
    defaultAmount: 150,
    color: "#FF6B6B",
  },
  {
    id: "shopping",
    emoji: "🛍️",
    label: "Shopping",
    description: "Temu, AliExpress, Shein",
    defaultAmount: 200,
    color: "#4ECDC4",
  },
  {
    id: "rides",
    emoji: "🚗",
    label: "Rides",
    description: "Uber, Didi, inDriver",
    defaultAmount: 80,
    color: "#45B7D1",
  },
  {
    id: "treats",
    emoji: "☕",
    label: "Daily Treat",
    description: "Café, snack, etc.",
    defaultAmount: 50,
    color: "#96CEB4",
  },
  {
    id: "streaming",
    emoji: "🎬",
    label: "Streaming",
    description: "Netflix, Spotify, etc.",
    defaultAmount: 150,
    color: "#DDA0DD",
  },
  {
    id: "merch",
    emoji: "🎵",
    label: "Merch",
    description: "K-pop, anime, etc.",
    defaultAmount: 300,
    color: "#FFD93D",
  },
]

export interface ImpulseSwapProps {
  categories?: ImpulseCategory[]
  currency?: string
  onSwap: (amount: number, category: string) => void
  className?: string
}

function ImpulseSwap({
  categories = DEFAULT_IMPULSE_CATEGORIES,
  currency = "MXN",
  onSwap,
  className,
}: ImpulseSwapProps) {
  const [customAmount, setCustomAmount] = React.useState("")
  const [showCustom, setShowCustom] = React.useState(false)
  const [justSwapped, setJustSwapped] = React.useState<string | null>(null)

  const handleSwap = (category: ImpulseCategory) => {
    onSwap(category.defaultAmount, category.id)
    setJustSwapped(category.id)
    setTimeout(() => setJustSwapped(null), 1500)
  }

  const handleCustomSwap = () => {
    const amount = parseFloat(customAmount)
    if (amount > 0) {
      onSwap(amount, "custom")
      setCustomAmount("")
      setShowCustom(false)
      setJustSwapped("custom")
      setTimeout(() => setJustSwapped(null), 1500)
    }
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            💡 Impulso de hoy
          </h3>
          <p className="text-sm text-muted-foreground">
            Convierte un gasto en inversión
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleSwap(category)}
            disabled={justSwapped === category.id}
            className={cn(
              "relative p-4 rounded-2xl border-2 transition-all duration-300 text-left",
              "hover:scale-105 hover:shadow-lg active:scale-95",
              justSwapped === category.id
                ? "border-pop bg-pop/10 scale-105"
                : "border-border bg-surface hover:border-primary/50"
            )}
            style={
              justSwapped === category.id
                ? { borderColor: category.color }
                : {}
            }
          >
            <div className="text-3xl mb-2">{category.emoji}</div>
            <div className="font-semibold text-foreground text-sm">
              {category.label}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {category.description}
            </div>
            <div
              className="mt-2 text-sm font-bold"
              style={{ color: category.color }}
            >
              {justSwapped === category.id ? "¡Guardado! ✨" : `+${category.defaultAmount} ${currency}`}
            </div>
          </button>
        ))}

        {/* Custom Amount */}
        {showCustom ? (
          <div className="col-span-2 sm:col-span-3 p-4 rounded-2xl border-2 border-primary bg-primary/5 space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="¿Cuánto ibas a gastar?"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none"
                autoFocus
              />
              <Button onClick={handleCustomSwap} variant="pop">
                Guardar
              </Button>
              <Button
                onClick={() => {
                  setShowCustom(false)
                  setCustomAmount("")
                }}
                variant="ghost"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="col-span-2 sm:col-span-3 p-4 rounded-2xl border-2 border-dashed border-border bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-center"
          >
            <span className="text-2xl">💰</span>
            <span className="ml-2 font-medium text-foreground">
              Otra cantidad...
            </span>
          </button>
        )}
      </div>

      {/* Encouragement */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Cada vez que eliges tu meta sobre un impulso, tu futuro agradece ✨
        </p>
      </div>
    </div>
  )
}

export { ImpulseSwap }
