# Environment Variables

## Summary

Phase 1.1 uses **Supabase** (Postgres + Auth config) and **Cloudinary** (media config).  
**None are required** for the existing UI while `USE_DATABASE=false` and `NEXT_PUBLIC_USE_API=false`.

```bash
copy .env.example .env
```

Never commit secrets. `.env` is gitignored; `.env.example` is committed with placeholders only.

---

## Required shape (`.env.example`)

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

## Application / façade

| Variable | Purpose | Required? | Example | Where used |
|----------|---------|-----------|---------|------------|
| `NODE_ENV` | Runtime mode | No | `development` | Next / health |
| `NEXT_PUBLIC_APP_URL` | Origin for server fetch to `/api` | No | `http://localhost:3000` | `src/lib/api/catalog.ts` |
| `NEXT_PUBLIC_USE_API` | Façade uses `/api/*` vs mock | No | `false` | `src/lib/api/catalog.ts` |
| `USE_DATABASE` | Services use Prisma vs mock | No | `false` | `src/server/utils/env.ts` |
| `PUBLIC_API_RATE_LIMIT_MAX` | Max public catalog requests per IP per window | No | `120` | `src/server/utils/rate-limit.ts` |
| `PUBLIC_API_RATE_LIMIT_WINDOW_SEC` | Rate-limit window (seconds) | No | `60` | same |

---

## Supabase

| Variable | Purpose | Required? | Where to get it | Where used |
|----------|---------|-----------|-----------------|------------|
| `DATABASE_URL` | Postgres URI for Prisma | When `USE_DATABASE=true` | Project Settings → Database → URI | Prisma / `src/server/db.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | API URL | For Auth clients | Project Settings → API | `src/server/auth/supabase.ts` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Modern publishable key (preferred) | For Auth clients | Project Settings → API | `src/server/auth/supabase.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy anon JWT (fallback) | Optional if publishable set | Project Settings → API | same |
| `SUPABASE_SERVICE_ROLE_KEY` | Server admin key | Server tasks only | Project Settings → API → `service_role` | `createSupabaseServiceClient` |

Project **desginer ef** ref: `jwqpqlifszfveuldpujn`  
URL: `https://jwqpqlifszfveuldpujn.supabase.co`

---

## Cloudinary

| Variable | Purpose | Required? | Where used |
|----------|---------|-----------|------------|
| `CLOUDINARY_CLOUD_NAME` | Cloud name | For media util | `src/server/media/cloudinary.ts` |
| `CLOUDINARY_API_KEY` | API key | For media util | same |
| `CLOUDINARY_API_SECRET` | API secret | For media util | same |
| `MEDIA_MAX_IMAGE_MB` | Max image size (MB) | No (default 10) | `media-validation.ts` |
| `MEDIA_MAX_VIDEO_MB` | Max video size (MB) | No (default 100) | same |
| `MEDIA_MAX_IMAGES_PER_PRODUCT` | Gallery image cap | No (default 10) | dashboard product service |
| `MEDIA_MAX_VIDEOS_PER_PRODUCT` | Gallery video cap | No (default 3) | same |

### Designer dashboard (Phase 3)

Requires `USE_DATABASE=true`, valid `DATABASE_URL`, Supabase Auth URL/keys, and Cloudinary for uploads.

Routes: `/login`, `/signup`, `/dashboard/*` (middleware-protected).

| Key | Purpose |
|-----|---------|
| `ds_designers` / `ds_products` / `ds_promo` | Admin catalog |
| `ds-cart` | Cart |
| `ds-wishlist` | Wishlist |
