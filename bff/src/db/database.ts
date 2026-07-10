import { randomUUID } from "node:crypto"
import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { DatabaseSync } from "node:sqlite"

import {
  computeGamificationState,
  computeGlobalProgress,
  getStreakMultiplier,
  type Goal as EngineGoal,
  type Transaction as EngineTransaction,
} from "../lib/gamification-engine.js"
import type {
  CompanionState,
  DepositPayload,
  DepositResponse,
  FireflySetPatResponse,
  FireflyStatus,
  GamificationSummary,
  Goal,
  GoalCreatePayload,
  Milestone,
  MilestoneListResponse,
  MoodHistoryResponse,
  Transaction,
  TransactionListResponse,
  UnlockedCosmetic,
  User,
} from "../types/api.js"
import { HttpError } from "../http-error.js"
import { runMigrations } from "./migrate.js"

interface UserRow {
  id: string
  email: string
  password_hash: string
  firefly_pat_encrypted: string
  companion_mood: number
  created_at: string
  updated_at: string
}

interface GoalRow {
  goal_id: string
  user_id: string
  firefly_piggy_bank_id: number
  name: string
  target_amount: number
  current_amount: number
  currency: string
  deadline: string
  xp_total: number
  created_at: string
  updated_at: string
}

interface DepositRow {
  id: string
  user_id: string
  goal_id: string
  firefly_transaction_id: number
  amount: number
  currency: string
  xp_earned: number
  streak_at_deposit: number
  mood_change: number
  created_at: string
}

const MILESTONES: Milestone[] = [
  { sequence: 1, xp_threshold: 25, cosmetic_id: "base_hair", emoji: "✨" },
  { sequence: 2, xp_threshold: 50, cosmetic_id: "hat_sun", emoji: "🌞" },
  { sequence: 3, xp_threshold: 100, cosmetic_id: "hat_leaf", emoji: "🍃" },
  { sequence: 4, xp_threshold: 175, cosmetic_id: "dress_spring", emoji: "👗" },
  { sequence: 5, xp_threshold: 300, cosmetic_id: "acc_flower", emoji: "💐" },
]

