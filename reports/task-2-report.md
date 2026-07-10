# Task 2 Report

## Status

done

Implemented a standalone Hono BFF under `bff/` per Task 2. Because this sandbox has no network/package install access, dependency installation, dev server startup, curl verification, and Vitest were not run here. They are listed below for the coordinator to execute.

## Files Touched

- `bff/.env.example`
- `bff/.gitignore`
- `bff/migrations/001_initial.sql`
- `bff/package.json`
- `bff/tsconfig.json`
- `bff/src/app.ts`
- `bff/src/auth.ts`
- `bff/src/db/database.ts`
- `bff/src/db/migrate.ts`
- `bff/src/env.ts`
- `bff/src/http-error.ts`
- `bff/src/lib/gamification-engine.ts`
- `bff/src/server.ts`
- `bff/src/types/api.ts`
- `bff/src/types/node-shims.d.ts`
- `bff/test/app.test.ts`
- `reports/task-2-report.md`

New dependencies:

- `hono` — HTTP app, routing, JWT helper/middleware, CORS middleware.
- `@hono/node-server` — Node runtime adapter.
- `tsx` — TypeScript dev/start runtime.
- `typescript` — strict type checking.
- `vitest` — smoke tests.

No Supabase, Firefly, R2, Satori, Vertex, bcrypt, argon2, or npm SQLite driver dependency was added.

## Verification Evidence

Commands actually run in the sandbox were static discovery/review only:

```sh
sed -n '1,260p' HANDOFF.md
sed -n '1,240p' frontend/src/services/account.ts
sed -n '1,260p' frontend/src/services/api-client.ts
sed -n '1,260p' frontend/src/services/transactions.ts
sed -n '1,300p' frontend/src/services/goals.ts
sed -n '1,220p' frontend/src/services/index.ts
sed -n '1,360p' frontend/src/types/api.ts
sed -n '1,760p' frontend/src/lib/gamification-engine.ts
rg -n "better-sqlite3|supabase|@supabase|firefly-iii|vertex|@google|argon2|bcrypt|node-fetch|axios" bff/package.json bff/src bff/test || true
rg -n "app\.(get|post|delete)\(" bff/src/app.ts
```

Tail/static output:

```text
bff/src/app.ts:44:        supabase: "stub"

38:  app.get("/health", (c) =>
50:  app.post("/auth/register", async (c) => {
61:  app.post("/auth/login", async (c) => {
85:  app.get("/firefly/status", (c) => c.json(db.getFireflyStatus(c.get("userId"))))
86:  app.post("/firefly/set-pat", async (c) => {
92:  app.post("/goals/create", async (c) => c.json(db.createGoal(c.get("userId"), await c.req.json<GoalCreatePayload>()), 201))
93:  app.get("/goals", (c) => c.json({ goals: db.listGoals(c.get("userId")) }))
94:  app.get("/goals/:id", (c) => c.json(db.getGoal(c.get("userId"), c.req.param("id"))))
95:  app.delete("/goals/:id", (c) => c.json(db.deleteGoal(c.get("userId"), c.req.param("id"))))
97:  app.post("/deposits/log", async (c) => c.json(db.logDeposit(c.get("userId"), await c.req.json<DepositPayload>()), 201))
98:  app.get("/deposits", (c) =>
108:  app.get("/gamification/summary", (c) => c.json(db.getSummary(c.get("userId"))))
109:  app.get("/gamification/milestones", (c) => c.json(db.getMilestones(c.get("userId"))))
110:  app.get("/companion", (c) => c.json(db.getCompanion(c.get("userId"))))
111:  app.get("/companion/mood-history", (c) => c.json(db.getMoodHistory(c.get("userId"), Number(c.req.query("days") ?? "7"))))
```

Task 2 acceptance checkboxes:

- [ ] not run — coordinator must execute: `cd bff && npm install && npm run dev` serves all routes on `:8787`.
- [ ] not run — coordinator must execute: `curl :8787/health` returns 200 and protected route without JWT returns 401.
- [ ] not run — coordinator must execute: full happy path via curl.
- [ ] not run — coordinator must execute: `cd bff && npm test` green.
- [ ] not run — coordinator must execute: verify no Supabase/Firefly/R2/Vertex SDK in `bff/package.json`.

Coordinator verification commands, from repo root:

```sh
cd bff
npm install
npm run dev
```

In a second terminal, from repo root:

