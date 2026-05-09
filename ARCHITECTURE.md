# Architecture: Florecer

**System Design & Data Flows**

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  React + TypeScript + Tailwind + shadcn/ui (Vite, Vercel CDN) │
│  TanStack Query (server state management)                       │
│  src/services/ (typed API client, retry, env-based config)     │
│  - Auth Guard + Protected Routes                                │
│  - Goal Creation & Dashboard                                    │
│  - Deposit Logger                                               │
│  - Avatar Wardrobe (CSS layered PNG compositing)               │
│  - Companion Widget (sprite + mood)                            │
│  - Share Card Generator                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BFF LAYER (Hono.js)                          │
│              Railway ($5/mo) | 20+ endpoints                    │
│  - Auth Gateway (Supabase JWT validation + PAT handling)       │
│  - Firefly III Proxy (rate limit + transform)                  │
│  - Gamification Engine (XP + streak + unlock logic)            │
│  - Avatar Generation Pipeline (Vertex AI trigger)               │
│  - Share Card Renderer (Satori PDF → PNG)                      │
│  - Mood Engine (companion updates)                             │
└────┬────────────────┬────────────────┬──────────────┬───────────┘
     │                │                │              │
     ▼                ▼                ▼              ▼
┌───────────┐  ┌────────────────┐  ┌──────────┐  ┌──────────────┐
│ Supabase  │  │  Firefly III   │  │   GCP    │  │ Cloudflare   │
│ (free)    │  │  (Hetzner VPS) │  │ Vertex   │  │      R2      │
│           │  │   €3.79/mo     │  │   AI     │  │  (10GB free) │
│ - Auth    │  │                │  │          │  │              │
│ - DB      │  │ - Piggy banks  │  │ - Imagen │  │ - Asset CDN  │
│ - RLS     │  │ - Txn logs     │  │   3      │  │ - Avatar PNGs│
│ - Session │  │ - Category map │  │ - Layer  │  │ - Share PNG  │
│           │  │                │  │   extract│  │              │
└───────────┘  └────────────────┘  └──────────┘  └──────────────┘
```

---

## Primary Data Flows

### Flow 1: User Onboarding → Goal Creation

```
1. Frontend: User email signup
   └─> POST /auth/register (Supabase)
       ├─ Create user row
       ├─ Mint JWT (3600s expiration)
       └─ Return token + user_id

2. Frontend: Firefly PAT entry (encrypted in browser)
   └─> POST /firefly/set-pat
       ├─ BFF validates PAT format
       ├─ AES-256 encrypt (key = user_id[:16])
       ├─ Store in supabase.users.firefly_pat_encrypted
       └─ Test Firefly connectivity (piggy bank list)

3. Frontend: Goal creation form (goal_name, target_amount, deadline)
   └─> POST /goals/create
       ├─ BFF: Validate amount > 0, deadline > now
       ├─ BFF: Create Firefly piggy bank (via decrypted PAT)
       ├─ BFF: Store goal in supabase.goals
       └─ Return goal_id + milestone_map

4. Frontend: Redirect to dashboard
   └─ Show: Goal progress, companion (idle mood), empty deposit log
```

### Flow 2: Deposit Logging → Streaks & Unlocks

```
1. Frontend: User logs deposit (currency auto-detected)
   └─> POST /deposits/log
       ├─ BFF: Convert to MXN/ARS (via Firefly live rates if needed)
       ├─ BFF: Create transaction in Firefly (category = "savings")
       ├─ BFF: Fetch updated goal progress from Firefly

2. BFF: Calculate XP + Streak
   ├─ XP = deposit_amount_normalized * 10 * (1 + 0.1 * current_streak)
   ├─ Fetch last_deposit_at
   ├─ If (now - last_deposit_at) > 48h → reset streak to 1
   ├─ Else → streak += 1
   └─> Store in gamification.deposits log

3. BFF: Check milestone unlocks
   ├─ Fetch cosmetic_milestones for goal
   ├─ If XP >= next_milestone.xp_threshold:
   │  ├─ Create cosmetic_unlocked row
   │  ├─ Trigger Vertex AI batch (if batch_size reached)
   │  └─ Push unlock notification
   └─ Return new cosmetics list

4. BFF: Update companion mood
   ├─ Fetch companion_mood.current
   ├─ mood += 5 (deposit reward)
   ├─ If milestone_unlocked: mood += 10
   ├─ Cap at 100
   └─> Store updated mood

5. Frontend: Update dashboard
   ├─ Show: XP bar, streak counter, new cosmetics (locked → unlocked)
   ├─ Animate companion mood change
   └─ Refresh goal progress %
```

### Flow 3: Avatar Cosmetics → Generation & Share

```
1. Frontend: User selects cosmetic combo (hat + dress + accessory)
   └─> POST /avatar/compose
       ├─ BFF: Validate user owns all selected cosmetics
       └─ Store selection in cosmetics_applied

2. BFF: Batch cosmetic generation (async)
   ├─ Every 10 unique combos or every 6h:
   │  ├─ Queue to Vertex AI Imagen 3 (prompt = "transparent PNG layer: [cosmetic description]")
   │  ├─ Download PNG from MuAPI
   │  └─ Upload to Cloudflare R2 (key = cosmetic_id.png)
   │
   └─ Return placeholder URL

