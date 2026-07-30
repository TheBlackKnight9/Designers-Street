# Demo Content & UI Audit Report

Date: 2026-07-30  
Scope: Marketplace completeness via existing mock/seed — **no redesign, no Phase 8, no new feed/reel systems**.

## What already existed

| Area | Status |
|------|--------|
| Designer houses | 7 in `mock-data.ts` |
| Products | 15 (most with lookbook videos) |
| Feed posts | 18 (12 with video; 8 `videoOnly`) |
| Stories | 7 rings |
| Categories | Nested tree (~39 nodes) with **duplicate slugs** |
| Local reel MP4s | 20 files under `public/videos/` via `fashion-videos.ts` |
| Continuous reel UX | **Intact** — `MediaViewer` + `GestureHandler` vertical swipe (“Swipe for more”), entered from feed/product/designer taps. **Not** a full-page TikTok snap route on `/feed` |
| Social (Phase 7) | Likes, comments/replies, follow, share, wishlist, feed ranking — wired; left unchanged |
| Seed | Synced mock → DB but **stripped `videoUrl`** and forced `mediaType: image` |

## What was missing

- Only ~7 designers (need 20–30)
- Only ~18 feed items (need 40–60 fashion reels)
- Nested categories with collisions → empty / confusing browse
- Several browse intents (kids, jewellery, bags, footwear, sustainable, streetwear, etc.) without dedicated products
- DB/API mode lost reel videos after seed
- Product videos not persisted as `MediaAsset` rows

## What was restored / fixed

1. **Seed writes `videoUrl` + `mediaType: video`** for reel posts; `commentsCount` / product `likesCount` seeded  
2. **`toFeedPost` sets `videoOnly`** when `mediaType === video`  
3. **Product lookbook videos** seeded as `MediaAsset` rows; UI mapper maps gallery videos → `Product.videos`  
4. **Product-backed feed fallback** includes `videoUrl` when media gallery has video  
5. **Category tree** replaced with **19 unique browse categories** (no duplicate slug overwrites)  
6. **Category product matching** also checks `subcategory` + `tags`  

## What new demo content was added

Source: `src/lib/demo-expand.ts`, merged in `src/lib/mock-data.ts`, seeded via `prisma/seed.ts`.

| Entity | Before | After |
|--------|-------:|------:|
| Designers | 7 | **30** (followers/following/posts, logos, banners, bios, verified flags) |
| Products | 15 | **60** (images, videos, price, sizes, colors, description, designer) |
| Feed / reels | 18 | **63** (**57** with `videoUrl`) |
| Stories | 7 | **23** |
| Browse categories | nested / colliding | **19** flat unique slugs |
| Empty categories | several risk | **0** (`emptyCats: []`) |

Browse categories: Sarees, Lehengas, Kurtas, Sherwanis, Dresses, Gowns, Indo-Western, Bridal, Men’s Wear, Women’s Wear, Kids, Jewellery, Bags, Footwear, Accessories, Sustainable Fashion, Luxury Couture, Streetwear, Occasion Wear.

## Reel scrolling — fully functional?

**Yes — within the existing architecture.**

- `/feed` remains Instagram-style **cards** + stories + infinite scroll + sort tabs  
- Tapping a video post opens **continuous Media Viewer** (vertical swipe reels discovery)  
- Implementation was **not removed**; not rewritten; not duplicated  
- After reseed, API mode keeps `videoUrl` so continuous entry works with `NEXT_PUBLIC_USE_API=true`

## Feature validation (no rewrites)

| Feature | Verdict |
|---------|---------|
| Vertical continuous reels (Media Viewer) | Working — left as-is |
| Likes / comments / replies / follow / share / wishlist | Phase 7 wiring intact |
| Stories strip on feed | Intact; expanded story rings |
| Feed ranking sorts | Intact |

## Remaining gaps

- Baseline products still use legacy category values like `coats` (still shoppable via Store/search; not a dedicated browse tile)  
- Demo videos are short synthetic MP4s (not full runway productions)  
- `videoOnly` is derived from DB `mediaType`, not a separate column (sufficient)  
- Manual QA recommended: open `/feed` → tap reel → swipe continuously; spot-check a few `/category/*` and `/designer/*` pages  

## How to refresh demo DB

```bash
npx prisma db seed
```

Requires `DATABASE_URL` and stopped processes that lock Prisma on Windows.