export class FlorecerDb {
  private db: DatabaseSync

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true })
    this.db = new DatabaseSync(dbPath)
    runMigrations(this.db)
  }

  close(): void {
    this.db.close()
  }

  createUser(email: string, passwordHash: string): User {
    const now = new Date().toISOString()
    const user: UserRow = {
      id: randomUUID(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      firefly_pat_encrypted: "",
      companion_mood: 50,
      created_at: now,
      updated_at: now,
    }

    try {
      this.db
        .prepare(
          `INSERT INTO users (
            id, email, password_hash, firefly_pat_encrypted, companion_mood, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          user.id,
          user.email,
          user.password_hash,
          user.firefly_pat_encrypted,
          user.companion_mood,
          user.created_at,
          user.updated_at
        )
    } catch {
      throw new HttpError(409, "EMAIL_EXISTS", "A user with this email already exists")
    }

    return toUser(user)
  }

  getUserByEmail(email: string): (User & { password_hash: string }) | null {
    const row = this.db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase()) as UserRow | undefined
    if (!row) return null
    return { ...toUser(row), password_hash: row.password_hash }
  }

  getUser(userId: string): User {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as UserRow | undefined
    if (!row) throw new HttpError(401, "UNAUTHORIZED", "User not found")
    return toUser(row)
  }

  setFireflyPat(userId: string, pat: string): FireflySetPatResponse {
    const now = new Date().toISOString()
    this.db
      .prepare(
        `INSERT INTO settings (user_id, key, value, updated_at)
         VALUES (?, 'firefly_pat', ?, ?)
         ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .run(userId, pat, now)
    this.db
      .prepare("UPDATE users SET firefly_pat_encrypted = ?, updated_at = ? WHERE id = ?")
      .run(maskPat(pat), now, userId)

    return {
      connected: true,
      firefly_user: "stub-user",
      piggy_banks_count: 0,
      stub: true,
    }
  }

  getFireflyStatus(userId: string): FireflyStatus {
    const row = this.db
      .prepare("SELECT value, updated_at FROM settings WHERE user_id = ? AND key = 'firefly_pat'")
      .get(userId) as { value: string; updated_at: string } | undefined
    if (!row?.value) return { connected: false, stub: true }
    return {
      connected: true,
      firefly_version: "stub",
      last_sync: row.updated_at,
      stub: true,
    }
  }

  createGoal(userId: string, payload: GoalCreatePayload): Goal {
    validateGoalPayload(payload)
    const now = new Date().toISOString()
    const row: GoalRow = {
      goal_id: randomUUID(),
      user_id: userId,
      firefly_piggy_bank_id: 0,
      name: payload.name.trim(),
      target_amount: payload.target_amount,
      current_amount: 0,
      currency: payload.currency.toUpperCase(),
      deadline: payload.deadline,
      xp_total: 0,
      created_at: now,
      updated_at: now,
    }
    this.db
      .prepare(
        `INSERT INTO goals (
          goal_id, user_id, firefly_piggy_bank_id, name, target_amount, current_amount,
          currency, deadline, xp_total, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        row.goal_id,
        row.user_id,
        row.firefly_piggy_bank_id,
        row.name,
        row.target_amount,
        row.current_amount,
        row.currency,
        row.deadline,
        row.xp_total,
        row.created_at,
        row.updated_at
      )
    return toGoal(row)
  }

  listGoals(userId: string): Goal[] {
    const rows = this.db
      .prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as unknown as GoalRow[]
    return rows.map(toGoal)
  }

  getGoal(userId: string, goalId: string): Goal {
    const row = this.db
      .prepare("SELECT * FROM goals WHERE user_id = ? AND goal_id = ?")
      .get(userId, goalId) as GoalRow | undefined
    if (!row) throw new HttpError(404, "GOAL_NOT_FOUND", "Goal not found")
    return toGoal(row)
  }

  deleteGoal(userId: string, goalId: string): { deleted: boolean; goal_id: string } {
    const result = this.db
      .prepare("DELETE FROM goals WHERE user_id = ? AND goal_id = ?")
      .run(userId, goalId)
    if (result.changes === 0) throw new HttpError(404, "GOAL_NOT_FOUND", "Goal not found")
    return { deleted: true, goal_id: goalId }
  }

  logDeposit(userId: string, payload: DepositPayload): DepositResponse {
    validateDepositPayload(payload)
    const goal = this.getGoal(userId, payload.goal_id)
    const previousMood = this.getUser(userId).companion_mood
    const previousStreak = this.getStreak(userId)
    const now = new Date().toISOString()
    const newCurrentAmount = roundMoney(goal.current_amount + payload.amount)
    const progressPercent = computeProgress(newCurrentAmount, goal.target_amount)
    const streak = computeNextStreak(this.listDepositRows(userId), now)
    const streakMultiplier = getStreakMultiplier(streak)
    const baseXp = Math.max(1, Math.round(payload.amount))
    const xpEarned = Math.max(1, Math.round(baseXp * streakMultiplier))
    const moodDelta = Math.min(10, Math.max(1, Math.round(xpEarned / 10)))
    const currentMood = Math.min(100, previousMood + moodDelta)
    const transactionId = randomUUID()
    const fireflyTransactionId = Date.now()

    this.db.exec("BEGIN")
    try {
      this.db
        .prepare(
          `INSERT INTO deposits (
            id, user_id, goal_id, firefly_transaction_id, amount, currency, note,
            xp_earned, streak_at_deposit, mood_change, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          transactionId,
          userId,
          goal.goal_id,
          fireflyTransactionId,
          payload.amount,
          payload.currency.toUpperCase(),
          payload.note ?? null,
          xpEarned,
          streak,
          moodDelta,
          now
        )
      this.db
        .prepare(
          "UPDATE goals SET current_amount = ?, xp_total = xp_total + ?, updated_at = ? WHERE goal_id = ? AND user_id = ?"
        )
        .run(newCurrentAmount, xpEarned, now, goal.goal_id, userId)
      this.db
        .prepare("UPDATE users SET companion_mood = ?, updated_at = ? WHERE id = ?")
        .run(currentMood, now, userId)
      this.db
        .prepare("INSERT INTO mood_history (id, user_id, mood, created_at) VALUES (?, ?, ?, ?)")
        .run(randomUUID(), userId, currentMood, now)
      this.db.exec("COMMIT")
    } catch (error) {
      this.db.exec("ROLLBACK")
      throw error
    }

    return {
      transaction_id: transactionId,
      firefly_transaction_id: fireflyTransactionId,
      amount: payload.amount,
      currency: payload.currency.toUpperCase(),
      xp_earned: xpEarned,
      total_xp: this.getTotalXp(userId),
      streak,
      streak_multiplier: streakMultiplier,
      mood: {
        previous: previousMood,
        current: currentMood,
        delta: moodDelta,
      },
      goal_progress: {
        current_amount: newCurrentAmount,
        target_amount: goal.target_amount,
        progress_percent: progressPercent,
      },
      unlocked_cosmetics: this.computeUnlockedCosmetics(userId),
    }
  }

  listDeposits(userId: string, params: { goalId?: string; limit: number; offset: number }): TransactionListResponse {
    const limit = Math.min(Math.max(params.limit, 1), 100)
    const offset = Math.max(params.offset, 0)
    const rows = params.goalId
      ? (this.db
          .prepare(
            "SELECT * FROM deposits WHERE user_id = ? AND goal_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
          )
          .all(userId, params.goalId, limit, offset) as unknown as DepositRow[])
      : (this.db
          .prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
          .all(userId, limit, offset) as unknown as DepositRow[])
    const totalRow = params.goalId
      ? (this.db
          .prepare("SELECT COUNT(*) AS total FROM deposits WHERE user_id = ? AND goal_id = ?")
          .get(userId, params.goalId) as { total: number })
      : (this.db
          .prepare("SELECT COUNT(*) AS total FROM deposits WHERE user_id = ?")
          .get(userId) as { total: number })

    return {
      deposits: rows.map(toTransaction),
      total: totalRow.total,
      limit,
      offset,
    }
  }

  getSummary(userId: string): GamificationSummary {
    const totalXp = this.getTotalXp(userId)
    const streak = this.getStreak(userId)
    const lastDepositAt = this.getLastDepositAt(userId)
    const nextMilestone = MILESTONES.find((milestone) => milestone.xp_threshold > totalXp) ?? MILESTONES[MILESTONES.length - 1]
    const milestonesUnlocked = MILESTONES.filter((milestone) => totalXp >= milestone.xp_threshold).length

    return {
      total_xp: totalXp,
      streak,
      last_deposit_at: lastDepositAt,
      next_milestone: {
        cosmetic_id: nextMilestone.cosmetic_id,
        xp_threshold: nextMilestone.xp_threshold,
        xp_remaining: Math.max(0, nextMilestone.xp_threshold - totalXp),
        emoji: nextMilestone.emoji,
      },
      milestones_unlocked: milestonesUnlocked,
      milestones_total: MILESTONES.length,
    }
  }

  getMilestones(userId: string): MilestoneListResponse {
    const globalProgress = computeGlobalProgress(this.listGoals(userId).map(toEngineGoal))
    const deposits = this.listDepositRows(userId)
    return {
      milestones: MILESTONES.map((milestone) => {
        const unlockedAt =
          globalProgress >= milestone.xp_threshold
            ? deposits.find((deposit) => deposit.created_at)?.created_at ?? new Date().toISOString()
            : null
        return {
          ...milestone,
          unlocked: globalProgress >= milestone.xp_threshold,
          unlocked_at: unlockedAt,
        }
      }),
    }
  }

  getCompanion(userId: string): CompanionState {
    const user = this.getUser(userId)
    const streak = this.getStreak(userId)
    const lastDepositAt = this.getLastDepositAt(userId)
    const moodState = getMoodState(user.companion_mood)

    return {
      current_mood: user.companion_mood,
      mood_state: moodState,
      mood_emoji: getMoodEmoji(moodState),
      streak,
      last_deposit_at: lastDepositAt,
      hours_until_streak_break: computeHoursUntilStreakBreak(lastDepositAt),
    }
  }

  getMoodHistory(userId: string, days: number): MoodHistoryResponse {
    const safeDays = Math.min(Math.max(days, 1), 90)
    const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString()
    const rows = this.db
      .prepare("SELECT created_at, mood FROM mood_history WHERE user_id = ? AND created_at >= ? ORDER BY created_at ASC")
      .all(userId, since) as { created_at: string; mood: number }[]
    return {
      history: rows.map((row) => ({
        date: row.created_at,
        mood: row.mood,
      })),
    }
  }

  private listDepositRows(userId: string): DepositRow[] {
    return this.db
      .prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as unknown as DepositRow[]
  }

  private getTotalXp(userId: string): number {
    const row = this.db
      .prepare("SELECT COALESCE(SUM(xp_earned), 0) AS total_xp FROM deposits WHERE user_id = ?")
      .get(userId) as { total_xp: number }
    return row.total_xp
  }

  private getStreak(userId: string): number {
    return computeCurrentStreak(this.listDepositRows(userId))
  }

  private getLastDepositAt(userId: string): string {
    const row = this.db
      .prepare("SELECT created_at FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 1")
      .get(userId) as { created_at: string } | undefined
    return row?.created_at ?? ""
  }

  private computeUnlockedCosmetics(userId: string): UnlockedCosmetic[] {
    const goals = this.listGoals(userId).map(toEngineGoal)
    const transactions = this.listDepositRows(userId).map(toEngineTransaction)
    const output = computeGamificationState({
      goals,
      transactions,
      currentStreak: this.getStreak(userId),
      previouslyUnlockedIds: [],
      previousTierIndex: 0,
      previousStreak: 0,
    })

    return output.unlockedItems.map((item) => ({
      cosmetic_id: item.id,
      name: item.name,
      category: item.category,
      emoji: item.emoji,
      r2_url: `/stub/cosmetics/${item.id}.png`,
    }))
  }
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    created_at: row.created_at,
    updated_at: row.updated_at,
    firefly_pat_encrypted: row.firefly_pat_encrypted,
    companion_mood: row.companion_mood,
  }
}

function toGoal(row: GoalRow): Goal {
  const progressPercent = computeProgress(row.current_amount, row.target_amount)
  const nextMilestone = MILESTONES.find((milestone) => milestone.xp_threshold > row.xp_total) ?? null
  return {
    goal_id: row.goal_id,
    user_id: row.user_id,
    firefly_piggy_bank_id: row.firefly_piggy_bank_id,
    name: row.name,
    target_amount: row.target_amount,
    current_amount: row.current_amount,
    currency: row.currency,
    deadline: row.deadline,
    progress_percent: progressPercent,
    xp_total: row.xp_total,
    next_milestone: nextMilestone,
    milestone_map: MILESTONES,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function toTransaction(row: DepositRow): Transaction {
  return {
    id: row.id,
    user_id: row.user_id,
    goal_id: row.goal_id,
    firefly_transaction_id: row.firefly_transaction_id,
    amount: row.amount,
    currency: row.currency,
    xp_earned: row.xp_earned,
    streak_at_deposit: row.streak_at_deposit,
    mood_change: row.mood_change,
    created_at: row.created_at,
  }
}

function toEngineGoal(goal: Goal): EngineGoal {
  return {
    goal_id: goal.goal_id,
    target_amount: goal.target_amount,
    current_amount: goal.current_amount,
    progress_percent: goal.progress_percent,
  }
}

function toEngineTransaction(row: DepositRow): EngineTransaction {
  return {
    id: row.id,
    amount: row.amount,
    created_at: row.created_at,
  }
}

function validateGoalPayload(payload: GoalCreatePayload): void {
  if (!payload.name?.trim()) throw new HttpError(400, "INVALID_GOAL", "Goal name is required")
  if (!Number.isFinite(payload.target_amount) || payload.target_amount <= 0) {
    throw new HttpError(400, "INVALID_GOAL", "target_amount must be greater than zero")
  }
  if (!payload.currency?.trim()) throw new HttpError(400, "INVALID_GOAL", "currency is required")
  if (!payload.deadline?.trim()) throw new HttpError(400, "INVALID_GOAL", "deadline is required")
}

function validateDepositPayload(payload: DepositPayload): void {
  if (!payload.goal_id?.trim()) throw new HttpError(400, "INVALID_DEPOSIT", "goal_id is required")
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    throw new HttpError(400, "INVALID_DEPOSIT", "amount must be greater than zero")
  }
  if (!payload.currency?.trim()) throw new HttpError(400, "INVALID_DEPOSIT", "currency is required")
}

function computeProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0
  return Math.min(100, Math.round((currentAmount / targetAmount) * 10000) / 100)
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function computeNextStreak(deposits: DepositRow[], nowIso: string): number {
  const todayKey = dayKey(nowIso)
  const uniqueDays = new Set(deposits.map((deposit) => dayKey(deposit.created_at)))
  if (uniqueDays.has(todayKey)) return computeCurrentStreak(deposits)
  return uniqueDays.has(offsetDayKey(nowIso, -1)) ? computeCurrentStreak(deposits) + 1 : 1
}

function computeCurrentStreak(deposits: DepositRow[]): number {
  if (deposits.length === 0) return 0
  const uniqueDays = new Set(deposits.map((deposit) => dayKey(deposit.created_at)))
  let streak = 0
  let cursor = new Date()

  if (!uniqueDays.has(dayKey(cursor.toISOString()))) {
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000)
  }

  while (uniqueDays.has(dayKey(cursor.toISOString()))) {
    streak += 1
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000)
  }

  return streak
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function offsetDayKey(iso: string, days: number): string {
  return dayKey(new Date(new Date(iso).getTime() + days * 24 * 60 * 60 * 1000).toISOString())
}

function getMoodState(mood: number): CompanionState["mood_state"] {
  if (mood < 35) return "sad"
  if (mood < 65) return "neutral"
  if (mood < 90) return "happy"
  return "excited"
}

function getMoodEmoji(moodState: CompanionState["mood_state"]): string {
  if (moodState === "sad") return "🥀"
  if (moodState === "neutral") return "🌱"
  if (moodState === "happy") return "🌸"
  return "✨"
}

function computeHoursUntilStreakBreak(lastDepositAt: string): number {
  if (!lastDepositAt) return 0
  const expiresAt = new Date(lastDepositAt).getTime() + 48 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (60 * 60 * 1000)))
}

function maskPat(pat: string): string {
  if (pat.length <= 4) return "****"
  return `****${pat.slice(-4)}`
}
