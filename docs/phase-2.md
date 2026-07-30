# Phase 2 — Media Foundation

## Architecture

```
Client / future dashboard
        │
        ▼
src/lib/api/media.ts          (façade)
        │
        ▼
POST/GET/DELETE /api/media/*  (Route Handlers)
        │
        ▼
MediaService
   ├── CloudinaryService   (upload / delete / sign / optimized URLs)
   └── MediaRepository     (Supabase via Prisma)
```

- **Database:** Supabase PostgreSQL (`media_assets` extended)
- **CDN:** Cloudinary (API secret server-only)
- **UI:** unchanged — mock mode still default

---

## Database changes

Extended existing `media_assets` (no breaking rename):

| Column | API field | Notes |
|--------|-----------|-------|
| `id` | `id` | cuid |
| `product_id` | `productId` | optional FK → products |
| `post_id` | `postId` | optional FK → posts |
| `designer_id` | `designerId` | optional FK → designer_houses |
| `story_id` | `storyId` | optional FK → stories |
| `owner_type` | `ownerType` | `product` \| `post` \| `designer` \| `story` \| `unattached` |
| `kind` | `type` | `image` \| `video` |
| `public_id` | `cloudinaryPublicId` | required |
| `url` | `secureUrl` | https delivery URL |
| `width` / `height` | same | optional |
| `duration_ms` | `duration` | video length in ms |
| `format` / `bytes` / `folder` | same | optional |
| `alt_text` | `altText` | nullable accessibility caption |
| `thumbnail_url` | `thumbnailUrl` | auto for videos (Cloudinary still); nullable for images |
| `display_order` | `displayOrder` | gallery order (default `0`) |
| `created_at` | `createdAt` | ISO string in API |

**Multiple media per product/post:** `product_id` / `post_id` are non-unique FKs. Lists order by `display_order`, then `created_at`.

Migrations:
- `prisma/migrations/20260730140000_media_foundation/`
- `prisma/migrations/20260730150000_media_gallery_metadata/`

---

## Cloudinary integration

`CloudinaryService` (`src/server/media/cloudinary.ts`):

| Method | Purpose |
|--------|---------|
| `createSignedUploadParams` | Client direct upload (secret never sent to browser) |
| `uploadImage` / `uploadVideo` / `upload` | Server-side upload |
| `deleteMedia` | Destroy by public_id |
| `getOptimizedUrl` | Transformation URL (`q_auto`, `f_auto`, …) |
| `getThumbnailUrl` | Video still-frame JPG URL |

### Folders (`src/server/media/folders.ts`)

Uploads default into organized folders (override with explicit `folder`):

| ownerType | Cloudinary folder |
|-----------|-------------------|
| product | `designers-street/products` |
| post | `designers-street/posts` |
| story | `designers-street/stories` |
| designer | `designers-street/designers` |
| unattached | `designers-street/unattached` |

Pass `ownerType` on sign/upload to pick the folder automatically.

Env:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MEDIA_MAX_IMAGE_MB=10
MEDIA_MAX_VIDEO_MB=100
# optional byte overrides:
# MEDIA_MAX_IMAGE_BYTES=
# MEDIA_MAX_VIDEO_BYTES=
```

---

## API endpoints

### `POST /api/media/upload`

**Sign (recommended for browser uploads):**

```json
{ "intent": "sign", "resourceType": "image", "ownerType": "product" }
```

Returns `{ cloudName, apiKey, timestamp, folder, signature, resourceType }` — **no API secret**.  
`folder` resolves to `designers-street/products` when `ownerType` is `product`.

**Register after signed upload:**

```json
{
  "intent": "register",
  "type": "image",
  "cloudinaryPublicId": "…",
  "secureUrl": "https://res.cloudinary.com/…",
  "width": 1200,
  "height": 1600,
  "productId": "prod-1",
  "altText": "Silk saree front",
  "displayOrder": 0
}
```

**Multipart server upload:** field `file` (+ optional `productId`, `postId`, `designerId`, `storyId`, `ownerType`, `folder`, `type`, `altText`, `displayOrder`).

On DB failure after Cloudinary upload, service attempts Cloudinary delete (rollback).

### `GET /api/media/:id`

Returns `MediaRecord`.

### `DELETE /api/media/:id`

Deletes DB row, then Cloudinary asset.

**Persistence requires** `USE_DATABASE=true` and valid `DATABASE_URL`. Signing works whenever Cloudinary env is set.

---

## Folder structure

```
src/server/media/cloudinary.ts      CloudinaryService
src/server/repositories/media-repository.ts
src/server/services/media-service.ts
src/server/types/media.ts
src/server/utils/media-validation.ts
src/server/errors/media.ts
src/app/api/media/upload/route.ts
src/app/api/media/[id]/route.ts
src/lib/api/media.ts
```

---

## Validation

| Kind | MIME | Max size |
|------|------|----------|
| image | jpeg, png, webp, gif | 10 MB |
| video | mp4, webm, mov | 100 MB |

---

## Security decisions

1. Cloudinary **API secret** only on server (`CLOUDINARY_API_SECRET`).
2. Prefer **signed uploads** (`intent: "sign"`) for browsers.
3. DB stores **secure URL + public_id** (+ metadata), never secrets.
4. RLS remains enabled on `media_assets`; Prisma uses DB connection role.

---

## Future usage

| Use case | How to attach |
|----------|----------------|
| Product gallery | `productId` + `ownerType: "product"` (many rows) |
| Feed post media | `postId` |
| Designer logo/banner | `designerId` |
| Stories | `storyId` |
| Staging / unlinked | `ownerType: "unattached"` |

No further schema change required for those owners.

---

## Façade (`src/lib/api`)

- `createMediaUploadSignature()`
- `registerMedia()`
- `getMedia(id)`
- `deleteMedia(id)`
- `uploadMediaFile(formData)`
