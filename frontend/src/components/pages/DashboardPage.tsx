/**
 * DashboardPage — Your financial vision, front and center
 *
 * The dashboard is designed around one core insight:
 * You impulse spend because the future goal is invisible.
 * The vision board makes it visible, beautiful, and present.
 *
 * Multiple goals = multiple versions of your future self.
 * Each one deserves a vision.
 *
 * Flow:
 * 1. Open app → See your goals gallery
 * 2. Pick a goal → Big vision board
 * 3. Feel the impulse → Tap ImpulseSwap
 * 4. Deposit → Watch that future get closer
 */
import * as React from "react"
import { useToast } from "@/components/ui/Toast"
import { VisionBoard } from "@/components/organisms/VisionBoard"
import { VisionGrid } from "@/components/organisms/VisionGrid"
import { ImpulseSwap } from "@/components/organisms/ImpulseSwap"
import { CompanionWidget } from "@/components/organisms/CompanionWidget"
import { DepositModal } from "@/components/organisms/DepositModal"
import { StreakBadge } from "@/components/molecules/StreakBadge"
import { PixelArtSprite } from "@/components/molecules/PixelArtSprite"
import { Button } from "@/components/ui/Button"
import type { VisionGoal } from "@/components/organisms/VisionGrid"
import { cn } from "@/lib/utils"

// Your actual goals - customize image URLs with real photos
const MY_GOALS: VisionGoal[] = [
  {
    goal_id: "laptop",
    name: "Laptop para crear",
    progress_percent: 42,
    current_amount: 10500,
    target_amount: 25000,
    currency: "MXN",
    vision_image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    priority: "urgent",
    emoji: "💻",
  },
  {
    goal_id: "phone",
    name: "Mejor teléfono",
    progress_percent: 15,
    current_amount: 1800,
    target_amount: 12000,
    currency: "MXN",
    vision_image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    priority: "soon",
    emoji: "📱",
  },
  {
    goal_id: "mic",
    name: "Micrófono para contenido",
    progress_percent: 30,
    current_amount: 900,
    target_amount: 3000,
    currency: "MXN",
    vision_image_url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
    priority: "soon",
    emoji: "🎙️",
  },
  {
    goal_id: "minipc",
    name: "Mini PC para IA local",
    progress_percent: 20,
    current_amount: 2400,
    target_amount: 12000,
    currency: "MXN",
    vision_image_url: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80",
    priority: "soon",
    emoji: "🖥️",
  },
  {
    goal_id: "motorbike",
    name: "Motocicleta",
    progress_percent: 8,
    current_amount: 4000,
    target_amount: 50000,
    currency: "MXN",
    vision_image_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80",
    priority: "future",
    emoji: "🏍️",
  },
  {
    goal_id: "dgx",
    name: "NVIDIA DGX Spark",
    progress_percent: 2,
    current_amount: 1500,
    target_amount: 75000,
    currency: "MXN",
    vision_image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    priority: "dream",
    emoji: "🧠",
  },
  {
    goal_id: "positronica",
    name: "Positronica Labs",
    progress_percent: 5,
    current_amount: 2500,
    target_amount: 50000,
    currency: "MXN",
    vision_image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    priority: "dream",
    emoji: "🚀",
  },
]

const avatarUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80"

