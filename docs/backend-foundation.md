# Backend Foundation (Phase 1 / 1.1)

## Overview

Backend foundation under the existing Next.js app **without changing shop UI**.

**Locked infrastructure (Phase 1.1):**

| Concern | Choice |
|---------|--------|
| Database | **Supabase PostgreSQL** + Prisma |
| Auth (prepared) | **Supabase Auth** (no login UI yet) |
| Media (prepared) | **Cloudinary** SDK util (no upload UI yet) |
| Local Docker Postgres | **Removed** — not used |

Default runtime (backward compatible):

- `USE_DATABASE=false`
- `NEXT_PUBLIC_USE_API=false`
- Pages still use `DataContext` + `mock-data` / localStorage

```
UI (unchanged)
  └── Context / future callers
        └── src/lib/api  (façade — mock by default)
              └── fetch /api/*   (optional when NEXT_PUBLIC_USE_API=true)
                    └── Services
                          └── Repositories  (when USE_DATABASE=true)
                                └── Prisma → Supabase Postgres
                          └── mock-data     (when USE_DATABASE=false)
```

---

## Supabase project

| Field | Value |
|-------|-------|
| Name | `desginer ef` |
| Ref / id | `jwqpqlifszfveuldpujn` |
| Region | `ap-south-1` |
| API URL | `https://jwqpqlifszfveuldpujn.supabase.co` |
| Status | `ACTIVE_HEALTHY` |

Dashboard: https://supabase.com/dashboard/project/jwqpqlifszfveuldpujn

### Setup steps

1. Open **Project Settings → Database** → copy **Connection string (URI)** into `DATABASE_URL` in `.env` (use the password shown once at project creation, or reset database password).
2. Open **Project Settings → API** → copy **service_role** into `SUPABASE_SERVICE_ROLE_KEY` (server only — never `NEXT_PUBLIC_`).
3. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are already documented in `.env.example` / local `.env`.
4. Keep `USE_DATABASE=false` until you intentionally switch APIs to Prisma.
5. Optional seed (requires `DATABASE_URL`):

```bash
npm run db:seed
```

Prisma schema already matches tables applied on this Supabase project (Phase 1.1). Prefer `npm run db:seed` over re-running `migrate` if the schema is already present.

---

## Folder structure

```
prisma/
  schema.prisma
  seed.ts
  migrations/20260730120000_init/

src/
  lib/api/                  # Client-safe façade (mock | remote)
  app/api/                  # Route Handlers
  server/
    db.ts                   # Prisma singleton
    errors/
    types/
    utils/
    repositories/
    services/
    auth/
      session.ts            # Legacy session scaffold
      permissions.ts
      middleware-structure.ts  # NOT activated
      supabase.ts           # Supabase Auth client helpers
    media/
      cloudinary.ts         # Cloudinary SDK + signed upload params helper
```

**No** existing page/component files redesigned or renamed.  
**Removed:** `docker-compose.yml` and all Docker Postgres assumptions.

---

## Database (Supabase + Prisma)

- **Engine:** Supabase-hosted PostgreSQL 17  
- **ORM:** Prisma (`@prisma/client`)  
- **IDs:** String IDs preserved (`dh-1`, `prod-1`, …) for mock seed compatibility  
- **RLS:** Enabled on public tables (PostgREST anon denied by default; Prisma via `DATABASE_URL` uses the DB role)

With `USE_DATABASE=false` (default), the app never requires a live DB connection for UI.

---

## Authentication (scaffold only)

- Prefer **Supabase Auth** going forward: `createSupabaseBrowserClient` / `createSupabaseServiceClient` in `src/server/auth/supabase.ts`
- Existing cookie/session scaffold remains for transitional use
- **No** login pages, **no** Profile UI changes, **no** `middleware.ts` activated

---

## Media (Cloudinary — config only)

- Package: official `cloudinary` SDK  
- Utility: `src/server/media/cloudinary.ts`  
  - `getCloudinary()`  
  - `isCloudinaryConfigured()`  
  - `createSignedUploadParams()` for future signed client uploads  
- **No** upload UI or upload API routes in Phase 1.1  
- `next.config.ts` already allows `res.cloudinary.com`

---

## Environment variables

See `.env.example` and `docs/environment.md`.

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
USE_DATABASE=false
NEXT_PUBLIC_USE_API=false
```

---

## Services & repositories

| Service | Repository | Responsibility |
|---------|------------|----------------|
| `ProductService` | `ProductRepository` | List/get products |
| `DesignerService` | `DesignerRepository` | List/get designers |
| `FeedService` | `FeedRepository` | Feed cursor page, stories, categories |
| `UserService` | `UserRepository` | User lookups (scaffold) |
| `AuthService` | (uses `UserRepository`) | Legacy session helpers |

Repositories contain **no** business logic — only Prisma queries + mappers to frontend types.

---

## API conventions

- JSON envelope: `{ ok: true, data }` or `{ ok: false, error: { code, message } }`
- Helpers: `ok()` / `fail()` in `src/server/utils/api-response.ts`

### Endpoints

| Method | Path |
|--------|------|
| GET | `/api/health` |
| GET | `/api/products` |
| GET | `/api/products/[id]` |
| GET | `/api/designers` |
| GET | `/api/designers/[id]` |
| GET | `/api/designers/handle/[handle]` |
| GET | `/api/feed` |
| GET | `/api/feed/stories` |
| GET | `/api/categories` |

Health also reports `supabaseConfigured` and `cloudinaryConfigured`.

---

## Seed process

`prisma/seed.ts` upserts from `src/lib/mock-data.ts` (requires `DATABASE_URL`).

```bash
npm run db:seed
```

---

## Migration strategy (UI-safe)

1. Keep defaults → identical UX.  
2. Fill Supabase + Cloudinary secrets in `.env`.  
3. Set `USE_DATABASE=true` when ready for Route Handlers to read Supabase.  
4. Later: point contexts at `src/lib/api` with `NEXT_PUBLIC_USE_API=true` without changing `ProductCard` / `FeedPost` props.

---

## Scripts

```bash
npm run db:generate
npm run db:migrate
npm run db:migrate:deploy
npm run db:seed
npm run db:studio
```
