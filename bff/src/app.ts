import { Hono } from "hono"
import { cors } from "hono/cors"
import { jwt } from "hono/jwt"

import { createToken, hashPassword, verifyPassword } from "./auth.js"
import { FlorecerDb } from "./db/database.js"
import { loadEnv, type Env } from "./env.js"
import { errorResponse, HttpError } from "./http-error.js"
import type { FireflySetPatPayload, GoalCreatePayload, DepositPayload } from "./types/api.js"

type Variables = {
  jwtPayload: { sub?: unknown }
  userId: string
}

export interface AppOptions {
  env?: Partial<Env>
  db?: FlorecerDb
}

export function createApp(options: AppOptions = {}) {
  const env = loadEnv(options.env)
  const db = options.db ?? new FlorecerDb(env.dbPath)
  const app = new Hono<{ Variables: Variables }>()

  app.use(
    "*",
    cors({
      origin: env.corsOrigin,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      credentials: true,
    })
  )

  app.onError((error, c) => errorResponse(c, error))

  app.get("/health", (c) =>
    c.json({
      status: "ok",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      dependencies: {
        supabase: "stub",
        firefly: "stub",
      },
    })
  )

  app.post("/auth/register", async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>()
    const email = body.email?.trim()
    const password = body.password ?? ""
    if (!email || !email.includes("@")) throw new HttpError(400, "INVALID_EMAIL", "Valid email is required")
    if (password.length < 8) throw new HttpError(400, "WEAK_PASSWORD", "Password must be at least 8 characters")

    const user = db.createUser(email, await hashPassword(password))
    return c.json({ token: await createToken(user, env.jwtSecret), user }, 201)
  })

  app.post("/auth/login", async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>()
    const email = body.email?.trim()
    const password = body.password ?? ""
    if (!email || !password) throw new HttpError(400, "INVALID_LOGIN", "Email and password are required")

    const user = db.getUserByEmail(email)
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password")
    }

    const { password_hash: _passwordHash, ...safeUser } = user
    return c.json({ token: await createToken(safeUser, env.jwtSecret), user: safeUser })
  })

  app.use("*", jwt({ secret: env.jwtSecret, alg: "HS256" }))
  app.use("*", async (c, next) => {
    const payload = c.get("jwtPayload")
    const userId = typeof payload?.sub === "string" ? payload.sub : ""
    if (!userId) throw new HttpError(401, "UNAUTHORIZED", "Missing token subject")
    c.set("userId", userId)
    await next()
  })

  app.get("/firefly/status", (c) => c.json(db.getFireflyStatus(c.get("userId"))))
  app.post("/firefly/set-pat", async (c) => {
    const body = await c.req.json<FireflySetPatPayload>()
    if (!body.pat?.trim()) throw new HttpError(400, "INVALID_PAT", "pat is required")
    return c.json(db.setFireflyPat(c.get("userId"), body.pat))
  })

  app.post("/goals/create", async (c) => c.json(db.createGoal(c.get("userId"), await c.req.json<GoalCreatePayload>()), 201))
  app.get("/goals", (c) => c.json({ goals: db.listGoals(c.get("userId")) }))
  app.get("/goals/:id", (c) => c.json(db.getGoal(c.get("userId"), c.req.param("id"))))
  app.delete("/goals/:id", (c) => c.json(db.deleteGoal(c.get("userId"), c.req.param("id"))))

  app.post("/deposits/log", async (c) => c.json(db.logDeposit(c.get("userId"), await c.req.json<DepositPayload>()), 201))
  app.get("/deposits", (c) =>
    c.json(
      db.listDeposits(c.get("userId"), {
        goalId: c.req.query("goal_id"),
        limit: Number(c.req.query("limit") ?? "50"),
        offset: Number(c.req.query("offset") ?? "0"),
      })
    )
  )

  app.get("/gamification/summary", (c) => c.json(db.getSummary(c.get("userId"))))
  app.get("/gamification/milestones", (c) => c.json(db.getMilestones(c.get("userId"))))
  app.get("/companion", (c) => c.json(db.getCompanion(c.get("userId"))))
  app.get("/companion/mood-history", (c) => c.json(db.getMoodHistory(c.get("userId"), Number(c.req.query("days") ?? "7"))))

  return { app, db, env }
}