3. Frontend: Render avatar
   ├─ Fetch base_avatar.png + cosmetic layers from R2
   ├─ CSS z-index layering (base → clothing → accessories)
   └─ Cache in localStorage (24h TTL)

4. Frontend: User creates share card
   └─> POST /share/create
       ├─ BFF: Query current goal progress (%) + XP
       ├─ BFF: Render to image (Satori: "Acabo de ahorrar 50% de mi meta 🎉")
       ├─ Upload PNG to R2 (key = share_cards/{user_id}/{timestamp}.png)
       └─ Return shareable URL + social preview
```

---

## Authentication & Authorization

### JWT Flow (Supabase)
```
1. POST /auth/register or /auth/login
   ├─ Supabase verifies email (magic link or password)
   └─ Returns JWT: { sub: user_id, exp: now+3600, iss: "supabase" }

2. Frontend: Store JWT in sessionStorage (NOT localStorage)
   └─ Auto-refresh 5min before expiration

3. All BFF requests: Include Authorization: Bearer <JWT>
   └─> Hono middleware: jwtVerify(token, supabase_secret)
```

### Firefly PAT Encryption
```
1. User enters PAT on frontend
   ├─ Frontend: AES-256 encrypt (key = user_id[:16])
   └─ POST /firefly/set-pat { encrypted_pat }

2. BFF: Decrypt PAT only when needed
   ├─ Fetch supabase.users.firefly_pat_encrypted
   ├─ Decrypt: AES-256 decrypt (key = user_id[:16])
   └─ Use for Firefly API calls (no logging)

3. PAT never stored in plaintext anywhere
```

### Row-Level Security (Supabase)
```
-- Policies enforce: users can only access their own data

ALTER TABLE users ENABLE RLS;
CREATE POLICY "Users see own row"
  ON users FOR SELECT
  USING (auth.uid() = id);

ALTER TABLE goals ENABLE RLS;
CREATE POLICY "Users see own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE cosmetics_unlocked ENABLE RLS;
CREATE POLICY "Users see own cosmetics"
  ON cosmetics_unlocked FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE cosmetics_applied ENABLE RLS;
CREATE POLICY "Users see own applied cosmetics"
  ON cosmetics_applied FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Gamification Engine

### XP Calculation
```
baseXP = deposit_amount * 10  (normalized to 100-point scale)
streakMultiplier = 1 + (0.1 * current_streak)
totalXP = baseXP * streakMultiplier

Example:
  - Deposit: 500 MXN, streak: 0
    baseXP = 500 * 10 = 5000 (raw units)
    streakMultiplier = 1.0
    totalXP = 5000 (stored normalized as ~50 on progress bar)

  - Deposit: 500 MXN, streak: 5
    baseXP = 5000
    streakMultiplier = 1.5
    totalXP = 7500 (50% boost from streak)
```

### Streak Logic
```
Grace period = 48 hours

if (now - last_deposit_at) > 48h:
  streak = 1  (reset, user gets fresh start)
else:
  streak += 1  (continue chain)

Companion mood penalty for broken streak = -20 (small encouragement to return)
```

### Milestone Unlocks
```
milestones = [
  { xp_threshold: 500, cosmetic_id: "hat_1", emoji: "🎩" },
  { xp_threshold: 1500, cosmetic_id: "dress_1", emoji: "👗" },
  { xp_threshold: 3000, cosmetic_id: "shoes_1", emoji: "👠" },
  { xp_threshold: 5000, cosmetic_id: "accessory_1", emoji: "💍" }
]

When user_xp >= milestone.xp_threshold and cosmetic not already unlocked:
  ├─ Insert cosmetics_unlocked row
  ├─ Trigger Vertex AI generation (if batch ready)
  ├─ Companion mood += 10
  └─ Send unlock notification
```

### Companion Mood Engine
```
Mood range: 0-100

Actions that affect mood:
  - Deposit logged: +5
  - Milestone unlocked: +10
  - Streak broken (no deposit in 48h): -20
  - Avatar customized: +3
  - Share created: +2
  - Weekly check-in (idle for 7 days): -5

Mood stays capped at 100 (no "overflow" mood points)
Mood displayed to user as visual bar + emoji:
  0-25: 😢 (sad)
  26-50: 😐 (neutral)
  51-75: 🙂 (happy)
  76-100: 😍 (excited)
```

---

## Error Handling Strategy

### Frontend Validation
```
- Goal amount > 0, deadline > now
- Deposit amount > 0, format valid
- PAT format matches Firefly pattern (alphanumeric, 24+ chars)
- Cosmetic combo ownership verified (already locked when selecting)
- Rate limiting on requests (max 5 per 10s per user)
```

### API Client (`src/services/api-client.ts`)
```
- FlorecerApiError class: parses BFF error format into { code, message, status }
- Exponential backoff: 3 retries (1s → 2s → 4s), capped at 10s
- Retry scoping: idempotent methods (GET/HEAD/OPTIONS) or network errors only
- Immediate throw: 401 (unauthorized), 403 (forbidden) — no retry
- AbortController timeout: 15s default per request
- Error body parsing: falls back to { code: "UNKNOWN" } if JSON parse fails
```

