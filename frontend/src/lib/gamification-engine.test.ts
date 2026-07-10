/**
 * Florecer Gamification Engine — Comprehensive Tests
 *
 * Tests every pure function in the engine for correctness,
 * edge cases, and positive-only celebration logic.
 */

import { describe, it, expect } from "vitest"
import {
  computeGlobalProgress,
  getTierForProgress,
  getStreakMultiplier,
  computeEffectiveProgress,
  getProgressWithinTier,
  computeUnlockedItems,
  computeNextUnlock,
  generateCelebrations,
  computeGamificationState,
  TIERS,
  COSMETIC_CATALOG,
} from "./gamification-engine"
import type { Goal, GamificationInput } from "./gamification-engine"

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    goal_id: "g1",
    target_amount: 1000,
    current_amount: 0,
    progress_percent: 0,
    ...overrides,
  }
}

function makeInput(overrides: Partial<GamificationInput> = {}): GamificationInput {
  return {
    goals: [],
    transactions: [],
    currentStreak: 0,
    previouslyUnlockedIds: [],
    previousTierIndex: 0,
    previousStreak: 0,
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────
// computeGlobalProgress
// ─────────────────────────────────────────────────────────────

describe("computeGlobalProgress", () => {
  it("returns 0 for empty goals", () => {
    expect(computeGlobalProgress([])).toBe(0)
  })

  it("returns 0 when total target is 0", () => {
    expect(computeGlobalProgress([makeGoal({ target_amount: 0, progress_percent: 50 })])).toBe(0)
  })

  it("computes simple average for equal targets", () => {
    const goals = [
      makeGoal({ target_amount: 100, progress_percent: 50 }),
      makeGoal({ target_amount: 100, progress_percent: 100 }),
    ]
    expect(computeGlobalProgress(goals)).toBe(75)
  })

  it("weights by target_amount", () => {
    const goals = [
      makeGoal({ target_amount: 900, progress_percent: 100 }),
      makeGoal({ target_amount: 100, progress_percent: 0 }),
    ]
    expect(computeGlobalProgress(goals)).toBe(90)
  })

  it("caps at 100 even if weighted average exceeds", () => {
    const goals = [makeGoal({ target_amount: 100, progress_percent: 150 })]
    expect(computeGlobalProgress(goals)).toBe(100)
  })

  it("floors at 0", () => {
    const goals = [makeGoal({ target_amount: 100, progress_percent: -20 })]
    expect(computeGlobalProgress(goals)).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// getTierForProgress
// ─────────────────────────────────────────────────────────────

describe("getTierForProgress", () => {
  it("returns Semilla for 0%", () => {
    const tier = getTierForProgress(0)
    expect(tier.index).toBe(0)
    expect(tier.name).toBe("semilla")
  })

  it("returns Semilla for 24.9%", () => {
    expect(getTierForProgress(24.9).index).toBe(0)
  })

  it("returns Brote for 25%", () => {
    const tier = getTierForProgress(25)
    expect(tier.index).toBe(1)
    expect(tier.unlocksCategory).toBe("hat")
  })

  it("returns Planta for 50%", () => {
    expect(getTierForProgress(50).index).toBe(2)
  })

  it("returns Flor for 75%", () => {
    expect(getTierForProgress(75).index).toBe(3)
  })

  it("returns Jardin for 100%", () => {
    const tier = getTierForProgress(100)
    expect(tier.index).toBe(4)
    expect(tier.unlocksCategory).toBe("shoes")
  })

  it("returns Jardin for >100%", () => {
    expect(getTierForProgress(250).index).toBe(4)
  })
})

// ─────────────────────────────────────────────────────────────
// getStreakMultiplier
// ─────────────────────────────────────────────────────────────

describe("getStreakMultiplier", () => {
  it.each([
    [0, 1.0],
    [1, 1.2],
    [2, 1.2],
    [3, 1.5],
    [5, 1.5],
    [6, 2.0],
    [9, 2.0],
    [10, 2.5],
    [30, 2.5],
  ])("streak %i => multiplier %f", (streak, expected) => {
    expect(getStreakMultiplier(streak)).toBe(expected)
  })
})

// ─────────────────────────────────────────────────────────────
// computeEffectiveProgress
// ─────────────────────────────────────────────────────────────

describe("computeEffectiveProgress", () => {
  it("returns same progress with 1.0x multiplier", () => {
    expect(computeEffectiveProgress(40, 1.0)).toBe(40)
  })

  it("multiplies progress by streak", () => {
    expect(computeEffectiveProgress(20, 2.0)).toBe(40)
  })

  it("caps at 100% effective progress", () => {
    expect(computeEffectiveProgress(60, 2.5)).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// getProgressWithinTier
// ─────────────────────────────────────────────────────────────

describe("getProgressWithinTier", () => {
  const brote = TIERS[1]

  it("returns 0 at tier start", () => {
    expect(getProgressWithinTier(25, brote)).toBe(0)
  })

  it("returns 50 at midpoint", () => {
    expect(getProgressWithinTier(37.5, brote)).toBe(50)
  })

  it("returns 100 at tier end", () => {
    expect(getProgressWithinTier(50, brote)).toBe(100)
  })

  it("returns 100 beyond tier", () => {
    expect(getProgressWithinTier(80, brote)).toBe(100)
  })

  it("returns 0 below tier", () => {
    expect(getProgressWithinTier(10, brote)).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// computeUnlockedItems
// ─────────────────────────────────────────────────────────────

describe("computeUnlockedItems", () => {
  it("unlocks base items at 0%", () => {
    const items = computeUnlockedItems(0)
    const ids = items.map((i) => i.id)
    expect(ids).toContain("base_hair")
    expect(ids).toContain("base_dress")
  })

  it("unlocks tier 1 items at 25%+", () => {
    const items = computeUnlockedItems(25)
    const ids = items.map((i) => i.id)
    expect(ids).toContain("hat_sun")
  })

  it("unlocks tier 1 second item only at 37.5% (midpoint)", () => {
    const at25 = computeUnlockedItems(25).map((i) => i.id)
    const at37 = computeUnlockedItems(37.5).map((i) => i.id)
    expect(at25).not.toContain("hat_leaf")
    expect(at37).toContain("hat_leaf")
  })

  it("unlocks tier 4 items only at 100%+", () => {
    const at99 = computeUnlockedItems(99).map((i) => i.id)
    const at100 = computeUnlockedItems(100).map((i) => i.id)
    expect(at99).not.toContain("shoes_boots")
    expect(at100).toContain("shoes_boots")
  })

  it("unlocks all items at 125% effective progress", () => {
    const items = computeUnlockedItems(125)
    expect(items.length).toBe(COSMETIC_CATALOG.length)
  })
})

// ─────────────────────────────────────────────────────────────
// computeNextUnlock
// ─────────────────────────────────────────────────────────────

describe("computeNextUnlock", () => {
  it("returns null when everything is unlocked", () => {
    expect(computeNextUnlock(200)).toBeNull()
  })

  it("points to first tier 1 item at 0%", () => {
    const next = computeNextUnlock(0)
    expect(next).not.toBeNull()
    expect(next!.item.id).toBe("hat_sun")
    expect(next!.requiredEffectiveProgress).toBe(25)
  })

  it("points to second tier 1 item after unlocking first", () => {
    const next = computeNextUnlock(30)
    expect(next!.item.id).toBe("hat_leaf")
    expect(next!.progressTowardNext).toBeGreaterThan(0)
    expect(next!.progressTowardNext).toBeLessThanOrEqual(1)
  })

  it("calculates progressTowardNext correctly", () => {
    // At 40% effective, next unlock is dress_spring at 50%
    const next = computeNextUnlock(40)
    expect(next!.item.id).toBe("dress_spring")
    expect(next!.progressTowardNext).toBe(40 / 50)
  })
})

// ─────────────────────────────────────────────────────────────
// generateCelebrations
// ─────────────────────────────────────────────────────────────

describe("generateCelebrations", () => {
  it("detects tier upgrade", () => {
    const celebrations = generateCelebrations(
      makeInput({ previousTierIndex: 0, currentStreak: 1 }),
      TIERS[1],
      []
    )
    const tierCelebration = celebrations.find((c) => c.type === "TIER_UPGRADE")
    expect(tierCelebration).toBeDefined()
    expect(tierCelebration!.message).toContain("🌿")
  })

  it("does NOT detect tier upgrade when same tier", () => {
    const celebrations = generateCelebrations(
      makeInput({ previousTierIndex: 2 }),
      TIERS[2],
      []
    )
    expect(celebrations.find((c) => c.type === "TIER_UPGRADE")).toBeUndefined()
  })

  it("detects streak milestone crossing", () => {
    const celebrations = generateCelebrations(
      makeInput({ currentStreak: 7, previousStreak: 6 }),
      TIERS[0],
      []
    )
    const streakCel = celebrations.find((c) => c.type === "STREAK_MILESTONE")
    expect(streakCel).toBeDefined()
    expect(streakCel!.meta.milestone).toBe(7)
  })

  it("does NOT detect streak milestone if already passed", () => {
    const celebrations = generateCelebrations(
      makeInput({ currentStreak: 8, previousStreak: 7 }),
      TIERS[0],
      []
    )
    expect(celebrations.find((c) => c.type === "STREAK_MILESTONE")).toBeUndefined()
  })

  it("detects goal completion", () => {
    const celebrations = generateCelebrations(
      makeInput({
        goals: [makeGoal({ progress_percent: 100 })],
      }),
      TIERS[4],
      []
    )
    expect(celebrations.find((c) => c.type === "GOAL_COMPLETION")).toBeDefined()
  })

  it("does NOT celebrate goal completion below 100%", () => {
    const celebrations = generateCelebrations(
      makeInput({
        goals: [makeGoal({ progress_percent: 99 })],
      }),
      TIERS[3],
      []
    )
    expect(celebrations.find((c) => c.type === "GOAL_COMPLETION")).toBeUndefined()
  })

  it("detects newly unlocked items", () => {
    const celebrations = generateCelebrations(
      makeInput({
        previouslyUnlockedIds: ["base_hair", "base_dress"],
      }),
      TIERS[1],
      [
        { id: "hat_sun", name: "Sombrero", category: "hat", emoji: "🌞", unlockedAtTier: 1, unlockedAtPercent: 25 },
      ]
    )
    const itemCel = celebrations.find((c) => c.type === "ITEM_UNLOCK")
    expect(itemCel).toBeDefined()
    expect(itemCel!.meta.itemId).toBe("hat_sun")
  })

  it("celebration messages are positive (no guilt)", () => {
    const celebrations = generateCelebrations(
      makeInput({ previousTierIndex: 0, currentStreak: 3 }),
      TIERS[1],
      []
    )
    for (const c of celebrations) {
      expect(c.message).not.toMatch(/perdiste|fallaste|deberías|culpa|triste|abandona|olvida/i)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// computeGamificationState — integration
// ─────────────────────────────────────────────────────────────

describe("computeGamificationState", () => {
  it("returns correct shape for empty input", () => {
    const state = computeGamificationState(makeInput())
    expect(state).toHaveProperty("currentTier")
    expect(state).toHaveProperty("globalProgressPercent")
    expect(state).toHaveProperty("unlockedItems")
    expect(state).toHaveProperty("nextUnlock")
    expect(state).toHaveProperty("streakMultiplier")
    expect(state).toHaveProperty("pendingCelebrations")
  })

  it("streak multiplier accelerates unlocks", () => {
    const noStreak = computeGamificationState(
      makeInput({
        goals: [makeGoal({ target_amount: 100, progress_percent: 20 })],
        currentStreak: 0,
      })
    )
    const highStreak = computeGamificationState(
      makeInput({
        goals: [makeGoal({ target_amount: 100, progress_percent: 20 })],
        currentStreak: 10,
      })
    )
    // 20% * 2.5 = 50% effective -> should unlock tier 2 items
    expect(noStreak.unlockedItems.length).toBeLessThan(highStreak.unlockedItems.length)
    expect(highStreak.streakMultiplier).toBe(2.5)
  })

  it("unlocks tier 2 dress at 50%", () => {
    const state = computeGamificationState(
      makeInput({
        goals: [makeGoal({ target_amount: 100, progress_percent: 50 })],
      })
    )
    const ids = state.unlockedItems.map((i) => i.id)
    expect(ids).toContain("dress_spring")
    expect(state.currentTier.index).toBe(2)
  })

  it("nextUnlock points to the right item", () => {
    const state = computeGamificationState(
      makeInput({
        goals: [makeGoal({ target_amount: 100, progress_percent: 10 })],
      })
    )
    expect(state.nextUnlock).not.toBeNull()
    expect(state.nextUnlock!.item.tierRequirement).toBeGreaterThanOrEqual(0)
  })

  it("fires tier upgrade celebration when crossing threshold", () => {
    const state = computeGamificationState(
      makeInput({
        goals: [makeGoal({ target_amount: 100, progress_percent: 50 })],
        previousTierIndex: 1,
      })
    )
    expect(state.pendingCelebrations.some((c) => c.type === "TIER_UPGRADE")).toBe(true)
  })

  it("fires multiple celebrations on big achievement", () => {
    const state = computeGamificationState(
      makeInput({
        goals: [makeGoal({ target_amount: 100, progress_percent: 100 })],
        currentStreak: 7,
        previousStreak: 6,
        previousTierIndex: 3,
      })
    )
    const types = state.pendingCelebrations.map((c) => c.type)
    expect(types).toContain("TIER_UPGRADE")
    expect(types).toContain("STREAK_MILESTONE")
    expect(types).toContain("GOAL_COMPLETION")
  })

  it("global progress is weighted correctly in full state", () => {
    const state = computeGamificationState(
      makeInput({
        goals: [
          makeGoal({ target_amount: 900, progress_percent: 100 }),
          makeGoal({ target_amount: 100, progress_percent: 0 }),
        ],
      })
    )
    expect(state.globalProgressPercent).toBe(90)
    expect(state.currentTier.index).toBe(3) // Flor tier (75-100)
  })
})
