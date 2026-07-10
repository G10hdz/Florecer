# Task 3b Report — Fix dashboard error-vs-empty state

## 1. Status

done

Implemented the dashboard render-state precedence required by `HANDOFF.md`:

`isError` -> `pending` -> `isSuccess && empty` -> `ready`

The BFF-down/network-error path now resolves to the existing `"No se pudo cargar Florecer"` error panel before the empty-goals state can render.

## 2. Files touched and new dependencies

- `frontend/src/components/pages/DashboardPage.tsx`
  - Added `selectDashboardState(...)`, a pure render-state selector using React Query v5 flags.
  - Updated render branching so any query error wins over pending/empty states.
  - Changed the empty state to render only when `goalsQuery.isSuccess` and the goals array is empty.
  - Kept the existing retry button behavior for the error panel.
- `frontend/src/components/pages/DashboardPage.test.tsx`
  - Added focused Vitest coverage for error, pending, empty, and ready state precedence.
- `reports/task-3b-report.md`
  - This report.

New dependencies: none.

`frontend/src/services/api-client.ts` was not changed for Task 3b. I audited `request()` and did not find a concrete swallowed network/fetch-error path: refused connections surface as `TypeError`, idempotent GETs retry, and after `maxAttempts` the function throws `FlorecerApiError("NETWORK_ERROR", ...)`, which React Query surfaces as `isError`.

## 3. Verification evidence

Command:

```sh
cd frontend && npm run build
```

Full output:

```text

> frontend@0.0.0 build
> tsc -b && vite build

vite v8.1.3 building client environment for production...
[2Ktransforming...✓ 1831 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/hero-CLDdwZDr.png    13.05 kB
dist/assets/index-DCF8R-N8.css   39.71 kB │ gzip:   7.23 kB
dist/assets/index-MjSY8B9g.js   362.22 kB │ gzip: 110.31 kB

✓ built in 212ms
```

Command:

```sh
cd frontend && npm test -- --run
```

Full output:

```text

> frontend@0.0.0 test
> vitest run --run


 RUN  v4.1.5 /Users/gio/projects/G10hdz/Florecer/frontend


 Test Files  2 passed (2)
      Tests  59 passed (59)
   Start at  13:33:17
   Duration  268ms (transform 141ms, setup 0ms, import 234ms, tests 9ms, environment 0ms)

```

## 4. Deviations from this spec

None.

I did not run browser/BFF runtime verification because the task environment explicitly says no dev server/browser is available here.

## 5. Open questions

None for implementation.

Coordinator manual runtime checks still required:

1. Stop the BFF, hard reload `/dashboard`, and confirm the `"No se pudo cargar Florecer"` panel appears with `Reintentar`; confirm `"Aún no tienes metas"` never appears in this BFF-down case.
2. Start the BFF, log in/register as a brand-new user with zero goals, and confirm `"Aún no tienes metas"` appears.
3. Start the BFF, use a user with at least one goal, and confirm the normal dashboard remains unchanged from the verified Task 3 happy path.
4. On the BFF-down screen, start the BFF and click `Reintentar`; confirm the queries refetch and the dashboard/empty state updates according to the account data.

---

## Verifier resolution (coordinator, 2026-07-08 — Opus)

Code review: `selectDashboardState` (DashboardPage.tsx:57) implements canonical
precedence error → pending → empty(only if `goalsQuery.isSuccess && goals.length===0`)
→ ready, and is wired into the render at lines 204/232/243. Exported + unit-tested.

Verified:
- `npm run build` exit 0; `npm test -- --run` 59/59 (2 files) — re-run by coordinator.
- Fix premise (headless): `fetch` to a refused port rejects with `TypeError`
  (cause ECONNREFUSED). This is what api-client `isNetworkError()` catches → retries →
  throws `FlorecerApiError("NETWORK_ERROR")` → react-query `isError` → state "error".
  Full chain confirmed; empty state can no longer mask a fetch failure.
- Live BFF happy path intact post-refactor: register→create goal→GET /goals=1,
  health 200, no-auth 401.

PENDING (external blocker, not a code issue): the on-screen visual check of the three
dashboard states is not done because the Chrome extension is disconnected. Servers are
left running (bff :8787, frontend :5173). To eyeball, with both up:
  1. Log in, open /dashboard with ≥1 goal → normal dashboard.
  2. Kill BFF (`lsof -ti :8787 | xargs kill`), hard-reload /dashboard → after ~6s
     shows "No se pudo cargar Florecer" error panel + Reintentar (NOT "Aún no tienes
     metas"). This is the bug that was fixed.

**Task 3b: code + logic verified; visual browser confirmation pending Chrome reconnect.**
**Task 3: DONE (happy path verified in-browser earlier; error-state fixed & logic-verified).**

---

## Deeper bug found & fixed during in-browser verification (coordinator, Opus)

The first 3b fix (empty→error precedence) was necessary but NOT sufficient. Live
browser test with BFF down revealed the dashboard span the loading spinner
**forever** and never reached the error panel.

Root cause (confirmed by inspecting the live react-query cache via the page):
all four queries settled at `status:'pending'`, `fetchStatus:'paused'`,
`failureCount:1`, `error:null`. This is react-query v5 pausing an unreachable-server
query instead of erroring — `selectDashboardState` saw `isPending` and returned
"pending" indefinitely. Verified the resolved query `networkMode` and that
`navigator.onLine === true`; setting `networkMode:'always'` on the QueryClient did
NOT clear the pause in this version (confirmed resolvedNetworkMode='always' yet still
paused).

Fix (two parts):
1. `DashboardPage.tsx` `selectDashboardState`: treat a paused query as "error"
   (added `isPaused?` to the query-state type; guard runs right after the isError
   check). This is version-independent and load-bearing.
2. `main.tsx`: kept `networkMode:'always'` for queries+mutations (makes a deposit
   fail-fast with an error toast when the BFF is down, instead of hanging); comment
   corrected to state the query pause still needs the selector guard.

Verified in live browser (BFF killed/restarted, servers on :8787/:5173):
- BFF down + reload → "No se pudo cargar Florecer" error panel + Reintentar (~7s). ✓
  (previously: infinite spinner)
- Click Reintentar after restarting BFF → recovers to real dashboard
  (Laptop nueva 500/20,000, 2.5%). ✓
- BFF up with goals → normal dashboard. ✓ (verified earlier)
- `npm run build` exit 0; `npm test -- --run` 60/60 (added a paused-state unit test).

**Task 3b: FULLY DONE — verified end-to-end in-browser. Task 3 complete.**
