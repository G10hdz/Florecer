/**
 * Florecer Gamification Engine
 *
 * Pure functions that compute gamification state from financial inputs.
 * No side effects. No mutation. Fully deterministic.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface Goal {
  goal_id: string
  target_amount: number
  current_amount: number
  progress_percent: number
}

export interface Transaction {
  id: string
  amount: number
  created_at: string // ISO date
}

export type CosmeticCategory = "hat" | "dress" | "accessory" | "shoes"

export interface CosmeticItem {
  id: string
  name: string
  category: CosmeticCategory
  emoji: string
  tierRequirement: number // 0-4
  unlockPercentWithinTier: number // 0-100, relative to tier bounds
}

export interface TierInfo {
  index: number
  name: string
  label: string
  emoji: string
  minPercent: number
  maxPercent: number
  unlocksCategory: CosmeticCategory | null
  color: string
}

export interface UnlockedItem {
  id: string
  name: string
  category: CosmeticCategory
  emoji: string
  unlockedAtTier: number
  unlockedAtPercent: number
}

export interface NextUnlock {
  item: CosmeticItem
  currentEffectiveProgress: number
  requiredEffectiveProgress: number
  progressTowardNext: number // 0-1
}

export type CelebrationType = "TIER_UPGRADE" | "STREAK_MILESTONE" | "GOAL_COMPLETION" | "ITEM_UNLOCK"

export interface CelebrationEvent {
  type: CelebrationType
  message: string
  meta: Record<string, unknown>
}

export interface GamificationInput {
  goals: Goal[]
  transactions: Transaction[]
  currentStreak: number
  previouslyUnlockedIds: string[]
  previousTierIndex: number
  previousStreak: number
}

export interface GamificationOutput {
  currentTier: TierInfo
  globalProgressPercent: number
  unlockedItems: UnlockedItem[]
  nextUnlock: NextUnlock | null
  streakMultiplier: number
  pendingCelebrations: CelebrationEvent[]
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

export const TIERS: TierInfo[] = [
  {
    index: 0,
    name: "semilla",
    label: "Semilla",
    emoji: "🌱",
    minPercent: 0,
    maxPercent: 25,
    unlocksCategory: null,
    color: "#8B9A6B",
  },
  {
    index: 1,
    name: "brote",
    label: "Brote",
    emoji: "🌿",
    minPercent: 25,
    maxPercent: 50,
    unlocksCategory: "hat",
    color: "#6B9A7A",
  },
  {
    index: 2,
    name: "planta",
    label: "Planta",
    emoji: "🪴",
    minPercent: 50,
    maxPercent: 75,
    unlocksCategory: "dress",
    color: "#7A9A6B",
  },
  {
    index: 3,
    name: "flor",
    label: "Flor",
    emoji: "🌸",
    minPercent: 75,
    maxPercent: 100,
    unlocksCategory: "accessory",
    color: "#D4A5A5",
  },
  {
    index: 4,
    name: "jardin",
    label: "Jardín",
    emoji: "🏵️",
    minPercent: 100,
    maxPercent: Infinity,
    unlocksCategory: "shoes",
    color: "#C9A96E",
  },
]

export const COSMETIC_CATALOG: CosmeticItem[] = [
  // Tier 0 — base items (always available)
  { id: "base_hair", name: "Cabello base", category: "hat", emoji: "✨", tierRequirement: 0, unlockPercentWithinTier: 0 },
  { id: "base_dress", name: "Vestido base", category: "dress", emoji: "👚", tierRequirement: 0, unlockPercentWithinTier: 0 },

  // Tier 1 — hats (25-50%)
  { id: "hat_sun", name: "Sombrero de sol", category: "hat", emoji: "🌞", tierRequirement: 1, unlockPercentWithinTier: 0 },
  { id: "hat_leaf", name: "Corona de hojas", category: "hat", emoji: "🍃", tierRequirement: 1, unlockPercentWithinTier: 50 },

  // Tier 2 — dresses (50-75%)
  { id: "dress_spring", name: "Vestido primavera", category: "dress", emoji: "👗", tierRequirement: 2, unlockPercentWithinTier: 0 },
  { id: "dress_autumn", name: "Vestido otoño", category: "dress", emoji: "🍂", tierRequirement: 2, unlockPercentWithinTier: 50 },

  // Tier 3 — accessories (75-100%)
  { id: "acc_bee", name: "Abeja amiga", category: "accessory", emoji: "🐝", tierRequirement: 3, unlockPercentWithinTier: 0 },
  { id: "acc_flower", name: "Ramo de flores", category: "accessory", emoji: "💐", tierRequirement: 3, unlockPercentWithinTier: 50 },

  // Tier 4 — shoes (100%+)
  { id: "shoes_boots", name: "Botas de jardín", category: "shoes", emoji: "🥾", tierRequirement: 4, unlockPercentWithinTier: 0 },
  { id: "shoes_wings", name: "Alitas de mariposa", category: "shoes", emoji: "🦋", tierRequirement: 4, unlockPercentWithinTier: 50 },
]

export const STREAK_MULTIPLIERS: { threshold: number; multiplier: number; label: string }[] = [
  { threshold: 0, multiplier: 1.0, label: "Base" },
  { threshold: 1, multiplier: 1.2, label: "Buen inicio" },
  { threshold: 3, multiplier: 1.5, label: "Constancia" },
  { threshold: 6, multiplier: 2.0, label: "Impulso" },
  { threshold: 10, multiplier: 2.5, label: "Legendario" },
]

export const STREAK_MILESTONES = [3, 7, 14, 30]

// ─────────────────────────────────────────────────────────────
// Pure helper functions
// ─────────────────────────────────────────────────────────────

/**
 * Compute weighted global progress from goals.
 * Weighted by target_amount so larger goals count more.
 */
