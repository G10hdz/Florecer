# Florecer — Session Summary (for Fable on return)

_Last updated: 2026-07-08. Written by Opus after Fable ran out of budget mid-Task-3
verification. Coordinator = whoever has the browser + can run dev servers._

## Where we are

Building out Florecer (gamified savings app) from a frontend-only repo toward a
working end-to-end demo, following the 4-task plan in `HANDOFF.md`. Work is delegated
to codex (cheap), coordinator verifies. Progress reports live in `reports/task-*.md`.

| Task | What | Status |
|---|---|---|
| 1 | Frontend green baseline (build + tests) | ✅ DONE, verified (build 0, 54/54 tests) |
| 2 | Minimal Hono BFF in `bff/` (15 endpoints, JWT, node:sqlite, gamification engine) | ✅ DONE, verified (curl happy path, XP math checked) |
| 3 | Wire frontend → BFF (real auth, TanStack Query, no mocks) | ✅ DONE — happy path verified in-browser; error-state bug fixed in 3b |
| 3b | Fix dashboard error-vs-empty state | ✅ FULLY DONE — verified end-to-end in-browser (all 3 states), 60/60 tests |
| 4 | Asset integration pipeline | ⏳ Not started — needs Gio to download packs first |

**Task 3b had a second, deeper bug** found during in-browser verify: with the BFF
down the dashboard spun forever (never reached the error panel). Cause: react-query v5
*pauses* an unreachable-server query (`fetchStatus:'paused'`, stays `pending`) instead
of erroring; `networkMode:'always'` did NOT clear it. Fix: `selectDashboardState` now
treats a paused query as error (`DashboardPage.tsx`), plus `networkMode:'always'` on
queries+mutations so deposits fail-fast. All 3 states confirmed live (error panel →
Reintentar recovers → normal dashboard). Details in `reports/task-3b-report.md`.

**Immediate next action:** Task 4 (assets) is the only remaining plan item — blocked on
Gio downloading the vetted packs from `frontend/ASSET_PACKS.md` (Mana Soul GUI +
Brackeys VFX are CC0 = start here).

## The Task 3b bug (what Opus handed to codex)

With the BFF down, `DashboardPage.tsx` shows the empty state "Aún no tienes metas"
instead of the "No se pudo cargar Florecer" error panel. Cause: empty-state guard
`if (!focusedGoal || !companion || !summary)` conflates fetch-failure with genuinely
empty. Fix spec is in HANDOFF.md Task 3b: gate empty on `goalsQuery.isSuccess` +
empty array, show error on any query `isError`, canonical precedence
error → loading → empty → ready. Codex can't reproduce (no network/browser in its
sandbox), so **coordinator must re-verify in-browser** after codex's code fix:
build+tests, then BFF-down reload shows error panel, BFF-up empty user shows empty,
BFF-up with goals shows dashboard.

## Environment gotchas learned this session (important)

- **Codex sandbox has NO network** — cannot `npm install`, run dev servers, or drive
  a browser. Delegates write code + list verify commands; coordinator runs them.
- **Claude Code's package security scanner blocks installs of any dep with an OSV
  advisory.** Had to bump: frontend `vite ^8.0.16`, `react-router-dom ^7.15.1`,
  `@babel/core ^7.29.6` (override); bff `hono ^4.12.18` (the advisory was in JWT
  validation), `@hono/node-server ^1.19.13`, `vitest ^4.1.5`. Expect more of these
  on any new install — check https://api.osv.dev/v1/vulns/<GHSA-id> for the fixed
  version and bump.
- **hono 4.12 requires explicit `alg`**: `jwt({ secret, alg: "HS256" })`.
- **node:sqlite** (built-in, Node 22.22.3) is used instead of better-sqlite3
  (native install scripts are blocked). Works fine.
- zsh gotcha during curl verify: `GID` is a reserved/numeric var — use `GOAL_ID`.

## How to run the demo locally

Terminal 1: `cd bff && npm run dev`  (serves :8787)
Terminal 2: `cd frontend && npm run dev`  (serves :5173)
`frontend/.env.local` already points VITE_BFF_URL at localhost:8787.
Verified UI flow: register → onboarding (any PAT, stubbed) → create goal →
dashboard shows real BFF data → deposit → "+XP registrado desde el BFF" toast,
XP = amount × streak multiplier (500 → +600 at 1.2×).

## Next steps after 3b lands

1. Coordinator: verify codex's 3b fix in-browser (steps above). If green, mark Task 3
   fully done in task-3-report.md.
2. Task 4 (assets): blocked on Gio downloading the vetted packs in
   `frontend/ASSET_PACKS.md` (Tiny RPG Mana Soul GUI + Brackeys VFX are CC0 =
   zero-friction start). Then delegate the import/normalize script.
3. Open scope not yet built (from ARCHITECTURE.md, all deferred/stubbed): real
   Supabase auth, Firefly III proxy, R2 assets, Satori share cards, Vertex avatar
   gen. Avatar + companion (La Semilla) art is Vertex/hand-drawn scope, NOT itch.io.

## Notes / open decisions

- Gamification engine is currently DUPLICATED: `frontend/src/lib/gamification-engine.ts`
  and `bff/src/lib/gamification-engine.ts` (verbatim copy w/ header comment). Fine for
  now; extract to a shared package later (flagged in HANDOFF Task 2.4).
- Dashboard derives display-only fields (vision_image_url, priority, emoji) locally
  because the BFF Goal contract doesn't include them — acceptable per Task 3 report.
- A frontend dev server may still be running on :5173 from verification; BFF on :8787
  was killed. Restart both to demo.
