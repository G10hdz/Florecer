import { get, post } from "./api-client"
import type {
  DepositPayload,
  DepositResponse,
  TransactionListResponse,
} from "@/types/api"

export interface ListDepositsParams {
  goal_id?: string
  limit?: number
  offset?: number
}

export function logDeposit(payload: DepositPayload): Promise<DepositResponse> {
  return post<DepositResponse>("/deposits/log", payload)
}

export function listDeposits(
  params: ListDepositsParams = {},
  signal?: AbortSignal
): Promise<TransactionListResponse> {
  const searchParams = new URLSearchParams()
  if (params.goal_id) searchParams.set("goal_id", params.goal_id)
  if (params.limit !== undefined) searchParams.set("limit", String(params.limit))
  if (params.offset !== undefined) searchParams.set("offset", String(params.offset))

  const query = searchParams.toString()
  return get<TransactionListResponse>(`/deposits${query ? `?${query}` : ""}`, signal)
}
