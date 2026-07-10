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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/Toast"
import { VisionBoard } from "@/components/organisms/VisionBoard"
import { VisionGrid } from "@/components/organisms/VisionGrid"
import { ImpulseSwap } from "@/components/organisms/ImpulseSwap"
import { CompanionWidget } from "@/components/organisms/CompanionWidget"
import { DepositModal } from "@/components/organisms/DepositModal"
import { MilestoneTrack } from "@/components/organisms/MilestoneTrack"
import { CelebrationBurst } from "@/components/molecules/CelebrationBurst"
import { StreakBadge } from "@/components/molecules/StreakBadge"
import { PixelArtSprite } from "@/components/molecules/PixelArtSprite"
import { Button } from "@/components/ui/Button"
import type { VisionGoal } from "@/components/organisms/VisionGrid"
import { getCompanion } from "@/services/account"
import { getGamificationSummary, getMilestones, listGoals } from "@/services/goals"
import { logDeposit } from "@/services/transactions"
import type { Goal } from "@/types/api"
import { cn } from "@/lib/utils"
import { getGoalIconUrlByName } from "@/lib/pixel-art-assets"
import heroImage from "@/assets/hero.png"

const goalEmojis = ["🎯", "💻", "📱", "🎙️", "🏠", "✈️", "🚲", "📚"]

type DashboardQueryState = {
  isError: boolean
  isPending: boolean
  isSuccess: boolean
  // react-query pauses a query (fetchStatus 'paused', status stays 'pending')
  // when the BFF is unreachable; treat that as an error so the UI never spins
  // forever. Optional so it defaults to "not paused" for older callers/tests.
  isPaused?: boolean
}

type DashboardGoalsQueryState = DashboardQueryState & {
  data?: { goals: unknown[] }
}

type DashboardStateQueries = {
  goalsQuery: DashboardGoalsQueryState
  summaryQuery: DashboardQueryState
  companionQuery: DashboardQueryState
  milestonesQuery: DashboardQueryState
}

type DashboardRenderState = "error" | "pending" | "empty" | "ready"

function selectDashboardState({
  goalsQuery,
  summaryQuery,
  companionQuery,
  milestonesQuery,
}: DashboardStateQueries): DashboardRenderState {
  if (goalsQuery.isError || summaryQuery.isError || companionQuery.isError || milestonesQuery.isError) {
    return "error"
  }

  // A paused query means the BFF couldn't be reached — surface it as an error
  // rather than an indefinite loading spinner.
  if (goalsQuery.isPaused || summaryQuery.isPaused || companionQuery.isPaused || milestonesQuery.isPaused) {
    return "error"
  }

  if (goalsQuery.isPending || summaryQuery.isPending || companionQuery.isPending || milestonesQuery.isPending) {
    return "pending"
  }

  if (goalsQuery.isSuccess && goalsQuery.data?.goals.length === 0) {
    return "empty"
  }

  return "ready"
}

function goalToVisionGoal(goal: Goal, index: number): VisionGoal {
  return {
    goal_id: goal.goal_id,
    name: goal.name,
    progress_percent: goal.progress_percent,
    current_amount: goal.current_amount,
    target_amount: goal.target_amount,
    currency: goal.currency,
    vision_image_url: heroImage,
    priority: getPriority(goal),
    emoji: goalEmojis[index % goalEmojis.length],
    goal_icon_url: getGoalIconUrlByName(goal.name),
  }
}

