# Learnings

### 2026-07-10 — React lint cleanup without rule suppression
- **Problem**: React 19 lint rules reported mixed Fast Refresh exports, synchronous state updates in effects, and impure time reads during render.
- **Root cause**: Component modules also exported contexts, hooks, CVA variants, constants, and pure helpers; some UI state duplicated values derivable from props/query data.
- **Fix**: Move non-component exports to `.ts` modules, derive transient state, initialize persisted state lazily, and capture time once per mount.
- **Lesson**: Preserve lint guarantees by fixing module boundaries and state ownership instead of disabling React rules.
