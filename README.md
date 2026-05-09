# Florecer

[![GitHub](https://img.shields.io/badge/GitHub-Florecer-181717?logo=github)](https://github.com/G10hdz/Florecer)

A gamified savings app that makes building financial habits feel rewarding. Track goals, earn XP, unlock cosmetics for your avatar companion, and celebrate progress — not just the numbers.

## What It Does

- **Set savings goals** and track progress visually
- **Log deposits** to earn XP and build streaks
- **Unlock avatar cosmetics** as milestones are reached
- **Companion mood** reacts to your consistency — stay on track and it thrives
- **Share achievements** anonymously — "Just saved 50% of my goal!" (no raw amounts)
- **Impulse Swap** — one-tap converts impulse spending into savings deposits

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS + shadcn/ui (Vite) |
| BFF | Hono.js |
| Auth + DB | Supabase (JWT, RLS) |
| Financial data | Firefly III (self-hosted) |
| Assets | Cloudflare R2 |
| Share cards | Satori |
| Avatar gen | Vertex AI Imagen |
| State | TanStack Query |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design and data flows.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Button, Input, Badge, Toast, Spinner, Tooltip, Avatar
│   │   ├── molecules/   # XPBar, StreakBadge, MoodBar, ProgressBar, CosmeticCard, etc.
│   │   ├── organisms/   # VisionBoard, ImpulseSwap, GoalCard, AvatarPreview, etc.
│   │   └── pages/       # DashboardPage, LoginPage, OnboardingPage, WardrobePage, etc.
│   ├── contexts/        # AuthContext
│   ├── lib/             # gamification-engine.ts, pixel-art-assets.ts, utils
│   ├── services/        # API client, goals, transactions, account
│   └── types/           # TypeScript interfaces
└── public/
```

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your values.

## Tests

```bash
cd frontend
npm test
```

## Design Principles

- **Positive reinforcement only** — no guilt mechanics, streak penalties are soft resets
- **Privacy by default** — no raw financial amounts in the frontend, only percentages and XP
- **Mobile-first** — CSS-layered avatar compositing (no Canvas), lightweight asset delivery
- **Companion v1** — sprite + mood only (AI dialogue planned for v2)

## License

MIT