### BFF Validation & Error Codes
```
400 Bad Request:
  - Invalid request body
  - Goal date in past
  - Deposit amount ≤ 0

401 Unauthorized:
  - JWT expired or invalid
  - User not authenticated

403 Forbidden:
  - User trying to access another user's goal
  - Cosmetic not owned by user

404 Not Found:
  - Goal does not exist
  - Cosmetic does not exist

429 Too Many Requests:
  - Rate limit exceeded (BFF layer)

500 Internal Server Error:
  - Firefly API down or timeout
  - Supabase error
  - Vertex AI generation failed (queued for retry)

Retry strategy:
  - Client: GET/HEAD/OPTIONS retry with exponential backoff (idempotent)
  - Client: POST with network errors retried; 4xx/5xx with body never retried
  - BFF: Log all failures to Supabase error_logs table
  - BFF: Async tasks (Vertex AI) fail gracefully → user sees "generating" placeholder
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (Frontend)                      │
│  - Next.js/React build output                              │
│  - Global CDN edge caching (static assets)                  │
│  - Environment: VITE_BFF_URL, VITE_R2_URL                 │
│  - Logs: Vercel Analytics + Sentry                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Railway (BFF / Hono.js)                    │
│  - Node.js runtime ($5/mo for CPU + memory)                │
│  - Environment: SUPABASE_URL, SUPABASE_ANON_KEY,           │
│                FIREFLY_BASE_URL, VERTEX_API_KEY,            │
│                R2_ENDPOINT, R2_BUCKET, R2_KEY_ID,           │
│                R2_SECRET                                    │
│  - Logs: Railway built-in + structured JSON to Supabase    │
│  - Health check: GET /health → { status: "ok" }            │
└────────┬──────────────────┬──────────┬──────────────────────┘
         │                  │          │
         ▼                  ▼          ▼
    ┌─────────────┐  ┌────────────┐  ┌─────────────┐
    │  Supabase   │  │   Hetzner  │  │ GCP Vertex  │
    │  (free)     │  │   (€3.79)  │  │    (credits)│
    └─────────────┘  └────────────┘  └─────────────┘
         │                │                  │
         ▼                ▼                  ▼
    ┌─────────────────────────────────────────────┐
    │       Cloudflare R2 (Asset CDN)             │
    │  - Avatar PNGs (base + cosmetics)           │
    │  - Share cards (Satori-rendered images)     │
    │  - 10GB free tier, no egress charges        │
    └─────────────────────────────────────────────┘
```

### Environment Variable Management
```
Frontend (.env.local):
  VITE_BFF_URL=http://localhost:8787          # dev default (local Hono.js)
  VITE_R2_URL=https://r2-cdn-dev.florecer.com # dev CDN
  VITE_ENV=dev                                # "dev" | "production"
  VITE_SENTRY_DSN=https://...                 # optional in dev

Production overrides (Vercel):
  VITE_BFF_URL=https://florecer-bff.railway.app
  VITE_R2_URL=https://r2-cdn.florecer.com
  VITE_ENV=production

BFF (.env on Railway):
  NODE_ENV=production
  SUPABASE_URL=https://[project].supabase.co
  SUPABASE_ANON_KEY=[public key]
  SUPABASE_SERVICE_ROLE_KEY=[secret key]
  FIREFLY_BASE_URL=https://[vps-ip]:8080
  VERTEX_API_KEY=[gcp service account key]
  VERTEX_PROJECT_ID=[gcp project id]
  R2_ENDPOINT=https://[account].r2.cloudflarestorage.com
  R2_BUCKET=florecer-assets
  R2_KEY_ID=[cloudflare api token id]
  R2_SECRET=[cloudflare api token secret]
  LOG_LEVEL=info
  RATE_LIMIT_PER_10S=5
```

Config resolution (`src/services/config.ts`):
  - `localhost` hostname → "dev"
  - `VITE_ENV=production` → "prod"
  - `import.meta.env.MODE === "production"` → "prod"
  - Falls back to "dev"
  - `VITE_BFF_URL` / `VITE_R2_URL` env vars override compiled defaults at runtime

### Monitoring & Logging
```
Frontend:
  - Sentry error tracking (JS errors, network failures)
  - Vercel Analytics (Core Web Vitals, page load times)
  - localStorage: error capture for offline detection
  - FlorecerApiError thrown by services — components catch with useQuery/Mutation error handlers

BFF:
  - Structured JSON logs to Supabase (error_logs table)
  - Railway native logs (stdout/stderr)
  - Circuit breaker for Firefly (fail fast if unavailable)
  - Health check endpoint for Railway autoscaling

Database:
  - Supabase built-in metrics (query performance)
  - RLS policy audit logs
  - Backup snapshots (daily, 7-day retention on free tier)
```

---

**Author:** Bamzc  
**Last Updated:** 2026-05-08  
**Status:** Architecture locked, ready for implementation
