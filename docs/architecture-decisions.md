# Architecture Decisions (Locked for Approval)

**Status:** Decision document only — **no code**.  
**Branch:** `docs/local-development-setup`  
**Date:** 2026-07-30  
**Depends on:** `docs/architecture-roadmap.md`, `docs/project-analysis.md`

---

## Non‑Negotiable Constraint (Regression Guard)

> **Do not modify any existing page unless necessary.**  
> Build new functionality so existing pages keep working. Gradually replace mock data with APIs.  
> Keep **`ProductCard`**, **`FeedPost`**, **`StoriesStrip`**, **`TopBar`**, **`BottomNav`**, and the current design system **unchanged** unless explicitly approved.

Implications:

- New work lands in **`src/lib/api/`**, **`src/context/`**, **`src/app/api/`** (if chosen), new routes (e.g. dashboard), and optional new media components.
- UI components keep receiving the **same TypeScript shapes** (`Product`, `FeedPostData`, `DesignerHouse`, …).
- Contexts (`useData`, `useCart`, `useWishlist`) remain the **UI data API**; pages should not sprout ad‑hoc `fetch` calls.
- `mock-data.ts` stays as fallback until each domain is cut over.

---

# 1. Media Architecture

## Decision summary

| Question | Locked recommendation |
|----------|----------------------|
| Where uploaded? | **Cloudinary** (already allowlisted in `next.config.ts`) via **signed client upload** or short‑lived signed params from our API |
| How URLs stored? | **HTTPS URL strings** on entities — same as today (`Product.images[]`, `logo`, `banner`, feed/story image fields) |
| Feed pagination? | **Cursor-based** API; client **infinite scroll** behind a feed data layer — **`FeedPost` UI unchanged** |

---

### 1.1 Where will images/videos be uploaded?

**Recommendation: Cloudinary as primary media store.**

**Why this fits the current app**

- `next.config.ts` already allows `res.cloudinary.com`.
- Admin already expects **pasteable HTTPS URLs**; upload should only automate filling those fields.
- Avoids bloating a Postgres/blob column and keeps `next/image` working with zero Product shape change.

**Flow (no page rewrite required)**

```
Designer Dashboard / Admin form
  → request signed upload (API)
  → upload file directly to Cloudinary
  → receive secure_url
  → write URL into form state (logo / images[] / post.image / slide.image|videoUrl)
  → save entity via existing DataContext mutation → later real API
```

**Alternatives considered**

| Option | Verdict |
|--------|---------|
| Supabase Storage / S3 | Fine later; would need new `remotePatterns`. Prefer one CDN first. |
| Store files in Next.js `/public` or DB BYTEA | Reject — not scalable; breaks current URL model. |
| Upload only through Nest/FastAPI proxy | Optional later; signed direct upload is lighter for MVP. |

**Video:** same pipeline, `resource_type: video`, store resulting URL on extended optional fields (`videoUrl` / `mediaType`) — **additive** to `types.ts`, not a parallel media model forced into every component on day one.

---

### 1.2 How will media URLs be stored?

**Recommendation: Keep the current URL-string model as the source of truth for UI.**

| Entity field (today) | Storage |
|----------------------|---------|
| `DesignerHouse.logo`, `.banner` | `text` URL |
| `Product.images` | `text[]` / JSON array of URLs |
| `FeedPostData.image` | `text` URL |
| `StorySlide.image` | `text` URL |
| Future `videoUrl` | optional `text` URL |

**Optional `media_assets` table** (backend bookkeeping only):

- `id`, `public_id`, `url`, `kind` (`image`\|`video`), `width`, `height`, `duration`, `uploader_user_id`, `created_at`
- Entities **reference URL** (and optionally `media_asset_id`) but **UI components continue to consume strings**.

**Do not** change `ProductCard` / `FeedPost` props to require a `Media` object until a deliberate, approved migration.

---

### 1.3 How will feeds be paginated and lazy-loaded?

**Recommendation: Cursor pagination + client infinite scroll; keep rendering via `FeedPost`.**

| Layer | Approach |
|-------|----------|
| API | `GET /feed?cursor=&limit=10` → `{ items: FeedPostData[], nextCursor: string \| null }` |
| Client | New feed fetch helper / thin `useFeed()` (or DataContext extension) loads pages |
| UI | `/feed` page maps `items` → existing `<FeedPost />`; append on scroll |
| Stories | Separate lightweight endpoint or embedded first payload; `StoriesStrip` API unchanged |
| Images | Existing `next/image` + `sizes`; no eager download of all pages |

**Lazy-load rules**