export function computeGlobalProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0)
  if (totalTarget === 0) return 0
  const weightedProgress = goals.reduce(
    (sum, g) => sum + g.progress_percent * g.target_amount,
    0
  )
  return Math.min(100, Math.max(0, weightedProgress / totalTarget))
}

/**
 * Find the current tier based on global progress percent.
 */
export function getTierForProgress(progressPercent: number): TierInfo {
  const tier = TIERS.find(
    (t) => progressPercent >= t.minPercent && progressPercent < t.maxPercent
  )
  if (tier) return tier
  // If exactly 100 or above, return top tier
  if (progressPercent >= 100) return TIERS[TIERS.length - 1]
  return TIERS[0]
}

/**
 * Get streak multiplier based on consecutive days with transactions.
 */
export function getStreakMultiplier(streak: number): number {
  // Find the highest threshold that is <= current streak
  const applicable = [...STREAK_MULTIPLIERS]
    .reverse()
    .find((s) => streak >= s.threshold)
  return applicable?.multiplier ?? 1.0
}

/**
 * Compute effective unlock progress.
 * Streak accelerates unlock speed by multiplying progress.
 * Capped at the top-tier ceiling to avoid infinite unlocks.
 */
export function computeEffectiveProgress(
  progressPercent: number,
  streakMultiplier: number
): number {
  const effective = progressPercent * streakMultiplier
  // Cap at 100 because tiers are percentage-based; Infinity in top tier means no upper bound
  return Math.min(effective, 100)
}

/**
 * Calculate progress within a specific tier bounds.
 * Returns 0-100 representing how far through the tier.
 */
export function getProgressWithinTier(
  progressPercent: number,
  tier: TierInfo
): number {
  if (progressPercent <= tier.minPercent) return 0
  if (progressPercent >= tier.maxPercent && tier.maxPercent !== Infinity) return 100
  const range = tier.maxPercent - tier.minPercent
  if (range === 0 || range === Infinity) return 100
  return ((progressPercent - tier.minPercent) / range) * 100
}

/**
 * Determine which items from the catalog are unlocked given effective progress.
 */
export function computeUnlockedItems(
  effectiveProgress: number,
  catalog: CosmeticItem[] = COSMETIC_CATALOG
): UnlockedItem[] {
  return catalog
    .filter((item) => {
      // Base tier items always unlocked
      if (item.tierRequirement === 0) return true
      const tier = TIERS[item.tierRequirement]
      if (!tier) return false
      // Must have reached this tier
      if (effectiveProgress < tier.minPercent) return false
      // Must have progressed enough within the tier (or beyond)
      const tierProgress = getProgressWithinTier(effectiveProgress, tier)
      return tierProgress >= item.unlockPercentWithinTier
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      emoji: item.emoji,
      unlockedAtTier: item.tierRequirement,
      unlockedAtPercent: effectiveProgress,
    }))
}

/**
 * Find the next item that will be unlocked.
 */
export function computeNextUnlock(
  effectiveProgress: number,
  catalog: CosmeticItem[] = COSMETIC_CATALOG
): NextUnlock | null {
  const lockedItems = catalog.filter((item) => {
    const tier = TIERS[item.tierRequirement]
    if (!tier) return false
    if (effectiveProgress < tier.minPercent) return true
    const tierProgress = getProgressWithinTier(effectiveProgress, tier)
    return tierProgress < item.unlockPercentWithinTier
  })

  if (lockedItems.length === 0) return null

  // Sort by tier first, then by unlockPercentWithinTier
  const sorted = [...lockedItems].sort((a, b) => {
    if (a.tierRequirement !== b.tierRequirement) {
      return a.tierRequirement - b.tierRequirement
    }
    return a.unlockPercentWithinTier - b.unlockPercentWithinTier
  })

  const next = sorted[0]
  const tier = TIERS[next.tierRequirement]
  const tierRange = tier.maxPercent - tier.minPercent
  const requiredEffectiveProgress =
    tier.minPercent + (next.unlockPercentWithinTier / 100) * tierRange

  const progressTowardNext =
    effectiveProgress >= requiredEffectiveProgress
      ? 1
      : Math.max(0, effectiveProgress / requiredEffectiveProgress)

  return {
    item: next,
    currentEffectiveProgress: effectiveProgress,
    requiredEffectiveProgress,
    progressTowardNext,
  }
}

