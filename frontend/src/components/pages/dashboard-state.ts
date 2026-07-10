type DashboardQueryState = {
  isError: boolean
  isPending: boolean
  isSuccess: boolean
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

export type DashboardRenderState = "error" | "pending" | "empty" | "ready"

export function selectDashboardState({
  goalsQuery,
  summaryQuery,
  companionQuery,
  milestonesQuery,
}: DashboardStateQueries): DashboardRenderState {
  if (goalsQuery.isError || summaryQuery.isError || companionQuery.isError || milestonesQuery.isError) {
    return "error"
  }

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
