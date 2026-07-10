export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  firefly_pat_encrypted: string
  companion_mood: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Goal {
  goal_id: string
  user_id: string
  firefly_piggy_bank_id: number
  name: string
  target_amount: number
  current_amount: number
  currency: string
  deadline: string
  progress_percent: number
  xp_total: number
  next_milestone: Milestone | null
  milestone_map: Milestone[]
  created_at: string
  updated_at: string
}

export interface GoalCreatePayload {
  name: string
  target_amount: number
  currency: string
  deadline: string
}

export interface GoalListResponse {
  goals: Goal[]
}

export interface Transaction {
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

export interface DepositPayload {
  goal_id: string
  amount: number
  currency: string
  note?: string
}

export interface DepositResponse {
  transaction_id: string
  firefly_transaction_id: number
  amount: number
  currency: string
  xp_earned: number
  total_xp: number
  streak: number
  streak_multiplier: number
  mood: {
    previous: number
    current: number
    delta: number
  }
  goal_progress: {
    current_amount: number
    target_amount: number
    progress_percent: number
  }
  unlocked_cosmetics: UnlockedCosmetic[]
}

export interface TransactionListResponse {
  deposits: Transaction[]
  total: number
  limit: number
  offset: number
}

export interface AppliedCombo {
  hat: string | null
  dress: string | null
  accessory: string | null
  shoes: string | null
}

export interface Cosmetic {
  cosmetic_id: string
  name: string
  category: "hat" | "dress" | "accessory" | "shoes"
  xp_threshold: number
  r2_url: string
  unlocked_at: string
}

export interface CosmeticMetadata {
  cosmetic_id: string
  name: string
  description: string
  category: "hat" | "dress" | "accessory" | "shoes"
  xp_threshold: number
  r2_url: string
}

export interface UnlockedCosmetic {
  cosmetic_id: string
  name: string
  category: string
  emoji: string
  r2_url: string
}

export interface CosmeticsListResponse {
  cosmetics: Cosmetic[]
}

export interface AppliedComboResponse {
  applied_combo: AppliedCombo
  updated_at: string
}

export interface ApplyComboPayload {
  hat: string | null
  dress: string | null
  accessory: string | null
  shoes: string | null
}

export interface ApplyComboResponse {
  applied_combo: AppliedCombo
  mood_delta: number
  new_mood: number
}

export interface Milestone {
  sequence: number
  xp_threshold: number
  cosmetic_id: string
  emoji: string
}

export interface MilestoneStatus extends Milestone {
  unlocked: boolean
  unlocked_at: string | null
}

export interface MilestoneListResponse {
  milestones: MilestoneStatus[]
}

export interface GamificationSummary {
  total_xp: number
  streak: number
  last_deposit_at: string
  next_milestone: {
    cosmetic_id: string
    xp_threshold: number
    xp_remaining: number
    emoji: string
  }
  milestones_unlocked: number
  milestones_total: number
}

export interface CompanionState {
  current_mood: number
  mood_state: "sad" | "neutral" | "happy" | "excited"
  mood_emoji: string
  streak: number
  last_deposit_at: string
  hours_until_streak_break: number
}

export interface MoodHistoryEntry {
  date: string
  mood: number
}

export interface MoodHistoryResponse {
  history: MoodHistoryEntry[]
}

export interface FireflyStatus {
  connected: boolean
  firefly_version?: string
  last_sync?: string
}

export interface FireflySetPatResponse {
  connected: boolean
  firefly_user: string
  piggy_banks_count: number
}

export interface FireflySetPatPayload {
  pat: string
}

export interface AvatarComposePayload {
  hat: string | null
  dress: string | null
  accessory: string | null
  shoes: string | null
}

export interface AvatarComposeResponse {
  avatar_url: string
  status: "ready" | "generating"
  base_avatar_url?: string
  estimated_seconds?: number
  placeholder_url?: string
}

export interface ShareCreatePayload {
  goal_id: string
  message: string
}

export interface ShareCreateResponse {
  share_url: string
  og_image_url: string
  mood_delta: number
  new_mood: number
}

export interface HealthResponse {
  status: string
  version: string
  timestamp: string
  dependencies: {
    supabase: string
    firefly: string
  }
}

export interface ApiError {
  code: string
  message: string
  status: number
}

export interface ApiErrorResponse {
  error: ApiError
}

export class FlorecerApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = "FlorecerApiError"
    this.code = code
    this.status = status
  }
}
