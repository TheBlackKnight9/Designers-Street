# Designer's Street — System Architecture

**Audience:** New developers joining the project  
**Last updated:** 2026-07-30  
**Principle:** Extend the existing app. Do not invent a parallel stack. Keep shop UI working on mock data by default.

This document is the **entry point**. Deeper detail lives in linked docs at the end.

---

## 1. Complete project architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  App Router pages (client)                                       │
│    TopBar / BottomNav / ProductCard / FeedPost / StoriesStrip    │
│         │                                                        │
│         ▼                                                        │
│  React Contexts (DataContext, Cart, Wishlist)                    │
│         │                                                        │
│         ▼                                                        │
│  src/lib/api  ── façade (mock by default)                        │
│         │                                                        │
│         ├── mock-data.ts + localStorage   (USE_DATABASE=false)   │
│         └── fetch /api/*                  (NEXT_PUBLIC_USE_API)  │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router) — same process                          │
│  Route Handlers: /api/health, products, designers, feed, media…  │
│         │                                                        │
│         ▼                                                        │
│  Services → Repositories / CloudinaryService / Auth scaffold     │
│         │                              │                         │
│         ▼                              ▼                         │
│  Prisma → Supabase Postgres      Cloudinary CDN                  │
│  Supabase Auth (login/signup + middleware for /dashboard)        │
│  Designer Dashboard (/dashboard/*) — product CRUD + media        │
└──────────────────────────────────────────────────────────────────┘
```

### Locked infrastructure

| Concern | Choice |
|---------|--------|
| App framework | Next.js 16 App Router + React 19 |
| Styling | Tailwind CSS 4 + existing design tokens (`globals.css`) |
| Database | **Supabase PostgreSQL** + Prisma ORM |
| Auth | **Supabase Auth** (`@supabase/ssr` cookies + `/login` `/signup`) |
| Media | **Cloudinary** (signed uploads; API secret server-only) |
| Default data mode | Mock for **public shop** (`USE_DATABASE=false`, `NEXT_PUBLIC_USE_API=false`) |
| Dashboard | Requires auth + `USE_DATABASE=true` |

### Migration path (UI-safe)

```
UI pages (unchanged)
  → Contexts
    → src/lib/api façade
      → /api/* Route Handlers
        → Services
          → Repositories → Prisma → Supabase
          → CloudinaryService → Cloudinary
```

**Regression guard:** Do not modify existing shop pages/components unless necessary. Prefer new routes (e.g. designer dashboard) and façade/API layers.

---

## 2. Current phase status

| Phase | Scope | Status |
|-------|--------|--------|
| **Docs / decisions** | Architecture audit, locked decisions, local setup | Done |
| **Phase 1** | Backend foundation: Prisma schema, repos, services, `/api/*` catalogue/feed/health, API façade, seed | Done |
| **Phase 1.1** | Infra correction: Supabase (not Docker), Auth scaffold, Cloudinary util, RLS on app tables | Done |
| **Phase 2** | Media foundation: `MediaAsset` model, Cloudinary service, upload/sign/register/delete APIs, validation, docs | Done |
| **Phase 3** | Designer Dashboard & Product Upload (auth, CRUD, gallery) | **Done** |
| **Phase 4** | Public Marketplace Integration (PublicService, DTOs, shop cutover) | **Done** |
| **Phase 5** | Universal Media Experience (shared MediaViewer + hook) | **Done** |
| Later | Search, cart/checkout/orders, social (likes/comments), recommendations | Planned |

### What works today

- Full shop UI on **mock data** + `localStorage` (cart, wishlist, admin catalog) when flags are off.
- With `USE_DATABASE=true` + `NEXT_PUBLIC_USE_API=true`, Home/Feed/Store/Category/PDP read **published** products via `PublicCatalogService` DTOs (cursor pagination + filters).
- Backend APIs exist and respond; catalogue/feed use mock when DB is off.
- Media: signed Cloudinary params; persist/get/delete need `USE_DATABASE=true` + `DATABASE_URL`.
- **Designer dashboard:** `/login`, `/signup`, `/dashboard/*` with product CRUD + gallery uploads (requires DB + Auth).
- Health: `GET /api/health`.
- Public catalog rate limits + documented `/api/v1/*` versioning strategy.

### What is intentionally not built yet

- **Universal MediaViewer** — Feed, PDP, ProductCard, Designer posts share one viewer (`MediaViewerProvider`)
- Search engine / Meilisearch
- Login for buyers
- Cart/checkout/orders backend
- Likes/comments
- Recommendations / Redis cache

---

## 3. Tech stack

| Layer | Technology | Version / notes |
|-------|------------|-----------------|
| Runtime | Node.js | Local machine |
| Framework | Next.js | 16.2.x (Turbopack) |
| UI | React | 19.x |
| Language | TypeScript | 5.x |
| CSS | Tailwind CSS | 4.x |
| ORM | Prisma | 6.x |
| DB | Supabase PostgreSQL | Project `jwqpqlifszfveuldpujn` (ap-south-1) |
| Auth client | `@supabase/supabase-js` | Scaffold |
| Media SDK | `cloudinary` (Node) | Server-only secret |
| Lint | ESLint + `eslint-config-next` | Pre-existing UI lint noise |

### Key environment switches

```env
USE_DATABASE=false          # services use mock vs Prisma
NEXT_PUBLIC_USE_API=false   # façade uses mock vs /api/*
DATABASE_URL=               # Supabase Postgres URI
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MEDIA_MAX_IMAGE_MB=10
MEDIA_MAX_VIDEO_MB=100
```

Copy from `.env.example`. Never commit `.env`.

---

## 4. Folder structure

```
designer fe/
├── docs/                          # Architecture & phase docs (start here)
├── prisma/
│   ├── schema.prisma              # Full domain model
│   ├── migrations/                # SQL migrations (incl. media)
│   └── seed.ts                    # Optional DB seed
├── public/
├── src/
│   ├── app/                       # App Router
│   │   ├── page.tsx               # Home
│   │   ├── feed/, store/, category/, product/, designer/
│   │   ├── cart/, wishlist/, profile/, bespoke/, admin/
│   │   └── api/                   # Route Handlers (backend)
│   │       ├── health/
│   │       ├── products/, designers/, categories/, feed/
│   │       └── media/             # Phase 2 upload / get / delete
│   ├── components/                # Shared UI (preserve)
│   │   ├── TopBar, BottomNav, SearchOverlay, Footer
│   │   ├── home/                  # FeedPost, StoriesStrip, StoryViewer
│   │   ├── media/                 # Universal MediaViewer (Phase 5)
│   │   └── ui/                    # ProductCard, Button
│   ├── context/                   # Data, Cart, Wishlist, MediaViewer
│   ├── hooks/                     # useStorefrontCatalog, useMediaViewer
│   ├── lib/
│   │   ├── mock-data.ts           # Seed catalog for mock mode
│   │   ├── types.ts               # UI domain types
│   │   ├── media/                 # Delivery, playback, analytics stubs, adapters
│   │   └── api/                   # Client façade (catalog + media + product-mappers)
│   └── server/                    # Backend-only code
│       ├── db.ts                  # Prisma client
│       ├── auth/                  # Supabase clients + permission stubs
│       ├── media/                 # CloudinaryService, folders
│       ├── dto/                   # Public DTOs + mappers (Phase 4)
│       ├── repositories/
│       ├── services/              # incl. PublicCatalogService
│       ├── types/
│       ├── errors/
│       └── utils/                 # env, validation, api-response, logger, analytics stubs
├── .env.example
└── package.json
```

### Shop routes (UI — do not break)

| Route | Purpose |
|-------|---------|
| `/` | Home |
| `/feed` | Stories + feed |
| `/store`, `/category`, `/category/[slug]` | Catalog |
| `/product/[productId]` | PDP |
| `/designer/[handle]` | Designer profile |
| `/cart`, `/wishlist`, `/profile`, `/bespoke` | Commerce / account / MTM |
| `/admin` | Local mock catalog CRUD (ungated) |
| `/login`, `/signup` | Designer auth |
| `/dashboard`, `/dashboard/products`, `/dashboard/products/new`, `/dashboard/products/[productId]`, `/dashboard/profile`, `/dashboard/settings` | Designer studio (protected) |

---

## 5. Database overview

**Engine:** Supabase PostgreSQL  
**Access:** Prisma (`DATABASE_URL`) when `USE_DATABASE=true`  
**RLS:** Enabled on app tables (Phase 1.1); server uses connection string / service role as configured.

### Core models

| Model | Table | Role |
|-------|-------|------|
| `User` | `users` | Account + role (`buyer` / `designer` / `admin`) |
| `Session` | `sessions` | Auth session scaffold |
| `DesignerHouse` | `designer_houses` | Brand / designer profile |
| `Product` | `products` | Catalog item |
| `Category` | `categories` | Taxonomy |
| `Post` | `posts` | Feed post |
| `Story` / `StorySlide` | `stories` / `story_slides` | Stories |
| `MediaAsset` | `media_assets` | Cloudinary-backed media (Phase 2) |
| `Like`, `Comment`, `Follow` | social | Engagement |
| `Order`, `OrderItem` | orders | Commerce (schema ready) |
| `CustomizationRequest` | customizations | Bespoke (schema ready) |
| `WishlistItem` | wishlist | Wishlist (schema ready) |

### Media (`MediaAsset`) — future-ready owners

One table supports **product**, **post**, **designer**, **story**, or **unattached** via optional FKs + `ownerType`.

- Multiple media per product/post (non-unique FKs).
- Ordered by `displayOrder`, then `createdAt`.
- Stores `publicId`, `secureUrl`, dimensions, duration, format, bytes, folder, `altText`, `thumbnailUrl`.
- Does **not** store Cloudinary API secret.

Cloudinary folders (default):

```
designers-street/products
designers-street/posts
designers-street/stories
designers-street/designers
designers-street/unattached
```

Schema source of truth: `prisma/schema.prisma`.

---

## 6. API overview

Base: same origin as the Next app (e.g. `http://localhost:3000`).

Standard response shape via `ok` / `fail` helpers:

```json
{ "ok": true, "data": { … } }
{ "ok": false, "error": { "code": "…", "message": "…" } }
```

### API versioning (planned)

Current public routes live at **unversioned** paths (`/api/products`, `/api/feed`, …). That remains the supported surface for Phase 4 clients.

**Future-proofing:** treat these paths as **v1-equivalent**. When a breaking change is required, introduce parallel routes under `/api/v1/…` (e.g. `/api/v1/products`) and keep unversioned paths as aliases or freeze them. Do **not** migrate callers until a dedicated versioning phase.

| Today (supported) | Planned alias / next major |
|-------------------|----------------------------|
| `/api/products` | `/api/v1/products` |
| `/api/products/[id]` | `/api/v1/products/[id]` |
| `/api/feed` | `/api/v1/feed` |
| `/api/categories` | `/api/v1/categories` |
| `/api/designers` | `/api/v1/designers` |

Dashboard (`/api/dashboard/*`) and auth (`/api/auth/*`) follow the same rule when versioned later.

### Rate limiting (public catalog)

`GET /api/products`, `/api/products/[id]`, `/api/feed`, and `/api/categories` call `enforcePublicRateLimit` (per-IP fixed window, in-memory per process).

| Env | Default | Meaning |
|-----|---------|---------|
| `PUBLIC_API_RATE_LIMIT_MAX` | `120` | Max requests per IP per window |
| `PUBLIC_API_RATE_LIMIT_WINDOW_SEC` | `60` | Window length in seconds |

Exceeded → `429` with `code: RATE_LIMITED` and `Retry-After` header. Replace with Redis/edge limits when running multiple instances.

### Catalogue / feed / health (Phase 4 public)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health` | Env + Cloudinary/Supabase/DB flags |
| GET | `/api/products` | Cursor page of `ProductCardDTO` + filters; rate-limited |
| GET | `/api/products/[id]` | `ProductDetailDTO` or 404 if not visible; rate-limited |
| GET | `/api/designers` | List |
| GET | `/api/designers/[id]` | Detail |
| GET | `/api/designers/handle/[handle]` | By handle |
| GET | `/api/categories` | `CategoryDTO` tree; rate-limited |
| GET | `/api/feed` | Product-backed `FeedPostDTO` page + cursor; rate-limited |
| GET | `/api/feed/stories` | Stories |

Public product/feed queries use `PublicCatalogService` + visibility (`published` + active designer). When `USE_DATABASE=false`, services fall back to mock data. List `data` shape: `{ items, nextCursor }`.

Dashboard stays under `/api/dashboard/*` — no shared handlers.

### Media (Phase 2)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/media/upload` | `intent: "sign"` \| `"register"`; or multipart `file` |
| GET | `/api/media/[id]` | Metadata (requires DB) |
| DELETE | `/api/media/[id]` | DB row + Cloudinary asset (requires DB) |

**Recommended client flow (signed upload):**

1. `POST /api/media/upload` `{ "intent": "sign", "ownerType": "product" }`
2. Browser uploads file directly to Cloudinary with returned signature (no secret).
3. `POST /api/media/upload` `{ "intent": "register", …publicId, secureUrl, productId… }`

Façade helpers: `src/lib/api/media.ts` (`createMediaUploadSignature`, `registerMedia`, `uploadMediaFile`, `getMedia`, `deleteMedia`).

### Designer dashboard (Phase 3)

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/auth/me`, `/api/auth/bootstrap` | Session sync / me |
| GET/POST | `/api/dashboard/products` | List / create (owned) |
| GET/PUT/DELETE | `/api/dashboard/products/[id]` | Owned product CRUD |
| PATCH | `/api/dashboard/products/[id]/status` | draft / published / archived |
| POST/DELETE | `/api/dashboard/products/[id]/media`… | Register / delete gallery items |
| PUT | `/api/dashboard/products/[id]/media/order` | Reorder (`displayOrder`) |
| GET/PUT | `/api/dashboard/profile` | Designer house profile |
| POST | `/api/dashboard/media/sign` | Auth-gated signed upload |

Ownership is enforced server-side from Supabase session → `DesignerHouse.ownerUserId`.

---

## 7. Development workflow

### First-time setup

```bash
npm install
copy .env.example .env
# Fill Supabase + Cloudinary values when you need real DB/media
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Shop works without DB.

### Common commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build + typecheck |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck only |
| `npm run db:generate` | Prisma client |
| `npm run db:migrate` | Local migrate (dev) |
| `npm run db:migrate:deploy` | Apply migrations |
| `npm run db:seed` | Seed DB |
| `npm run db:studio` | Prisma Studio |

### Git / branch safety

- Work on **feature branches** only.
- Do **not** push/merge to `main`/`master` without explicit approval.
- Never commit `.env` or secrets.

### Enabling real backend + dashboard locally

1. Set `DATABASE_URL` to Supabase Postgres URI.
2. Ensure migrations applied on the project.
3. Set `USE_DATABASE=true` (dashboard requires this).
4. Set Cloudinary + Supabase Auth keys.
5. Disable email confirmation in Supabase Auth (or confirm email) for local signup.
6. Open `/signup`, create a designer, then use `/dashboard`.
7. Verify `GET /api/health` and shop `/` still works with mock when `NEXT_PUBLIC_USE_API=false`.

### How to add a feature (recommended)

1. Schema (if needed) → Prisma migrate → generate.
2. Repository → Service → `/api/...` route.
3. Extend `src/lib/api` façade (keep mock fallback).
4. New UI routes/components only — avoid rewriting existing shop pages.
5. Document in `docs/` when the phase completes.

---

## 8. Related documentation

| Doc | Contents |
|-----|----------|
| [environment.md](./environment.md) | Env vars in detail |
| [local-setup.md](./local-setup.md) | Machine setup |
| [dev-commands.md](./dev-commands.md) | Command cheatsheet |
| [backend-foundation.md](./backend-foundation.md) | Phase 1 / 1.1 backend |
| [phase-2.md](./phase-2.md) | Media architecture |
| [phase-2-report.md](./phase-2-report.md) | Phase 2 change log / checklist |
| [phase-3.md](./phase-3.md) | Designer dashboard architecture |
| [phase-3-report.md](./phase-3-report.md) | Phase 3 change log / checklist |
| [phase-4.md](./phase-4.md) | Public marketplace architecture |
| [phase-4-report.md](./phase-4-report.md) | Phase 4 change log / checklist |
| [phase-5.md](./phase-5.md) | Universal Media Experience |
| [phase-5-report.md](./phase-5-report.md) | Phase 5 change log / checklist |
| [product-lifecycle.md](./product-lifecycle.md) | Draft/publish/archive, media, ownership, public consumers |
| [architecture-decisions.md](./architecture-decisions.md) | Locked product decisions |
| [architecture-roadmap.md](./architecture-roadmap.md) | Original audit & roadmap |
| [project-overview.md](./project-overview.md) | Early product overview (UI-era; some sections superseded) |

---

## 9. Status after Phase 5

Phase 5 (**Universal Media Experience**) is complete:

- [x] Shared `MediaViewer` + Image/Video primitives
- [x] `useMediaViewer` + `MediaViewerProvider`
- [x] URL sync (`?media=`), adjacent preload, virtualized thumbs
- [x] Single active video + Cloudinary delivery helpers + analytics stubs
- [x] Wired into Feed, PDP, ProductCard, Designer profile
- [x] Docs: `phase-5.md`, `phase-5-report.md`

**Do not** start likes, comments, search engine, cart, checkout, orders, or recommendations until a dedicated phase.
