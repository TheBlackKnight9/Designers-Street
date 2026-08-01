# Phase 3 — Designer Dashboard & Product Upload

## Dashboard architecture

```
/login /signup
    → Supabase Auth (cookies via @supabase/ssr)
    → POST /api/auth/bootstrap  (Prisma User + DesignerHouse)
    → /dashboard/*

/dashboard pages
    → src/lib/api/dashboard.ts
    → /api/dashboard/*  (requireDashboardContext)
    → DashboardProductService
         ├── ProductRepository (owned designerId)
         ├── MediaRepository / MediaService (Phase 2)
         └── DesignerRepository (profile)
```

Public shop/feed pages default to mock data. With Phase 4 flags on, they read published catalog DTOs via `/api/products`, `/api/feed`, `/api/categories`.

---

## Authentication flow

1. Designer signs up at `/signup` (email/password) or signs in at `/login`.
2. Supabase issues a session (HTTP cookies).
3. Client calls `/api/auth/bootstrap` to create:
   - `User` with `id = auth.user.id`, `role = designer`
   - `DesignerHouse` with `ownerUserId = user.id`
4. `middleware.ts` protects `/dashboard/*` — unauthenticated users redirect to `/login?next=…`.
5. Every dashboard API calls `requireDashboardContext()` and resolves ownership from the session (never from client-supplied designer IDs).

Logout: dashboard header / settings → `supabase.auth.signOut()`.

---

## Product lifecycle

Statuses (existing enum):

| Status | Meaning |
|--------|---------|
| `draft` | Editable, not customer-facing |
| `published` | Ready (requires ≥1 image) |
| `archived` | Hidden from active catalog filters |

Create → save draft → upload gallery → reorder (cover = `displayOrder` 0) → publish / archive / delete.

Stock maps to `piecesRemaining`. Processing time maps to `deliveryText`.

---

## Upload flow

1. Save product (create if needed).
2. `POST /api/dashboard/media/sign` → signed Cloudinary params.
3. Browser XHR upload to Cloudinary (progress + abort).
4. `POST /api/dashboard/products/:id/media` → register metadata + ownership checks.
5. Service syncs `Product.images` from ordered image URLs.

Limits: `MEDIA_MAX_IMAGES_PER_PRODUCT` (default 10), `MEDIA_MAX_VIDEOS_PER_PRODUCT` (default 3).

---

## Database updates

No breaking schema migrations required for Phase 3.

- Reused `ProductStatus` (`draft|published|archived`).
- Reused `MediaAsset.displayOrder` for gallery + cover.
- `User.id` set to Supabase Auth UUID on signup.
- `DesignerHouse.ownerUserId` links the house to the designer.

---

## APIs

See tables in [system-architecture.md](./system-architecture.md) §6 (Designer dashboard).

Façade: `src/lib/api/dashboard.ts`.

---

## Folder structure (new)

```
src/middleware.ts
src/lib/supabase/{client,server,middleware}.ts
src/server/auth/dashboard-session.ts
src/server/services/dashboard-product-service.ts
src/app/login/page.tsx
src/app/signup/page.tsx
src/app/dashboard/...
src/app/api/auth/{me,bootstrap}/
src/app/api/dashboard/...
src/components/dashboard/{DashboardShell,ProductEditor,MediaGalleryUploader,ProductPreview,Toast}.tsx
src/lib/api/dashboard.ts
```

---

## Future integration with Feed

Published products + `MediaAsset` rows are ready to be consumed by public catalog/feed in a later phase.

Do **not** change Feed UI in this phase. When integrating:

- Query `Product` where `status = published`
- Prefer `MediaAsset` ordered by `displayOrder` (or synced `Product.images`)
- Keep mock fallback until cutover flags are flipped
