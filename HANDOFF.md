# HANDOFF — Florecer delegation spec

> **Purpose:** self-contained spec so a cheaper agent (codex / opencode / commandcode)
> can execute the next phases without extra context. Execute **one task at a time**,
> in order. After each task, produce the report described in [Reporting](#reporting).
> A senior model (Fable) verifies against the acceptance criteria afterwards.
>
> **Para Gio:** delega con, p.ej.:
> `codex "Read HANDOFF.md in this repo and execute Task 1 only. Follow its Reporting section."`

---

## Context (read first, do not re-derive)

Florecer is a gamified savings app. **Only `frontend/` exists** (React + TypeScript +
Vite + Tailwind + shadcn/ui + TanStack Query). The planned backend (Hono.js BFF,
Supabase, Firefly III, R2, Satori, Vertex AI) is described in `ARCHITECTURE.md` but
**no backend code exists**. Audit findings (2026-07-07, do not re-audit):

- UI pages/organisms are complete enough for a clickable demo: Login, Register,
  Onboarding, Dashboard, GoalCreate, Wardrobe, ShareCard, PixelArtStudio.
- `frontend/src/services/*` already defines typed calls the BFF must satisfy (see Task 2).
- All "working" behavior is mocked in the UI layer: `AuthContext` fabricates a user in
  `sessionStorage`; Dashboard/Wardrobe/ShareCard use hardcoded data; `api-client.ts`
  never attaches an Authorization header.
- Pure gamification engine + tests live in `frontend/src/lib/gamification-engine.ts`.
- `.env.example` → `VITE_BFF_URL=http://localhost:8787`.
- `frontend/public/assets/` is **empty**; `PIXEL_ART_GUIDE.md` defines the folder
  structure and visual style; `frontend/ASSET_PACKS.md` lists vetted free asset packs.
- Task 1 status: **DONE, verified 2026-07-07** (build exits 0, 54/54 tests pass).
  The npm failure was the Codex sandbox (no network) plus a security scanner that
  blocks packages with OSV advisories — fixed by bumping vite ^8.0.16,
  react-router ^7.15.1, @babel/core ^7.29.6 (override).
- **Delegate sandbox limits:** `npm install` and network access do NOT work inside
  the Codex sandbox. Delegates must write code + package.json and list the exact
  install/verify commands in their report; the coordinator runs them outside.

**Global constraints (apply to every task):**
- Do not modify `ARCHITECTURE.md`, `README.md`, or this file.
- Do not add Supabase, Firefly, R2, Satori, or Vertex SDKs yet — those integrations
  are stubbed behind the BFF (Task 2.6).
- No new heavyweight deps without noting the reason in the report.
- TypeScript strict; match existing code style in `frontend/src`.
- Never invent API shapes: the source of truth is `frontend/src/services/*` and
  `frontend/src/types/*`. If a needed type is missing, add it there and flag it.

---

## Task 1 — Green baseline (build + tests)

1. Fix the `npm install` failure inside `frontend/`. Known symptom: permission errors
   writing npm logs/cache. Try in order: `npm install --no-audit --no-fund`,
   `npm cache verify`, check `~/.npm` ownership (`sudo chown -R $(whoami) ~/.npm`).
   Do NOT switch package managers.
2. Run and make pass: `npm run build` (tsc + vite) and `npm test -- --run` (vitest).
3. Fix only what blocks build/tests (type errors, broken imports). No refactors.

**Acceptance criteria:**
- [ ] `cd frontend && npm run build` exits 0.
- [ ] `cd frontend && npm test -- --run` exits 0, no skipped test added.
- [ ] `git diff` touches only what was strictly needed; lockfile changes explained.

---

## Task 2 — Minimal Hono BFF (`bff/`)

Create `bff/` at repo root: standalone Hono.js + TypeScript app, Node runtime,
port **8787**, CORS allowing `http://localhost:5173`.

### 2.1 Endpoint contract (source of truth: `frontend/src/services/*`)

Implement exactly these routes with the request/response types the frontend
services expect (read each service file and mirror its types):

| Route | Notes |
|---|---|
| `GET /health` | `{ status: "ok" }` |
| `POST /auth/register` | email+password → create user, return JWT + user |
| `POST /auth/login` | verify → JWT + user |
| `GET /firefly/status` | stub: `{ connected: false }` unless PAT set |
| `POST /firefly/set-pat` | stub: store PAT string, mark connected (no real Firefly call) |
| `POST /goals/create` | persist goal |
| `GET /goals` | list user goals |
| `GET /goals/:id` | single goal |
| `DELETE /goals/:id` | delete |
| `POST /deposits/log` | persist deposit, recompute XP/streak |
| `GET /deposits` | list deposits |
| `GET /gamification/summary` | XP, level, streak — computed |
| `GET /gamification/milestones` | computed from goals progress |
| `GET /companion` | mood derived from streak/recency |
| `GET /companion/mood-history` | last N mood snapshots |

### 2.2 Auth
- JWT (HS256) via `JWT_SECRET` env var; `hono/jwt` middleware on everything except
  `/health` and `/auth/*`. Passwords hashed (bcrypt or argon2).

### 2.3 Persistence
- SQLite via the built-in `node:sqlite` module (`DatabaseSync`; verified working on
  local Node v22.22.3 — do NOT use `better-sqlite3`, native install scripts are
  blocked in this environment). DB file `bff/data/florecer.db`, gitignored.
  Tables: users, goals, deposits, mood_history, settings (PAT). Keep schema in one
  migration file executed on boot. No ORM.

### 2.4 Gamification engine
- **Copy** `frontend/src/lib/gamification-engine.ts` to `bff/src/lib/` verbatim, with a
  header comment: `// Copied from frontend/src/lib — keep in sync (extract to shared pkg later)`.
  The BFF computes XP/level/streak/mood server-side using it. Do not fork its logic.

### 2.5 DX
- `bff/package.json` scripts: `dev` (tsx watch), `build`, `start`, `test`.
- `bff/.env.example` with `PORT=8787`, `JWT_SECRET=change-me`, `CORS_ORIGIN=http://localhost:5173`.
- At least smoke tests (vitest): register→login→create goal→log deposit→summary
  reflects XP > 0.

### 2.6 Stubs behind flags
- Firefly/R2/avatar-compose/share-create: if the frontend services reference them,
  return deterministic stub data with `"stub": true` field. No external calls.

**Acceptance criteria:**
- [ ] `cd bff && npm install && npm run dev` serves all routes on :8787.
- [ ] `curl :8787/health` → 200; protected route without JWT → 401.
- [ ] Full happy path via curl: register → login → create goal → log 2 deposits →
      `GET /gamification/summary` shows XP/streak consistent with the engine.
- [ ] `cd bff && npm test` green.
- [ ] No Supabase/Firefly/R2/Vertex SDK in `bff/package.json`.

---

## Task 3 — Wire frontend to the BFF

1. `api-client.ts`: attach `Authorization: Bearer <token>` from auth state; handle 401
   by clearing session and redirecting to login.
2. `AuthContext`: replace the sessionStorage mock with real `POST /auth/register|login`;
   persist token (localStorage is fine for demo); expose loading/error.
3. Replace hardcoded data with service calls via TanStack Query (loading + error states,
   no silent fallbacks to mock data): Dashboard (goals, summary, companion),
   GoalCreate/Onboarding (create goal), deposit modal (log deposit), milestones.
4. Wardrobe/ShareCard: keep hardcoded cosmetics/share URL but mark clearly:
   `// TODO(v2): backed by /avatar + /share endpoints`.
5. Create `frontend/.env.local` from `.env.example` pointing at `http://localhost:8787`.

**Acceptance criteria:**
- [ ] With BFF running: register a new user in the UI, create a goal, log a deposit,
      see XP/streak/companion mood update after refetch — **no mock data involved**.
- [ ] With BFF stopped: UI shows error states, does not crash, no fake data appears.
- [ ] `npm run build` and `npm test -- --run` still green.
- [ ] `rg -n "sessionStorage" frontend/src` shows no auth-mock usage left.

---

## Task 4 — Asset integration pipeline

Licenses were pre-vetted in `frontend/ASSET_PACKS.md`. Use ONLY packs listed there.

1. Download (manual step for Gio if auth needed — agent prepares everything else):
   Tiny RPG Mana Soul GUI (CC0), Brackeys' VFX Bundle (CC0),
   Shikashi's Fantasy Icons (CC-BY → attribution), Kenney Fantasy UI Borders (CC0).
2. Write `frontend/scripts/import-assets.mjs` (node + `sharp`): takes a source dir,
   slices spritesheets where needed, normalizes to PNG with transparency, places files
   under `frontend/public/assets/pixelart/` following the exact folder structure in
   `PIXEL_ART_GUIDE.md` (§ Estructura de Carpetas). Idempotent.
3. Create `frontend/public/assets/pixelart/CREDITS.md` with attribution lines for
   CC-BY packs (Matt Firth/shikashipx + game-icons.net; CodeManu if used) and link it
   from the app footer or About.
4. Ensure sprites render crisp: `image-rendering: pixelated` on the shared sprite/img
   component(s).
5. Do NOT create avatar-base or companion cosmetics from these packs — those are
   Vertex/hand-drawn scope (see `PIXEL_ART_GUIDE.md`). Packs cover: UI, VFX, goal icons.

**Acceptance criteria:**
- [ ] `node frontend/scripts/import-assets.mjs <src>` populates the folder structure;
      running twice produces identical output.
- [ ] `CREDITS.md` exists and covers every CC-BY asset shipped.
- [ ] At least goal icons and one celebration effect visible in the running app, crisp
      at 2x/3x scale.

---

## Task 3b — Fix dashboard error-vs-empty state (follow-up to Task 3)

**Bug (found by coordinator during Task 3 browser verification):** when the BFF is
down/unreachable, `DashboardPage` renders the empty state "Aún no tienes metas"
instead of the error panel "No se pudo cargar Florecer". Root cause in
`frontend/src/components/pages/DashboardPage.tsx`: the empty-state guard
`if (!focusedGoal || !companion || !summary)` (~line 198) treats *any* missing data
as "no goals", conflating fetch-failure with genuinely-empty. This is misleading —
a user with saved goals could think they were deleted.

The happy path (BFF up) is already verified working; do NOT change it.

**Required changes (code-only; you cannot run the browser/BFF in your sandbox):**
1. In `DashboardPage.tsx`, make the render precedence and conditions explicit and
   canonical using react-query v5 flags:
   - Show the **error panel** when ANY of the four queries `isError`
     (`goalsQuery.isError || summaryQuery.isError || companionQuery.isError ||
     milestonesQuery.isError`). Keep the existing "Reintentar" refetch button.
   - Show the **loading panel** only while still pending and not errored.
   - Show the **empty state** ONLY when `goalsQuery.isSuccess` AND the returned goals
     array is empty. Never show empty just because `summary`/`companion` are
     undefined — if the goals query succeeded but summary/companion errored, that's
     the error panel, not empty.
   - Recommended order: `isError` → `isLoading/pending` → `isSuccess && empty` → main.
2. Verify `frontend/src/services/api-client.ts` `request()` throws on a refused
   connection (network TypeError → retries `maxAttempts` then throws
   `FlorecerApiError("NETWORK_ERROR", …)`). It appears correct; if you find any path
   that swallows a network error into a resolved/empty value, fix it and note it.
3. Do not touch `bff/`. Do not change retry/timeout config. No new deps.

**Acceptance criteria (coordinator verifies in-browser — you cannot):**
- [ ] BFF stopped + hard reload of `/dashboard` → "No se pudo cargar Florecer" error
      panel with working Reintentar; NEVER the empty "Aún no tienes metas".
- [ ] BFF running, brand-new user with zero goals → empty "Aún no tienes metas".
- [ ] BFF running, user with ≥1 goal → normal dashboard (unchanged from Task 3).
- [ ] `cd frontend && npm run build` exit 0; `npm test -- --run` still 54/54.
- [ ] Optional but preferred: add a vitest unit test for the render-state selection
      logic (extract a small pure `selectDashboardState(queries)` helper if it makes
      the test clean) covering error / loading / empty / ready.

Write the report to `reports/task-3b-report.md` per the Reporting section, listing
the exact build/test commands you ran and their output, and the manual browser steps
the coordinator must run to check the runtime acceptance boxes.

## Reporting

After each task, output (or write to `reports/task-N-report.md`):
1. **Status:** done / partially done / blocked (+ exact error output if blocked).
2. **Files touched** (paths only) and new dependencies (name + why).
3. **Verification evidence:** the exact commands run and their tail output
   (build, tests, curl transcripts).
4. **Deviations from this spec** and why. Undocumented deviations = rejected review.
5. **Open questions** for the verifier — do not guess on ambiguity, list it.

## Verifier checklist (Fable / Gio)

- Re-run every acceptance checkbox for the delegated task; reject on any red.
- `git diff --stat` — scope creep beyond the task's files is a reject.
- Task 2: verify XP math by hand for one deposit against
  `gamification-engine.ts` constants.
- Task 3: grep for leftover mocks (`sessionStorage`, hardcoded goal arrays).
- Task 4: spot-check 3 shipped assets against their pack's license page.
