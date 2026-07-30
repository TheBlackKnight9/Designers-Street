# Backend Foundation (Phase 1)

## Overview

Phase 1 adds a **backend foundation** under the existing Next.js app **without changing any shop UI**.

Default runtime behavior is unchanged:

- Pages still use `DataContext` + `mock-data` / localStorage.
- `USE_DATABASE=false` and `NEXT_PUBLIC_USE_API=false` (defaults).
- Route Handlers exist and return the **same TypeScript shapes** as `src/lib/types.ts`, backed by mock data until the DB flag is enabled.

```
UI (unchanged)
  └── Context / future callers
        └── src/lib/api  (façade — mock by default)
              └── fetch /api/*   (optional when NEXT_PUBLIC_USE_API=true)
                    └── Services
                          └── Repositories  (when USE_DATABASE=true)
                                └── Prisma → PostgreSQL
                          └── mock-data     (when USE_DATABASE=false)
```

---

## Folder structure

```
prisma/
  schema.prisma
  seed.ts
  migrations/20260730120000_init/

docker-compose.yml          # local Postgres 16

src/
  lib/api/                  # Client-safe façade (mock | remote)
  app/api/                  # Route Handlers
    health/
    products/
    designers/
    feed/
    categories/
  server/
    db.ts                   # Prisma singleton
    errors/
    types/
    utils/                  # api-response, logger, validation, mappers, env
    repositories/           # DB access only
    services/               # Business logic + mock/db switch
    auth/                   # Session, permissions, middleware scaffold
```

**No** existing page/component files were redesigned or renamed.

---

## Database

- **Engine:** PostgreSQL 16 (via `docker-compose.yml`)
- **ORM:** Prisma (`@prisma/client`)
- **IDs:** String IDs preserved (`dh-1`, `prod-1`, …) for seed compatibility
- **Models:** users, sessions, designer_houses, products, categories, posts, stories, story_slides, media_assets, likes, comments, follows, orders, order_items, customization_requests, wishlist_items

### Local DB commands

```bash
docker compose up -d
npm run db:migrate          # prisma migrate dev
npm run db:seed             # import mock-data
# or
npm run db:setup
```

Set in `.env`:

```
USE_DATABASE=true
DATABASE_URL=postgresql://designers:designers@localhost:5432/designers_street?schema=public
```

With `USE_DATABASE=false` (default), the app never requires Postgres.

---

## Services & repositories

| Service | Repository | Responsibility |
|---------|------------|----------------|
| `ProductService` | `ProductRepository` | List/get products |
| `DesignerService` | `DesignerRepository` | List/get designers |
| `FeedService` | `FeedRepository` | Feed cursor page, stories, categories |
| `UserService` | `UserRepository` | User lookups / draft register (scaffold) |
| `AuthService` | (uses `UserRepository`) | Session token create/resolve/destroy |

Repositories contain **no** business logic — only Prisma queries + mappers to frontend types.

---

## Environment variables

See `.env.example` and `docs/environment.md`.

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | Postgres connection | docker-compose URL |
| `USE_DATABASE` | Services use Prisma vs mock | `false` |
| `NEXT_PUBLIC_USE_API` | Façade fetch `/api` vs mock | `false` |
| `NEXT_PUBLIC_APP_URL` | Absolute fetch base | `http://localhost:3000` |
| `AUTH_SECRET` | Session token hashing | placeholder |
| `SESSION_COOKIE_NAME` | Cookie name | `ds_session` |
| `SESSION_MAX_AGE_DAYS` | Session TTL | `14` |

---

## API conventions

- JSON envelope: `{ ok: true, data }` or `{ ok: false, error: { code, message } }`
- Helpers: `ok()` / `fail()` in `src/server/utils/api-response.ts`
- Errors: `AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`

### Endpoints (Phase 1)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health` | API + DB diagnostics |
| GET | `/api/products` | Optional `?designerId=` / `?category=` |
| GET | `/api/products/[id]` | |
| GET | `/api/designers` | |
| GET | `/api/designers/[id]` | |
| GET | `/api/designers/handle/[handle]` | |
| GET | `/api/feed` | `?limit=&cursor=` |
| GET | `/api/feed/stories` | |
| GET | `/api/categories` | Tree |

---

## Auth scaffold (no UI)

- Roles: `buyer` \| `designer` \| `admin`
- `AuthService` + cookie helpers
- Permission helpers (`assertAdmin`, `assertDesigner`, …)
- `middleware-structure.ts` preview — **not** enabled as `src/middleware.ts` (avoids changing request behavior)

---

## Seed process

`prisma/seed.ts` upserts from `src/lib/mock-data.ts`:

1. Designers  
2. Products  
3. Category tree  
4. Feed posts  
5. Stories + slides  

```bash
npm run db:seed
```

---

## Health endpoint

`GET /api/health` →

```json
{
  "ok": true,
  "status": "ok",
  "api": "ok",
  "database": "skipped" | "connected" | "disconnected",
  "useDatabase": false,
  "environment": "development",
  "timestamp": "..."
}
```

---

## Migration strategy (UI-safe)

1. Keep defaults (`USE_DATABASE=false`, `NEXT_PUBLIC_USE_API=false`) → identical UX.  
2. Start Postgres, migrate, seed.  
3. Set `USE_DATABASE=true` → Route Handlers read DB; UI still on mock/context.  
4. Later phases: point contexts at `src/lib/api` with `NEXT_PUBLIC_USE_API=true` **without** changing `ProductCard` / `FeedPost` props.

---

## Scripts added

```bash
npm run db:generate
npm run db:migrate
npm run db:migrate:deploy
npm run db:push
npm run db:seed
npm run db:studio
npm run db:setup
```
