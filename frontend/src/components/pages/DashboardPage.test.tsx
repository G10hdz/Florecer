import { describe, expect, it } from "vitest"
import { selectDashboardState } from "./dashboard-state"

type QueryState = Parameters<typeof selectDashboardState>[0]["summaryQuery"]
type GoalsQueryState = Parameters<typeof selectDashboardState>[0]["goalsQuery"]

function query(overrides: Partial<QueryState> = {}): QueryState {
  return {
    isError: false,
    isPending: false,
    isSuccess: true,
    ...overrides,
  }
}

function goalsQuery(overrides: Partial<GoalsQueryState> = {}): GoalsQueryState {
  return {
    ...query(),
    data: { goals: [{ goal_id: "goal-1" }] },
    ...overrides,
  }
}

describe("selectDashboardState", () => {
  it("prioritizes any query error over an empty goals response", () => {
    expect(
      selectDashboardState({
        goalsQuery: goalsQuery({ data: { goals: [] } }),
        summaryQuery: query({ isError: true, isSuccess: false }),
        companionQuery: query(),
        milestonesQuery: query(),
      })
    ).toBe("error")
  })

  it("prioritizes any query error over pending queries", () => {
    expect(
      selectDashboardState({
        goalsQuery: goalsQuery({ isPending: true, isSuccess: false }),
        summaryQuery: query(),
        companionQuery: query({ isError: true, isSuccess: false }),
        milestonesQuery: query(),
      })
    ).toBe("error")
  })

  it("treats a paused (unreachable BFF) query as an error, not pending", () => {
    expect(
      selectDashboardState({
        goalsQuery: goalsQuery({ isPending: true, isSuccess: false, isPaused: true }),
        summaryQuery: query({ isPending: true, isSuccess: false, isPaused: true }),
        companionQuery: query({ isPending: true, isSuccess: false, isPaused: true }),
        milestonesQuery: query({ isPending: true, isSuccess: false, isPaused: true }),
      })
    ).toBe("error")
  })

  it("shows pending while a query is still pending and none errored", () => {
    expect(
      selectDashboardState({
        goalsQuery: goalsQuery(),
        summaryQuery: query({ isPending: true, isSuccess: false }),
        companionQuery: query(),
        milestonesQuery: query(),
      })
    ).toBe("pending")
  })

  it("shows empty only when the goals query succeeded with zero goals", () => {
    expect(
      selectDashboardState({
        goalsQuery: goalsQuery({ data: { goals: [] } }),
        summaryQuery: query(),
        companionQuery: query(),
        milestonesQuery: query(),
      })
    ).toBe("empty")
  })

  it("shows ready when all queries are settled and at least one goal exists", () => {
    expect(
      selectDashboardState({
        goalsQuery: goalsQuery(),
        summaryQuery: query(),
        companionQuery: query(),
        milestonesQuery: query(),
      })
    ).toBe("ready")
  })
})