1. First paint: first page only (≈10 posts) + stories strip.  
2. IntersectionObserver / scroll sentinel loads next cursor.  
3. Do **not** rewrite `FeedPost` for virtualization until list sizes demand it.  
4. Until API exists, façade returns sliced `FEED_POSTS` with a fake cursor so the page contract is stable early.

---

# 2. Backend Architecture

## Decision summary

| Question | Locked recommendation |
|----------|----------------------|
| API host | **Phase 1–3: Next.js Route Handlers** under `src/app/api/*` |
| Later split | Extract to NestJS/FastAPI **only if** team/scale requires it — keep the **same HTTP contracts** |
| Auth fit | **`AuthContext` + cookie/session** (or JWT in httpOnly cookie); gate dashboard; Guest `/profile` stays |

---

### 2.1 Next.js API Routes vs separate backend?

**Recommendation: Start with Next.js App Router Route Handlers (`src/app/api/...`).**

**Why**

- One repo, one deploy (Vercel-friendly), matches current FE-only reality.
- UI already has no backend; the smallest consistent step is co-located APIs returning existing types.
- Designer dashboard + uploads (sign endpoints) + auth cookies work well on the same origin (no CORS pain).

**When to split later (NestJS / FastAPI)**

- Heavy video processing, complex order workflows, multi-service teams, or long-running jobs.
- Extract by **moving handlers behind the same paths/contracts**; `src/lib/api/*` client stays stable.

**Rejected for MVP:** standing up Nest/FastAPI in parallel before any API façade exists — creates two architectures and slows the mock→API migration.

**Folder fit**

```
src/app/api/
  auth/[...]/route.ts
  products/route.ts
  designers/route.ts
  feed/route.ts
  uploads/sign/route.ts
  ...
src/lib/api/          # browser/server clients used by contexts
```

Pages keep calling **contexts**, not `app/api` directly.

---

### 2.2 How will authentication fit into the existing app?

**Recommendation: Additive `AuthContext` — same provider pattern as Cart/Wishlist/Data.**

| Piece | Fit |
|-------|-----|
| Provider | Wrap in `layout.tsx` beside existing providers |
| Hook | `useAuth()` → `{ user, role, status, signIn, signOut, signUp }` |
| Roles | `buyer` \| `designer` \| `admin` |
| `/profile` | Guest UI remains default; when signed in, enrich **same page** (no redesign unless approved) |
| `/admin` & designer dashboard | Check `role`; redirect or read-only if unauthorized |
| Public shop | Unchanged — browse without login |
| Cart/Wishlist | Stay local until Phase 6; optional merge-on-login later |
| Session | Prefer **httpOnly cookie session** via Next auth route / Auth.js (Auth.js/NextAuth) or custom JWT cookie |

**Designer link:** `User` ↔ `DesignerHouse` via `designer_houses.owner_user_id` (see schema). Public page stays `/designer/[handle]`.

**Do not:** Replace TopBar/BottomNav with an auth-centric chrome, or force login before viewing the feed/store.

---

# 3. Database Schema

**ORM:** Prisma or Drizzle — either fine; **schema must mirror `src/lib/types.ts`**.  
**DB:** PostgreSQL (recommended).

Below is the **logical model**. Column names can be snake_case in DB and mapped to camelCase in TS.

---

### 3.1 `users`

| Column | Notes |
|--------|-------|
| `id` | UUID PK |
| `email` | unique |
| `password_hash` | or omit if OAuth-only |
| `name` | display |
| `role` | `buyer` \| `designer` \| `admin` |
| `avatar_url` | optional URL string |
| `created_at`, `updated_at` | |

---

### 3.2 `designer_houses` → `DesignerHouse`

| Column | Maps to |
|--------|---------|
| `id` | `id` (keep string ids or UUID; migrate mock `dh-*` via seed) |
| `owner_user_id` | FK → users (nullable until claimed) |
| `name`, `handle` | unique handle |
| `logo`, `banner` | URL strings |
| `bio`, `founding_story` | |
| `founded`, `location` | |
| `signature_techniques` | text[] / JSON |
| `verified`, `exclusive`, `offers_bespoke` | bool |
| `followers_count`, `following_count`, `posts_count` | cache/denorm optional |
| `website` | |
| `account_status` | `draft` \| `active` \| `suspended` |

---

### 3.3 `products` → `Product`

