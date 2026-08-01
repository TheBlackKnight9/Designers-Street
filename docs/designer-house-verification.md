# Designer House Verification & Investigation Report

**Date**: July 31, 2026  
**Status**: VERIFIED & FIXED (Final)

---

## 1. Executive Summary & Root Cause

The investigation traced why Designer House pages (`/designer/[handle]`) appeared empty or missing data under certain navigation flows.

### Root Causes Identified & Fixed

1. **Un-slugified / display-name based Navigation Links** — Multiple components were constructing designer URLs from `post.designerName.toLowerCase()` (raw display names with spaces, accented characters, etc.) instead of canonical handles or IDs. Clicking these links navigated to un-resolvable routes.

2. **Strict Single-Field Lookup** — `DesignerRepository.findByHandle` and `DesignerService.getByHandle` matched only on exact `handle`. Segments that were IDs or encoded differently returned `null` / "House Not Found".

3. **Unscoped Feed Query** — The designer "Posts" tab fetched global top 40 posts without filtering by `designerId`. Designers with few posts could always appear empty.

---

## 2. Design Decision — Canonical Identifier Policy

> **Handle is the canonical URL key. ID is the only valid fallback. Name is never used as a URL segment.**

This is documented in code comments in both `designer-repository.ts` and `designer-service.ts` to prevent regression.

| Lookup Order | Database Mode | Demo Mode |
|---|---|---|
| 1. Exact handle (case-insensitive) | ✅ | ✅ |
| 2. URL-decoded + slugified handle | ✅ | ✅ |
| 3. Database ID exact match | ✅ | ✅ |
| 4. ~~Display name~~ | ❌ Removed | ❌ Removed |

---

## 3. Files Modified

### Repository & Service Layer
- **`src/server/repositories/designer-repository.ts`** — Enhanced `findByHandle` with OR query: handle (exact/decoded/slugified) + id. Name removed.
- **`src/server/repositories/feed-repository.ts`** — Added `designerId` filter to `findFeedPage`.
- **`src/server/services/designer-service.ts`** — Updated `getByHandle` demo mode: handle + slugified + id. Name removed, comment added.
- **`src/server/services/public-catalog-service.ts`** — Added `designerId` option to `listFeed`.

### API Layer
- **`src/app/api/feed/route.ts`** — Added `designer` / `designerId` query param support.

### Client Façade
- **`src/lib/api/catalog.ts`** — Updated `listFeed` to accept + forward `designerId`.

### UI Components
- **`src/components/home/FeedPost.tsx`** — Fixed **both** designer links (header avatar + caption name) to use `encodeURIComponent(post.designerId)`.
- **`src/components/designer/DesignerGridPost.tsx`** — Added `designerHandle` prop; ShareButton now uses canonical handle → ID → fallback.
- **`src/components/media/ReelChrome.tsx`** — Replaced slugified `designerName` fallback with `encodeURIComponent(item.designerId)`.
- **`src/app/designer/[handle]/page.tsx`** — Passes `designerHandle` to `DesignerGridPost`; `listFeed` now scoped to `designer.id` with graceful general-feed fallback.

---

## 4. Navigation Entry Point Audit

| Entry Point | Link Source | Status |
|---|---|---|
| Feed — header avatar | `encodeURIComponent(post.designerId)` | ✅ Fixed |
| Feed — caption name | `encodeURIComponent(post.designerId)` | ✅ Fixed |
| Product page | `designer.handle` | ✅ Already correct |
| Editorial article | `designer.handle` | ✅ Already correct |
| Collection page | No designer links | ✅ N/A |
| Search overlay | `d.handle` | ✅ Already correct |
| Designer Spotlight | `designer.handle` | ✅ Already correct |
| Media Viewer / Reel | `item.designerHandle` → `encodeURIComponent(item.designerId)` | ✅ Fixed |
| DesignerGridPost share | `designerHandle` prop → `post.designerId` | ✅ Fixed |
| DesignerMiniSheet | `designer.handle` | ✅ Already correct |

---

## 5. Verification Results

### Automated
- **`npx tsc --noEmit`** → **PASS (0 errors)**
- **`npm run build`** → **PASS (55 pages, clean)**

### Manual Verification Checklist
- [ ] `/designer/maison-riviere` — loads banner, bio, posts, shop, lookbooks, story
- [ ] `/designer/atelier-kishangarh` — loads banner, bio, posts, shop, lookbooks, story
- [ ] Tap designer avatar in Feed → navigates to correct house
- [ ] Tap designer name in Feed caption → navigates to correct house
- [ ] Tap designer link on Product page → navigates to correct house
- [ ] Tap designer link in Editorial article → navigates to correct house
- [ ] Search for "Maison" or "Kishangarh" → correct house link in results
- [ ] Tap designer in Designer Spotlight → navigates to correct house
- [ ] Open media viewer (reel) → designer link navigates to correct house