function DashboardPage() {
  const { addToast } = useToast()
  const [focusedGoalId, setFocusedGoalId] = React.useState("laptop")
  const [depositOpen, setDepositOpen] = React.useState(false)
  const [depositDefaults, setDepositDefaults] = React.useState<{ amount?: number; note?: string }>({})

  const focusedGoal = MY_GOALS.find((g) => g.goal_id === focusedGoalId) || MY_GOALS[0]

  // TODO: Replace with TanStack Query + real data
  const companion = {
    mood: 72,
    streak: 5,
    hoursUntilBreak: 38,
  }

  const totalSaved = MY_GOALS.reduce((sum, g) => sum + g.current_amount, 0)
  const totalTarget = MY_GOALS.reduce((sum, g) => sum + g.target_amount, 0)
  const overallProgress = Math.round((totalSaved / totalTarget) * 100)

  const handleImpulseSwap = (amount: number, category: string) => {
    setDepositDefaults({
      amount,
      note: `Evité gasto: ${category}`,
    })
    setDepositOpen(true)
  }

  const handleDepositSubmit = async (data: { amount: number; note: string }) => {
    // TODO: Wire to API
    console.log("Deposit to", focusedGoal.name, ":", data)
    addToast({
      message: `¡+$${data.amount} MXN hacia ${focusedGoal.name}! ✨`,
      type: "success",
    })
  }

  const daysUntilDeadline = 90 // Placeholder

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-surface">
      <div className="max-w-lg mx-auto p-4 space-y-6 pb-24">
        {/* Header */}
        <header className="flex justify-between items-center py-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Florecer 🌸</h1>
            <p className="text-sm text-muted-foreground">
              Construyendo tu independencia
            </p>
          </div>
          <div className="text-right">
            <StreakBadge streak={companion.streak} />
            <p className="text-xs text-muted-foreground mt-1">
              {totalSaved.toLocaleString()} MXN ahorrados
            </p>
          </div>
        </header>

        {/* Overall Progress */}
        <div className="bg-surface rounded-2xl border-2 border-border p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Progreso general
            </span>
            <span className="text-lg font-bold text-primary">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-pop to-accent transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {totalSaved.toLocaleString()} / {totalTarget.toLocaleString()} MXN en {MY_GOALS.length} metas
          </p>
        </div>

        {/* Vision Grid — All Your Futures */}
        <VisionGrid
          goals={MY_GOALS}
          focusedGoalId={focusedGoalId}
          onFocus={setFocusedGoalId}
        />

        {/* Focused Goal — Big Vision Board */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">
              🎯 Enfoque actual
            </h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
              focusedGoal.priority === "urgent" && "bg-red-500/10 text-red-500",
              focusedGoal.priority === "soon" && "bg-yellow-500/10 text-yellow-600",
              focusedGoal.priority === "future" && "bg-green-500/10 text-green-600",
              focusedGoal.priority === "dream" && "bg-amber-500/10 text-amber-600",
            )}>
              {focusedGoal.priority}
            </span>
          </div>

          <VisionBoard
            imageUrl={focusedGoal.vision_image_url}
            goalName={focusedGoal.name}
            progressPercent={focusedGoal.progress_percent}
            currentAmount={focusedGoal.current_amount}
            targetAmount={focusedGoal.target_amount}
            currency={focusedGoal.currency}
            pixelArtAvatarSrc={`/assets/pixelart/avatar_base_1.png`}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-2xl border-2 border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{focusedGoal.progress_percent}%</p>
            <p className="text-xs text-muted-foreground">Progreso</p>
          </div>
          <div className="bg-surface rounded-2xl border-2 border-border p-4 text-center">
            <p className="text-2xl font-bold text-pop">{companion.streak}</p>
            <p className="text-xs text-muted-foreground">Días racha</p>
          </div>
          <div className="bg-surface rounded-2xl border-2 border-border p-4 text-center">
            <p className="text-2xl font-bold text-accent">
              {daysUntilDeadline > 0 ? daysUntilDeadline : "✨"}
            </p>
            <p className="text-xs text-muted-foreground">
              {daysUntilDeadline > 0 ? "Días meta" : "¡Llegaste!"}
            </p>
          </div>
        </div>

        {/* Impulse Swap — Targeted to Focused Goal */}
        <div className="bg-surface rounded-2xl border-2 border-border p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{focusedGoal.emoji}</span>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                💡 Impulso de hoy
              </h3>
              <p className="text-sm text-muted-foreground">
                Depósitos van a: {focusedGoal.name}
              </p>
            </div>
          </div>
          <ImpulseSwap
            currency={focusedGoal.currency}
            onSwap={handleImpulseSwap}
          />
        </div>

        {/* Companion */}
        <CompanionWidget
          mood={companion.mood}
          streak={companion.streak}
          hoursUntilBreak={companion.hoursUntilBreak}
          pixelArtSrc="/assets/pixelart/companion_happy.png"
        />

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setDepositDefaults({})
              setDepositOpen(true)
            }}
            variant="primary"
            className="flex-1"
            size="lg"
          >
            💰 Depósito a {focusedGoal.emoji}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={() => {
              window.location.href = "/studio"
            }}
          >
            🎨 Estudio
          </Button>
        </div>
      </div>

      {/* Floating deposit button for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          onClick={() => {
            setDepositDefaults({})
            setDepositOpen(true)
          }}
          className="w-14 h-14 rounded-full bg-pop text-white shadow-xl shadow-pop/50 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        >
          +
        </button>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        open={depositOpen}
        onClose={() => {
          setDepositOpen(false)
          setDepositDefaults({})
        }}
        onSubmit={handleDepositSubmit}
        currency={focusedGoal.currency}
        defaultAmount={depositDefaults.amount}
        defaultNote={depositDefaults.note}
      />
    </div>
  )
}

export { DashboardPage }