| Column | Maps to |
|--------|---------|
| `id` | `id` |
| `designer_id` | FK → designer_houses |
| `name`, `designer_name` | denorm name for cards (or join) |
| `price`, `mrp`, `best_price` | |
| `category`, `subcategory`, `gender` | |
| `images` | JSON/text[] **URLs** |
| `sizes`, `colors`, `tags` | JSON/text[] |
| `description`, `story`, … | editorial fields as today |
| `customizable`, `limited_edition`, `verified` | |
| `pieces_remaining`, `rating`, `delivery_text` | |
| `status` | `draft` \| `published` \| `archived` |

---

### 3.4 `categories` → `Category`

| Column | Notes |
|--------|-------|
| `id` / `slug` | slug unique |
| `label`, `image`, `caption` | |
| `parent_id` | self-FK for tree |

---

### 3.5 `posts` (feed) → `FeedPostData`

| Column | Maps to |
|--------|---------|
| `id` | `id` |
| `type` | `category` \| `designer-spotlight` (+ later `video`) |
| `designer_id` | FK |
| `designer_name`, `designer_logo`, `designer_verified` | denorm for FeedPost props |
| `category_slug`, `tag`, `caption`, `link` | |
| `image` | URL |
| `video_url` | nullable URL |
| `media_type` | `image` \| `video` default image |
| `product_tag` | JSON `{ name, price, productId? }` |
| `likes_count` | denormalized counter |
| `created_at` | for feed ordering / cursor |

---

### 3.6 `stories` / `story_slides` → `StoryItem` / `StorySlide`

- `stories`: designer_id, label, created_at, expires_at  
- `story_slides`: story_id, position, image URL, video_url?, caption, cta_label, cta_link  

---

### 3.7 `media_assets` (optional bookkeeping)

`id`, `url`, `public_id`, `kind`, `width`, `height`, `duration_ms`, `uploaded_by`, `created_at`  
Entities keep **URL columns** for UI compatibility.

---

### 3.8 `likes`

| Column | Notes |
|--------|-------|
| `user_id`, `post_id` | unique pair |
| `created_at` | |

(Optionally `product_id` for product likes later — not required for FeedPost MVP.)

---

### 3.9 `comments`

| Column | Notes |
|--------|-------|
| `id`, `post_id`, `user_id` | |
| `body`, `created_at` | |
| `parent_id` | nullable for threads |

**UI note:** comments are **new** surface area; add under FeedPost only when approved — don’t change FeedPost layout until then. API can exist first.

---

### 3.10 `follows`

| Column | Notes |
|--------|-------|
| `follower_user_id` | |
| `designer_id` | follow a house (matches FeedPost “Follow” affordance) |
| unique (`follower_user_id`, `designer_id`) | |

---

### 3.11 `orders` / `order_items`

| `orders` | `order_items` |
|----------|----------------|
| user_id, status, totals, addresses, created_at | order_id, product_id, name, brand, price, size, image, quantity, customization_json? |

Align line shape with existing **`CartItem`** so checkout can hydrate from `useCart()`.

---

### 3.12 `customization_requests` → `BespokeConfig`

| Column | Notes |
|--------|-------|
| `id`, `user_id`, `product_id?`, `designer_id?` | |
| `base_design`, `fabric`, `color`, `embellishment`, `size`, `notes` | |
| `measurement_session_booked` | bool |
| `status` | `draft` \| `submitted` \| `in_review` \| `quoted` \| `closed` |

Created from `/bespoke` without redesigning the wizard.

---

### 3.13 Cart / wishlist (Phase 6)

- MVP: keep **localStorage** contexts.  
- Later: `wishlists(user_id, product_id)`, `cart_items(...)` mirroring CartItem — sync on login without changing ProductCard APIs.

---

# 4. Migration Plan — mock-data → APIs Without Changing UI Components

## Goal

`ProductCard`, `FeedPost`, `StoriesStrip`, `TopBar`, `BottomNav` keep the **same props and behavior**. Pages keep using contexts (or minimal page wiring). Only the **data source behind contexts/helpers** changes.

## Strategy: Façade + Feature Flags + Dual-Run

```
UI Components (unchanged)
    ↑
Contexts / thin hooks (stable method names)
    ↑
src/lib/api/*  (NEW)
    ├── if USE_MOCK / endpoint down → mock-data.ts
    └── else → fetch('/api/...')
    ↑
Route Handlers → DB
```

### Step-by-step

