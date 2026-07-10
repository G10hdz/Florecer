# Florecer — Session Summary (for Fable on return)

_Last updated: 2026-07-10. All 4 HANDOFF tasks + Task 4b and lint cleanup are done.
Branch `G10hdz/feat/bff-and-frontend-wiring` is 7 commits ahead of local `main`,
NOT yet pushed. Coordinator = whoever has the browser + can run dev servers._

## Where we are

Building out Florecer (gamified savings app) from a frontend-only repo toward a
working end-to-end demo, following the 4-task plan in `HANDOFF.md`. Work is delegated
to codex (cheap), coordinator verifies. Progress reports live in `reports/task-*.md`.

| Task | What | Status |
|---|---|---|
| 1 | Frontend green baseline (build + tests) | ✅ DONE, verified (build 0, 54/54 tests) |
| 2 | Minimal Hono BFF in `bff/` (15 endpoints, JWT, node:sqlite, gamification engine) | ✅ DONE, verified (curl happy path, XP math checked) |
| 3 | Wire frontend → BFF (real auth, TanStack Query, no mocks) | ✅ DONE — happy path verified in-browser; error-state bug fixed in 3b |
| 3b | Fix dashboard error-vs-empty state | ✅ FULLY DONE — verified end-to-end in-browser (all 3 states) |
| 4 | Asset integration pipeline | ✅ DONE, verified in-browser (commit `77cf90a`) |
| 4b | Show pixel-art goal icons on dashboard | ✅ DONE, verified in-browser, 72/72 tests (commit `f0b59ae`) |
| Lint | Resolve inherited frontend lint errors | ✅ DONE — lint/build green, 72/72 tests (`2317fe2`) |

**Task 3b had a second, deeper bug** found during in-browser verify: with the BFF
down the dashboard spun forever (never reached the error panel). Cause: react-query v5
*pauses* an unreachable-server query (`fetchStatus:'paused'`, stays `pending`) instead
of erroring; `networkMode:'always'` did NOT clear it. Fix: `selectDashboardState` now
treats a paused query as error (`DashboardPage.tsx`), plus `networkMode:'always'` on
queries+mutations so deposits fail-fast. All 3 states confirmed live (error panel →
Reintentar recovers → normal dashboard). Details in `reports/task-3b-report.md`.

**Task 4** (commit `77cf90a`): `frontend/scripts/import-assets.mjs` is an idempotent
sharp-based importer — 51 Mana Soul GUI sheets → `ui/`, 42 Brackeys VFX → `celebrations/`,
14 Shikashi icons sliced by sheet coords → `goals/`. Raw pack sources live in gitignored
`assets-src/`. `CREDITS.md` carries CC-BY attribution (Matt Firth/shikashipx,
game-icons.net) linked from a new app footer. A `CelebrationBurst` overlay plays the
`star_explosion` spritesheet once on successful deposit. Added `sharp` as dev dep.

**Task 4b** (commit `f0b59ae`): `getGoalIconUrlByName` maps goal names to the 14 Shikashi
icons (accent-insensitive, word-boundary keyword matching to avoid false positives like
'ia' inside 'viaje'; `coin_stack` fallback). Rendered via `PixelArtSprite` in the
focused-goal header, `VisionGrid` cards, and `ImpulseSwap`, replacing the generic emoji.
+12 mapper unit tests → 72/72 total. Spec in `reports/task-4b-spec.md`.

**Lint cleanup** (commit `2317fe2`): fixed all 29 inherited ESLint errors without
disabling rules. React-only modules now keep contexts, hooks, CVA variants, constants,
and pure dashboard state in separate files; synchronous effect state was replaced with
derived state or lazy initialization. Fresh verification: lint/build green, frontend
72/72 tests, BFF build + 2/2 tests.

**Immediate next action:** push the branch and open a PR to `main` — there is no
upstream set and no PR yet. After merge, only deferred/stubbed scope remains.

## Commits on this branch (ahead of origin/main)

```
2317fe2 fix(frontend): Resolve lint errors
810ba07 docs: Complete session handoff
f0b59ae feat(frontend): Show pixel-art goal icons on dashboard   (Task 4b)
77cf90a feat(frontend): Add pixel-art asset pipeline + deposit celebration (Task 4)
0541d9f docs: Add handoff plan and task reports
3bd8bb1 feat(frontend): Wire frontend to BFF with real auth + TanStack Query (Task 3)
3b4d83f feat(bff): Add minimal Hono BFF with gamification engine  (Task 2)
```
(Task 1 baseline + README rewrite already landed on `main` before this branch.)

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
dashboard shows real BFF data + pixel-art goal icon → deposit → "+XP registrado
desde el BFF" toast + `CelebrationBurst`, XP = amount × streak multiplier.

## Next steps

1. **Push branch + open PR** to `main`: `git push -u origin G10hdz/feat/bff-and-frontend-wiring`.
2. After merge → open scope not yet built (from `ARCHITECTURE.md`, all deferred/stubbed
   behind the BFF): real Supabase auth, Firefly III proxy, R2 assets, Satori share
   cards, Vertex avatar gen. Avatar + companion (La Semilla) art is Vertex/hand-drawn
   scope, NOT itch.io packs.

## Notes / open decisions

- Gamification engine is currently DUPLICATED: `frontend/src/lib/gamification-engine.ts`
  and `bff/src/lib/gamification-engine.ts` (verbatim copy w/ header comment). Fine for
  now; extract to a shared package later (flagged in HANDOFF Task 2.4).
- Dashboard derives display-only fields (vision_image_url, priority, emoji) locally
  because the BFF Goal contract doesn't include them — acceptable per Task 3 report.
- Goal icons now come from `getGoalIconUrlByName`; the legacy `getPixelAssetUrl`/
  `getGoalIconUrl` flat-path helpers in `pixel-art-assets.ts` are superseded (do not use).