// ─────────────────────────────────────────────────────────────
// Celebration generation (positive-only)
// ─────────────────────────────────────────────────────────────

const COMPANION_MESSAGES: Record<CelebrationType, string[]> = {
  TIER_UPGRADE: [
    "¡Tu jardín financiero está creciendo! 🌱",
    "¡Cada paso cuenta, y el tuyo es enorme! 🌿",
    "¡Estás floreciendo en grande! 🌸",
    "¡Un nuevo nivel de belleza desbloqueado! ✨",
  ],
  STREAK_MILESTONE: [
    "¡Tu constancia es inspiradora! 🔥",
    "¡Día tras día, construyendo tu futuro! 🌞",
    "¡Esa racha es pura magia! ✨",
    "¡Imparable! Tu dedicación brilla. 🌟",
  ],
  GOAL_COMPLETION: [
    "¡Meta completada! Celebramos juntas. 🎉",
    "¡Lo lograste! Tu esfuerzo dio frutos. 🍎",
    "¡Un sueño hecho realidad! Sigue así. 🌈",
  ],
  ITEM_UNLOCK: [
    "¡Nuevo look desbloqueado! Te quedará hermoso. ✨",
    "¡Una nueva pieza para tu colección! 🎁",
    "¡Tu estilo sigue creciendo! 👗",
  ],
}

function pickMessage(type: CelebrationType, seed: number): string {
  const messages = COMPANION_MESSAGES[type]
  return messages[seed % messages.length]
}

/**
 * Detect celebrations by comparing current state with previous state.
 */
export function generateCelebrations(
  input: GamificationInput,
  currentTier: TierInfo,
  unlockedItems: UnlockedItem[]
): CelebrationEvent[] {
  const celebrations: CelebrationEvent[] = []
  const now = new Date().toISOString()

  // 1. Tier upgrade
  if (currentTier.index > input.previousTierIndex) {
    celebrations.push({
      type: "TIER_UPGRADE",
      message: pickMessage("TIER_UPGRADE", currentTier.index),
      meta: {
        previousTier: input.previousTierIndex,
        newTier: currentTier.index,
        tierName: currentTier.name,
        timestamp: now,
      },
    })
  }

  // 2. Streak milestones
  const hitStreakMilestone = STREAK_MILESTONES.find(
    (m) => input.currentStreak >= m && input.previousStreak < m
  )
  if (hitStreakMilestone) {
    celebrations.push({
      type: "STREAK_MILESTONE",
      message: pickMessage("STREAK_MILESTONE", hitStreakMilestone),
      meta: {
        streak: input.currentStreak,
        milestone: hitStreakMilestone,
        timestamp: now,
      },
    })
  }

  // 3. Goal completions (any goal that reached 100% now)
  const completedGoals = input.goals.filter((g) => g.progress_percent >= 100)
  if (completedGoals.length > 0) {
    celebrations.push({
      type: "GOAL_COMPLETION",
      message: pickMessage("GOAL_COMPLETION", completedGoals.length),
      meta: {
        completedGoals: completedGoals.map((g) => g.goal_id),
        timestamp: now,
      },
    })
  }

  // 4. New item unlocks
  const newlyUnlocked = unlockedItems.filter(
    (item) => !input.previouslyUnlockedIds.includes(item.id)
  )
  for (const item of newlyUnlocked) {
    celebrations.push({
      type: "ITEM_UNLOCK",
      message: pickMessage("ITEM_UNLOCK", item.id.length + item.unlockedAtTier),
      meta: {
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        timestamp: now,
      },
    })
  }

  return celebrations
}

// ─────────────────────────────────────────────────────────────
// Main engine function
// ─────────────────────────────────────────────────────────────

/**
 * Compute complete gamification state from inputs.
 * Pure function — no side effects, no mutation.
 */
export function computeGamificationState(
  input: GamificationInput
): GamificationOutput {
  const globalProgress = computeGlobalProgress(input.goals)
  const streakMultiplier = getStreakMultiplier(input.currentStreak)
  const effectiveProgress = computeEffectiveProgress(globalProgress, streakMultiplier)
  const currentTier = getTierForProgress(globalProgress)
  const unlockedItems = computeUnlockedItems(effectiveProgress)
  const nextUnlock = computeNextUnlock(effectiveProgress)
  const pendingCelebrations = generateCelebrations(input, currentTier, unlockedItems)

  return {
    currentTier,
    globalProgressPercent: Math.round(globalProgress * 100) / 100,
    unlockedItems,
    nextUnlock,
    streakMultiplier,
    pendingCelebrations,
  }
}