function getPriority(goal: Goal): VisionGoal["priority"] {
  const daysUntilDeadline = Math.ceil(
    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (goal.progress_percent >= 100) return "future"
  if (daysUntilDeadline <= 30) return "urgent"
  if (daysUntilDeadline <= 90) return "soon"
  return goal.target_amount >= 50_000 ? "dream" : "future"
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo conectar con el BFF"
}

function DashboardPage() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [focusedGoalId, setFocusedGoalId] = React.useState<string | null>(null)
  const [depositOpen, setDepositOpen] = React.useState(false)
  const [depositDefaults, setDepositDefaults] = React.useState<{ amount?: number; note?: string }>({})
  const [celebrationId, setCelebrationId] = React.useState(0)

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: ({ signal }) => listGoals(signal),
  })
  const summaryQuery = useQuery({
    queryKey: ["gamification", "summary"],
    queryFn: ({ signal }) => getGamificationSummary(signal),
  })
  const companionQuery = useQuery({
    queryKey: ["companion"],
    queryFn: ({ signal }) => getCompanion(signal),
  })
  const milestonesQuery = useQuery({
    queryKey: ["gamification", "milestones"],
    queryFn: ({ signal }) => getMilestones(signal),
  })

  const goals = React.useMemo(
    () => goalsQuery.data?.goals.map(goalToVisionGoal) ?? [],
    [goalsQuery.data]
  )

  React.useEffect(() => {
    if (!focusedGoalId && goals[0]) {
      setFocusedGoalId(goals[0].goal_id)
    }
    if (focusedGoalId && goals.length > 0 && !goals.some((goal) => goal.goal_id === focusedGoalId)) {
      setFocusedGoalId(goals[0].goal_id)
    }
  }, [focusedGoalId, goals])

  const focusedGoal = goals.find((g) => g.goal_id === focusedGoalId) ?? goals[0]

  const depositMutation = useMutation({
    mutationFn: (data: { amount: number; note: string }) => {
      if (!focusedGoal) {
        throw new Error("Crea una meta antes de registrar depósitos")
      }

      return logDeposit({
        goal_id: focusedGoal.goal_id,
        amount: data.amount,
        currency: focusedGoal.currency,
        note: data.note || undefined,
      })
    },
    onSuccess: async (deposit) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["goals"] }),
        queryClient.invalidateQueries({ queryKey: ["gamification"] }),
        queryClient.invalidateQueries({ queryKey: ["companion"] }),
      ])
      addToast({
        message: `+${deposit.xp_earned} XP registrado desde el BFF`,
        type: "success",
      })
      setCelebrationId((id) => id + 1)
    },
  })

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0)
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0
  const companion = companionQuery.data
  const summary = summaryQuery.data
  const milestones = milestonesQuery.data?.milestones ?? []
  const nextMilestone = milestones.find((milestone) => !milestone.unlocked)

  const dashboardState = selectDashboardState({
    goalsQuery,
    summaryQuery,
    companionQuery,
    milestonesQuery,
  })
  const error = goalsQuery.error ?? summaryQuery.error ?? companionQuery.error ?? milestonesQuery.error

  const handleImpulseSwap = (amount: number, category: string) => {
    setDepositDefaults({
      amount,
      note: `Evité gasto: ${category}`,
    })
    setDepositOpen(true)
  }

  const handleDepositSubmit = async (data: { amount: number; note: string }) => {
    await depositMutation.mutateAsync(data)
  }

  const daysUntilDeadline = focusedGoal
    ? Math.ceil((new Date(goalsQuery.data?.goals.find((goal) => goal.goal_id === focusedGoal.goal_id)?.deadline ?? "").getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  if (dashboardState === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base to-surface flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl border-2 border-destructive p-6 max-w-md shadow-lg space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">No se pudo cargar Florecer</h1>
            <p className="text-sm text-muted-foreground mt-2">
              El BFF no respondió o rechazó la solicitud. No hay datos mock en esta pantalla.
            </p>
          </div>
          <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
          <Button
            variant="pop"
            className="w-full"
            onClick={() => {
              goalsQuery.refetch()
              summaryQuery.refetch()
              companionQuery.refetch()
              milestonesQuery.refetch()
            }}
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (dashboardState === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base to-surface flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl border-2 border-border p-6 text-center shadow-lg">
          <p className="text-lg font-semibold text-foreground">Cargando datos del BFF...</p>
          <p className="text-sm text-muted-foreground mt-2">No se mostrará información de ejemplo.</p>
        </div>
      </div>
    )
  }

  if (dashboardState === "empty") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base to-surface flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl border-2 border-border p-6 max-w-md shadow-lg space-y-4 text-center">
          <h1 className="text-xl font-bold text-foreground">Aún no tienes metas</h1>
          <p className="text-sm text-muted-foreground">
            Crea una meta para empezar a registrar depósitos reales en el BFF.
          </p>
          <Button variant="pop" className="w-full" onClick={() => { window.location.href = "/goals/new" }}>
            Crear meta
          </Button>
        </div>
      </div>
    )
  }

  if (!focusedGoal || !companion || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base to-surface flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl border-2 border-destructive p-6 max-w-md shadow-lg space-y-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">No se pudo cargar Florecer</h1>
            <p className="text-sm text-muted-foreground mt-2">
              El BFF respondió con datos incompletos. No hay datos mock en esta pantalla.
            </p>
          </div>
          <Button
            variant="pop"
            className="w-full"
            onClick={() => {
              goalsQuery.refetch()
              summaryQuery.refetch()
              companionQuery.refetch()
              milestonesQuery.refetch()
            }}
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

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
            {totalSaved.toLocaleString()} / {totalTarget.toLocaleString()} MXN en {goals.length} metas
          </p>
        </div>

        {/* Vision Grid — All Your Futures */}
        <VisionGrid
          goals={goals}
          focusedGoalId={focusedGoal.goal_id}
          onFocus={setFocusedGoalId}
        />

        {/* Focused Goal — Big Vision Board */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <PixelArtSprite
                src={getGoalIconUrlByName(focusedGoal.name)}
                alt={focusedGoal.name}
                size="sm"
              />
              Enfoque actual
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

        <div className="bg-surface rounded-2xl border-2 border-border p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">XP y desbloqueos</h3>
              <p className="text-sm text-muted-foreground">
                {summary.milestones_unlocked}/{summary.milestones_total} hitos desbloqueados
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{summary.total_xp}</p>
              <p className="text-xs text-muted-foreground">XP total</p>
            </div>
          </div>
          <MilestoneTrack
            currentXP={summary.total_xp}
            milestones={milestones}
            nextMilestone={nextMilestone}
          />
        </div>

        {/* Impulse Swap — Targeted to Focused Goal */}
        <div className="bg-surface rounded-2xl border-2 border-border p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <PixelArtSprite
              src={getGoalIconUrlByName(focusedGoal.name)}
              alt={focusedGoal.name}
              size="sm"
            />
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
          mood={companion.current_mood}
          streak={companion.streak}
          hoursUntilBreak={companion.hours_until_streak_break}
          pixelArtSrc={`/assets/pixelart/companion_${companion.mood_state}.png`}
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
      {celebrationId > 0 && (
        <CelebrationBurst key={celebrationId} onComplete={() => setCelebrationId(0)} />
      )}
    </div>
  )
}

export { DashboardPage, selectDashboardState }