```sh
cd bff

curl -i http://localhost:8787/health
curl -i http://localhost:8787/goals

EMAIL="gio+task2-$(date +%s)@example.com"
PASSWORD="password123"

REGISTER_BODY=$(curl -s http://localhost:8787/auth/register \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$REGISTER_BODY"

TOKEN=$(printf '%s' "$REGISTER_BODY" | node -pe 'JSON.parse(require("fs").readFileSync(0, "utf8")).token')

LOGIN_BODY=$(curl -s http://localhost:8787/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$LOGIN_BODY"

GOAL_BODY=$(curl -s http://localhost:8787/goals/create \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Emergency fund","target_amount":1000,"currency":"MXN","deadline":"2026-12-31"}')
echo "$GOAL_BODY"

GOAL_ID=$(printf '%s' "$GOAL_BODY" | node -pe 'JSON.parse(require("fs").readFileSync(0, "utf8")).goal_id')

curl -s http://localhost:8787/deposits/log \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"goal_id\":\"$GOAL_ID\",\"amount\":100,\"currency\":\"MXN\",\"note\":\"First deposit\"}"

curl -s http://localhost:8787/deposits/log \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"goal_id\":\"$GOAL_ID\",\"amount\":150,\"currency\":\"MXN\",\"note\":\"Second deposit\"}"

curl -s http://localhost:8787/gamification/summary \
  -H "Authorization: Bearer $TOKEN"

curl -s "http://localhost:8787/deposits?goal_id=$GOAL_ID&limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"

curl -s http://localhost:8787/gamification/milestones \
  -H "Authorization: Bearer $TOKEN"

curl -s http://localhost:8787/companion \
  -H "Authorization: Bearer $TOKEN"

curl -s "http://localhost:8787/companion/mood-history?days=7" \
  -H "Authorization: Bearer $TOKEN"

curl -s http://localhost:8787/firefly/status \
  -H "Authorization: Bearer $TOKEN"

curl -s http://localhost:8787/firefly/set-pat \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"pat":"demo-personal-access-token"}'

npm test
rg -n '"(@supabase|supabase|firefly|r2|vertex|better-sqlite3|sqlite3|bcrypt|argon2)' package.json || true
```

Expected happy-path summary after the two example deposits: `total_xp` greater than `0`, `streak` at least `1`, and a `next_milestone` object. The current XP rule is `round(amount * getStreakMultiplier(streak))`, using the copied `gamification-engine.ts` multiplier table. Milestone unlock statuses are computed from weighted goal progress via the copied `computeGlobalProgress` helper.

## Deviations From This Spec

- Password hashing uses built-in `node:crypto` `scrypt` instead of bcrypt/argon2. Rationale: avoids native/extra deps under the no-network sandbox while still using a password KDF.
- `/health` returns `{ status: "ok" }` plus `version`, `timestamp`, and stub dependency fields because `frontend/src/types/api.ts` defines those additional fields.
- `bff/src/lib/gamification-engine.ts` is copied verbatim from `frontend/src/lib/gamification-engine.ts` with only the required header comment added.
- `tsconfig.json` keeps `strict: true` but leaves `noUncheckedIndexedAccess` disabled so the verbatim copied gamification engine is not forked for index-access type noise.

## Open Questions

- The frontend service files do not currently expose auth service functions, so `/auth/register` and `/auth/login` return the conventional `{ token, user }` shape specified by HANDOFF rather than a pre-existing frontend service type.
- `frontend/src/types/api.ts` defines avatar/share types, but no current file in `frontend/src/services/*` calls those endpoints. They were not implemented because Task 2.6 scopes those stubs to frontend service references.

---

## Verifier resolution (coordinator, 2026-07-07)

Coordinator fixes applied on top of the delegate's code (all caused by environment,
not logic):
- Security scanner required version bumps: hono ^4.12.18 (JWT NumericDate advisory),
  @hono/node-server ^1.19.13, vitest ^4.1.5 (critical advisory in 3.x).
- hono 4.12 requires explicit alg: `jwt({ secret, alg: "HS256" })` in src/app.ts.
- Replaced hand-written src/types/node-shims.d.ts with real @types/node ^24
  (delegate couldn't install it); added "node" to tsconfig types; row casts in
  src/db/database.ts now go through `as unknown as XRow[]`.

Acceptance verified:
- `npm install` OK; `npm run build` (tsc --noEmit) exit 0; `npm test` 2/2 passed.
- Live server: GET /health → 200; GET /goals without JWT → 401.
- Happy path via curl: register → login → create goal → 2 deposits (100+150) →
  summary `total_xp: 300` = 250 × 1.2 streak multiplier ✓ (verified against
  STREAK_MULTIPLIERS in the engine); companion mood "happy", streak 1.
- Engine copy is verbatim (diff = header comment only). No forbidden SDKs.

**Task 2: DONE.**
