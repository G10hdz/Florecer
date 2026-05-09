import { get, post, del } from "./api-client"
import type {
  Goal,
  GoalCreatePayload,
  GoalListResponse,
  GamificationSummary,
  MilestoneStatus,
  MilestoneListResponse,
} from "@/types/api"

export function createGoal(payload: GoalCreatePayload): Promise<Goal> {
  return post<Goal>("/goals/create", payload)
}

export function listGoals(signal?: AbortSignal): Promise<GoalListResponse> {
  return get<GoalListResponse>("/goals", signal)
}

export function getGoal(goalId: string, signal?: AbortSignal): Promise<Goal> {
  return get<Goal>(`/goals/${goalId}`, signal)
}

export function deleteGoal(goalId: string): Promise<{ deleted: boolean; goal_id: string }> {
  return del<{ deleted: boolean; goal_id: string }>(`/goals/${goalId}`)
}

export function getGamificationSummary(signal?: AbortSignal): Promise<GamificationSummary> {
  return get<GamificationSummary>("/gamification/summary", signal)
}

export function getMilestones(signal?: AbortSignal): Promise<MilestoneListResponse> {
  return get<MilestoneListResponse>("/gamification/milestones", signal)
}