| Step | Action | Touches pages? |
|------|--------|----------------|
| A | Add `src/lib/api/{products,designers,feed,stories,...}.ts` returning existing types | No |
| B | Point **DataContext** load/save at `api.products` / `api.designers` (mock first) | No (context only) |
| C | Add `USE_API=false` env; when true, hit Route Handlers | No |
| D | Seed DB from `mock-data.ts` | No |
| E | Flip products/designers to API; keep feed on mock | No if feed still static import — **prefer** feed façade before flipping |
| F | Feed page: replace `FEED_POSTS.map` with `useFeed()` data **same map to FeedPost** | **Minimal** feed page only |
| G | StoriesStrip: optional prop `stories?: StoryItem[]` defaulting to mock — **approved small change** OR wrapper container | Prefer container in page so StoriesStrip stays unchanged initially |
| H | Wishlist/Search: read products from `useData()` (bugfix, tiny page/component change) | Necessary exception |
| I | Remove mock fallbacks domain-by-domain after parity tests | No UI redesign |

### Rules

1. **Never** change `ProductCard` props to fetch internally.  
2. **Never** make `FeedPost` call the network.  
3. Prefer changing **context** and **`/feed` data wiring** over rewriting presentational components.  
4. Keep `formatPrice` and type imports as-is.  
5. Admin continues calling `addProduct` etc.; implement those methods with API writes behind the same function names.

### Compatibility shims

- API returns camelCase JSON matching `types.ts`.  
- Map DB snake_case only inside Route Handlers / repository layer.  
- Keep mock ids (`prod-1`, `dh-1`) in seed so existing deep links (`/product/prod-1`) keep working during migration.

---

# 5. Implementation Order (Revised Phases)

Aligned with your requested phases, refined for zero-regression delivery.

## Phase 1 — Backend & DB

- Postgres + Prisma/Drizzle schema (tables above, MVP subset OK).  
- Seed from `mock-data.ts`.  
- Route Handlers: health, products list/detail, designers by handle, categories.  
- `src/lib/api/*` façade with mock fallback.  
- Wire **DataContext** to façade (still mock by default).  
- **No page UI redesign.**

## Phase 2 — Auth

- Auth routes + session cookie.  
- `AuthContext` + layout provider.  
- Protect `/admin` (and future dashboard).  
- Enrich `/profile` only as needed for session display — **no TopBar/BottomNav changes**.  
- Link `users` → `designer_houses.owner_user_id`.

## Phase 3 — Media upload

- `POST /api/uploads/sign` (Cloudinary).  
- Small uploader control for **dashboard/admin forms only** (new UI in dashboard, not ProductCard).  
- Persist URLs into existing string fields.  
- Confirm `next/image` for new Cloudinary URLs.

## Phase 4 — Designer dashboard

- New route e.g. `/dashboard` **or** role-scoped `/admin` (prefer extract `components/admin/*` without restyling).  
- Scoped CRUD for own products/posts.  
- Reuse form patterns; shop components untouched.  
- Link from Profile for designer role.

## Phase 5 — Feed

- `posts` + cursor API; likes/follows endpoints.  
- `/feed` wires to `useFeed()`; still renders `<FeedPost />` and `<StoriesStrip />`.  
- Additive: video fields, ImageViewer / VerticalVideoViewer as **new overlays**.  
- Comments UI only when approved.

## Phase 6 — Shopping & customization

- Cart → checkout → `orders` (new pages OK; Cart page incremental).  
- Wishlist optional server sync.  
- `/bespoke` submits `customization_requests`; `?productId=` prefills.  
- Extend `CartItem` optionally with customization — **ProductCard quick-add stays simple**.

---

## Phase dependency graph

```
Phase 1 (API + DB + façade)
    ↓
Phase 2 (Auth)
    ↓
Phase 3 (Upload sign + URL write)
    ↓
Phase 4 (Designer dashboard)
    ↓
Phase 5 (Feed API + enrichment)
    ↓
Phase 6 (Orders + bespoke persistence)
```

---

# Open Choices (Need Your Explicit OK)

These are **recommendations**, not irreversible until you confirm:

| # | Topic | Recommendation | Alt |
|---|--------|----------------|-----|
| 1 | Media CDN | Cloudinary | S3 + CloudFront / Supabase Storage |
| 2 | Backend host | Next.js Route Handlers first | NestJS/FastAPI from day one |
| 3 | Auth library | Auth.js (NextAuth) v5 **or** custom cookie JWT | Clerk/Supabase Auth |
| 4 | ORM | Prisma | Drizzle |
| 5 | Dashboard URL | `/dashboard` (designer) + keep `/admin` (platform) | Only role-scoped `/admin` |
| 6 | Feed comments in Phase 5 | API only first | Full UI in Phase 5 |

---

# Stop

Architectural decisions documented for lock-in. **No code written.**

Please approve or adjust the open choices (especially media CDN, Next API vs separate backend, and auth library) before implementation starts.
