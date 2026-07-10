import { describe, expect, it } from "vitest"

import { createApp } from "../src/app.js"

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>
}

describe("Florecer BFF smoke path", () => {
  it("registers, logs in, creates a goal, logs a deposit, and reports XP", async () => {
    const { app, db } = createApp({
      env: {
        dbPath: ":memory:",
        jwtSecret: "test-secret",
        corsOrigin: "http://localhost:5173",
      },
    })

    try {
      const email = `test-${Date.now()}@example.com`
      const register = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      })
      expect(register.status).toBe(201)
      const registerBody = await json(register)
      expect(registerBody.token).toEqual(expect.any(String))

      const login = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      })
      expect(login.status).toBe(200)
      const loginBody = await json(login)
      const token = loginBody.token
      expect(token).toEqual(expect.any(String))

      const goalResponse = await app.request("/goals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: "Emergency fund",
          target_amount: 1000,
          currency: "MXN",
          deadline: "2026-12-31",
        }),
      })
      expect(goalResponse.status).toBe(201)
      const goal = await json(goalResponse)
      expect(goal.goal_id).toEqual(expect.any(String))

      const depositResponse = await app.request("/deposits/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal_id: goal.goal_id,
          amount: 150,
          currency: "MXN",
          note: "First deposit",
        }),
      })
      expect(depositResponse.status).toBe(201)
      const deposit = await json(depositResponse)
      expect(deposit.xp_earned).toEqual(expect.any(Number))

      const summaryResponse = await app.request("/gamification/summary", {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(summaryResponse.status).toBe(200)
      const summary = await json(summaryResponse)
      expect(summary.total_xp as number).toBeGreaterThan(0)
      expect(summary.streak as number).toBeGreaterThan(0)
    } finally {
      db.close()
    }
  })

  it("rejects protected routes without a JWT", async () => {
    const { app, db } = createApp({
      env: {
        dbPath: ":memory:",
        jwtSecret: "test-secret",
        corsOrigin: "http://localhost:5173",
      },
    })

    try {
      const response = await app.request("/goals")
      expect(response.status).toBe(401)
    } finally {
      db.close()
    }
  })
})
