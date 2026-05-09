import { get, post } from "./api-client"
import type {
  FireflyStatus,
  FireflySetPatPayload,
  FireflySetPatResponse,
  CompanionState,
  MoodHistoryResponse,
  HealthResponse,
} from "@/types/api"

export function getFireflyStatus(signal?: AbortSignal): Promise<FireflyStatus> {
  return get<FireflyStatus>("/firefly/status", signal)
}

export function setFireflyPat(payload: FireflySetPatPayload): Promise<FireflySetPatResponse> {
  return post<FireflySetPatResponse>("/firefly/set-pat", payload)
}

export function getCompanion(signal?: AbortSignal): Promise<CompanionState> {
  return get<CompanionState>("/companion", signal)
}

export function getMoodHistory(
  days: number = 7,
  signal?: AbortSignal
): Promise<MoodHistoryResponse> {
  return get<MoodHistoryResponse>(`/companion/mood-history?days=${days}`, signal)
}

export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return get<HealthResponse>("/health", signal)
}
