# Florecer

[![GitHub](https://img.shields.io/badge/GitHub-Florecer-181717?logo=github)](https://github.com/G10hdz/Florecer)

Gamified financial habit-building app for Spanish-speaking Latin American women (20-35, low-to-mid income). Uses dress-up game mechanics (Infinity Nikki style) + idol culture + companion characters to make saving emotionally rewarding.

## Core Loop

1. User sets financial goal (savings, emergency fund)
2. Real financial progress unlocks avatar cosmetics + achievements
3. Daily streak system for transaction logging
4. Companion reacts to progress (no dialogue v1)
5. Anonymous share cards: "Acabo de ahorrar 50% de mi meta 🎉" (no raw numbers)

## What's Done

- ✅ Complete system architecture (Mermaid diagrams)
- ✅ Data models (6 entities, 2 embedded types)
- ✅ BFF API contract (20 endpoints)
- ✅ Gamification logic spec (XP, streaks, unlocks, mood)
- ✅ React component tree
- ✅ Stack decisions + justification
- ✅ V1 scope boundary (what to build/skip)
- ✅ QA testing surface
- ✅ API service layer (`frontend/src/services/` + `frontend/src/types/api.ts`) — typed HTTP client with retry, goals/transactions/account services, dev/prod env config

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Tailwind + shadcn/ui (Vite, Vercel) |
| BFF | Hono.js on Railway ($5/mo) |
| Auth + DB | Supabase (free tier: 500MB, JWT, RLS) |
| Financial data | Firefly III self-hosted (VPS €3.79/mo) |
| Assets | Cloudflare R2 (10GB free, no egress) |
| Share cards | Satori (no Puppeteer) |
| Avatar gen | Vertex AI Imagen 3 + MuAPI (GCP credits) |
| State | TanStack Query |

## Quick Links

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, Mermaid diagram, data flow
- [STACK.md](./STACK.md) — Stack decisions, why each choice, risks
- [DATA_MODELS.md](./DATA_MODELS.md) — TypeScript interfaces, schemas
- [API.md](./API.md) — BFF endpoint contract
- [GAMIFICATION.md](./GAMIFICATION.md) — XP, streaks, unlocks, mood engine
- [COMPONENTS.md](./COMPONENTS.md) — React component tree
- [ROADMAP.md](./ROADMAP.md) — V1 scope, what to skip, complexity flags
- [frontend/src/services/](./frontend/src/services/) — API client, config, typed service modules
- [frontend/src/types/api.ts](./frontend/src/types/api.ts) — TypeScript interfaces matching DATA_MODELS + API contract

## Sprint Plan (6 weeks)

**Week 1-2:** Auth + Firefly connect + goal creation  
**Week 2-3:** Deposit log + XP + streak  
**Week 3-4:** Avatar wardrobe + unlock pipeline  
**Week 4-5:** Achievements + share card  
**Week 5-6:** Companion widget + mobile QA + polish  

Ship to 10 beta users week 6. Validate assumptions before adding features.

## Critical Validations (Week 1)

- [ ] Satori renders Spanish text + long numbers (MXN/ARS format) correctly
- [ ] Vertex AI Imagen 3 generates transparent-bg PNG layers (or segmentation extraction works)
- [ ] Firefly III PAT auth + piggy bank creation flow (no multi-user OAuth in v1)

## Key Decisions

- **No raw financial amounts in frontend** — only %, XP, progress ratios
- **Streak grace period = 48h** (not 24h) for timezone variance + UX
- **Avatar = CSS layered PNG compositing** (not Canvas) — simpler, mobile-safe
- **Companion v1 = sprite + mood only** (no AI dialogue)
- **Firefly III = required dependency** (friction in onboarding, acceptable for v1 if target = tech-adjacent)

## GCP Credits Strategy

$18k GenAI App Builder credit (exp Apr 2027) covers:
- Vertex AI Imagen 3 avatar generation (~$0.04/image)
- Cloud Run jobs for asset pipeline
- Optional: Vertex API for image segmentation (layer extraction)

Removes artist dependency from critical path.

## What's NOT in V1

- Bank sync (Plaid, TrueLayer) — LATAM coverage bad, expensive
- Debt/investment tracking — different data model
- Social feed/following — full social graph = 3mo work
- Push notifications — PWA phase
- Companion dialogue — v2 with caching
- Multi-currency — v2
- Vision board — cute but not core loop (v2)

---

Author: Bamzc  
Stack locked: 2026-05-08  
Ready to scaffold.
