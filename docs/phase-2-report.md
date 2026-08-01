# Phase 2 Report — Media Foundation

**Branch:** `feature/backend-foundation`  
**Date:** 2026-07-30  
**Status:** Complete — stopped before Designer Dashboard / Feed UI

---

## Summary

Built a production-oriented media stack (Cloudinary + Supabase/Prisma) behind new `/api/media/*` routes. **No shop UI, feed, or dashboard changes.** Mock defaults unchanged.

---

## Files added

| File | Role |
|------|------|
| `prisma/migrations/20260730140000_media_foundation/migration.sql` | Schema migration |
| `src/server/media/cloudinary.ts` | Expanded `CloudinaryService` |
| `src/server/repositories/media-repository.ts` | DB access |
| `src/server/services/media-service.ts` | Business logic + rollback |
| `src/server/types/media.ts` | `MediaRecord` DTO |
| `src/server/utils/media-validation.ts` | Type/size validation |
| `src/server/errors/base.ts` | Core `AppError` hierarchy (breaks circular import) |
| `src/server/errors/media.ts` | Media error classes |
| `src/app/api/media/upload/route.ts` | POST sign / register / multipart |
| `src/app/api/media/[id]/route.ts` | GET + DELETE |
| `src/lib/api/media.ts` | Façade helpers |
| `docs/phase-2.md` | Developer guide |
| `docs/phase-2-report.md` | This report |

## Files modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Extended `MediaAsset` + `MediaOwnerType`; relations on Product/Post/Designer/Story |
| `src/server/errors/index.ts` | Re-export base + media errors (no circular import) |
| `src/server/repositories/index.ts` | Export `MediaRepository` |
| `src/server/services/index.ts` | Export `MediaService` |
| `src/server/types/index.ts` | Export media types |
| `src/server/media/index.ts` | Export service types |
| `src/lib/api/index.ts` | Export media façade |

**Not modified:** any `page.tsx`, `ProductCard`, `FeedPost`, `StoriesStrip`, `TopBar`, `BottomNav`, feed routes.

---

## New APIs

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/media/upload` | `sign` \| `register` \| multipart upload |
| GET | `/api/media/:id` | Fetch metadata |
| DELETE | `/api/media/:id` | Delete DB + Cloudinary |

---

## Database changes

- Enum `MediaOwnerType`
- Columns on `media_assets`: `product_id`, `post_id`, `designer_id`, `story_id`, `owner_type`, `format`, `bytes`, `folder`, `updated_at`, `alt_text`, `thumbnail_url`, `display_order`
- `public_id` required
- Non-unique FKs + `(owner_fk, display_order)` indexes → **multiple media per product/post**
- Applied on Supabase project `jwqpqlifszfveuldpujn`

---

## Environment variables

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
DATABASE_URL=
USE_DATABASE=false   # set true to persist media
MEDIA_MAX_IMAGE_MB=10
MEDIA_MAX_VIDEO_MB=100
```

---

## Verification checklist

| Check | Result |
|-------|--------|
| `npx prisma generate` | ✅ |
| `npm run build` | ✅ (exit 0; media routes listed) |
| `npm run lint` | ⚠️ Pre-existing errors in UI contexts/admin only; no new media-route lint failures |
| `npm run dev` + `/api/health` | ✅ (after circular-import fix) |
| `POST /api/media/upload` `{ "intent": "sign" }` | ✅ Signed params; no API secret in response |
| `GET /api/media/:id` (DB off) | ✅ Rejects with clear error (`USE_DATABASE` required) |
| `GET /api/media/:id` (DB on, missing) | Returns `NOT_FOUND` when persistence enabled |
| Existing `/api/products`, `/categories`, `/designers`, `/feed`, `/feed/stories` | ✅ |
| Circular import `AppError` ↔ `media` errors | ✅ Fixed via `errors/base.ts` |
| Schema on Supabase | ✅ |
| UI pages untouched | ✅ |
| Mock mode default | ✅ |
| Persist/delete require `USE_DATABASE=true` | ✅ (by design) |

---

## Known limitations

1. **Persist APIs need `USE_DATABASE=true` + `DATABASE_URL`** — signing works with Cloudinary alone.
2. **No auth gate on media routes yet** — Phase 2 backend-only; protect in dashboard phase.
3. **Product.images string[]** still used by UI — media table is additive; wire later without breaking mock images.
4. Pre-existing ESLint errors in legacy UI files remain.

---

## Next phase prerequisites

- Set `DATABASE_URL` + `USE_DATABASE=true` for real uploads
- Optional: `npx prisma migrate resolve --applied 20260730140000_media_foundation`
- Designer Dashboard can call `createMediaUploadSignature` + `registerMedia`
- Feed can attach via `postId` / `storyId`

---

## Stop

Phase 2 media foundation complete. **Do not start Designer Dashboard or Feed work** until approved.
