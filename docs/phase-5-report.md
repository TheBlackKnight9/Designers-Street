# Phase 5 Report — Universal Media Experience

**Date:** 2026-07-30  
**Branch:** `feature/backend-foundation`  
**Status:** Complete (stop before social/commerce)

## Summary

Delivered a single **Universal Media Viewer** used from Product Detail, Feed, ProductCard (Home/Store/Category), and Designer Profile. Image and video paths are separate; Cloudinary delivery uses `f_auto` / `q_auto` / sized transforms; only one video plays at a time; analytics events are wired as noops. Existing page layouts and dashboard were not redesigned.

---

## Viewer architecture

```
MediaViewerProvider (root layout)
  → openMediaViewer({ media, initialIndex, syncUrl?, source? })
  → MediaViewer (createPortal → body)
       MediaOverlay (z-[90], dialog, scroll lock via hook)
       MediaControls
       GestureHandler → ImageViewer | VideoViewer
       ThumbnailStrip (windowed)
```

Controller: `useMediaViewer` — index, next/prev, zoom, adjacent preload, keyboard, focus trap, optional `?media=` sync, analytics calls.

---

## Component hierarchy

| Component | Role |
|-----------|------|
| `MediaOverlay` | Fullscreen black scrim, `role="dialog"` |
| `MediaControls` | Close, `N / M` counter, desktop prev/next |
| `GestureHandler` | Swipe gallery, pinch/wheel zoom, double-tap zoom |
| `ImageViewer` | Progressive stills, pan when zoomed, retry on error |
| `VideoViewer` | Play/pause/mute/seek; registers with playback coordinator |
| `ThumbnailStrip` | Virtualized absolute-position thumbs |

---

## Hook architecture

`useMediaViewer({ media, initialIndex, open, syncUrl, source, onClose })`

- Clamps index; resets zoom on navigate  
- Preloads only `index ± 1`  
- ESC / arrows / +/- zoom  
- Focus trap on tabbable controls inside the shell  
- `history.replaceState` for `?media=` when `syncUrl`  

Global API: `useOpenMediaViewer()` from `MediaViewerContext`.

---

## URL synchronization

- PDP opens with `syncUrl: true` → `/product/{id}?media={index}`  
- Refresh re-reads `media` query and reopens the viewer  
- Close removes the query param  

---

## Gesture handling

- Gallery: horizontal swipe → next/prev (disabled while zoomed)  
- Continuous: vertical swipe up/down → next/prev (Reels-style)  
- Pinch / Ctrl+wheel → zoom (gallery); wheel advances continuous feed  
- Double-tap / double-click → toggle zoom (images)  
- Pointer drag pans when zoomed  

---

## 14. Media Discovery & Continuous Viewing

When the starting item is a **video** (or `continuous: true`), the viewer hides thumbnails and builds an infinite queue via `MediaRecommendationService`:

1. Same product videos  
2. Same designer videos  
3. Similar product videos (category / tags / colors / price)  
4. Image fallback (same fullscreen, no mode switch)

Cursor pagination + session `seen` set avoid repeats **within** one continuous open. Viewer never imports strategy internals.

**Continue watching:** `watch-progress.ts` resumes video position across sessions (cleared on complete).

**Smart queue reset:** Opening continuous on a different product/post clears prior recommendation memory and builds a new queue from that seed.

---

## Accessibility

- ESC closes; arrow keys navigate (↑/↓ in continuous mode)  
- Focus trap while open; body scroll locked  
- Counter `aria-live="polite"`; thumbnails as `listbox` / `option`  
- Dialog labeling on overlay  

---

## Performance decisions

- ESC closes; arrow keys navigate  
- Focus trap while open; body scroll locked  
- Counter `aria-live="polite"`; thumbnails as `listbox` / `option`  
- Dialog labeling on overlay  

---

## Performance decisions

- Memoized `MediaViewer`  
- Adjacent-only preload  
- Virtualized thumbs (overscan window)  
- Progressive image tiers; full resolution on zoom  
- Lazy thumb `loading="lazy"`  

---

## Cloudinary optimization

`src/lib/media/cloudinary-delivery.ts`:

- Detects Cloudinary host URLs and injects transforms after `/upload/`  
- Or builds from `publicId` + `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  
- Tiers: `thumb` / `medium` / `full` / `stream`  
- Non-Cloudinary URLs (mock Unsplash) pass through unchanged  

`MediaItemDTO.publicId` populated from `MediaAsset` when present.

---

## Analytics hook locations

`trackMediaEvent` in `src/lib/media/media-analytics.ts` (noop):

| Event | Fired from |
|-------|------------|
| `media_opened` / `media_closed` | `useMediaViewer` |
| `media_swipe_next` / `media_swipe_previous` | `goTo` |
| `media_zoom` | zoom setters |
| `video_play` / `video_pause` / `video_completed` | `VideoViewer` |

---

## Files changed / added

**Added**

- `src/components/media/*`  
- `src/hooks/useMediaViewer.ts`  
- `src/context/MediaViewerContext.tsx`  
- `src/lib/media/*`  
- `src/lib/media/recommendation/*`  
- `src/lib/media/watch-progress.ts`  
- `docs/phase-5.md`, `docs/phase-5-report.md`  

**Updated**

- `src/app/layout.tsx` — provider  
- `src/app/product/[productId]/page.tsx` — open + URL restore  
- `src/components/home/FeedPost.tsx` — tap opens viewer (continuous for video-only)  
- `src/components/ui/ProductCard.tsx` — expand opens first video when present  
- `src/app/designer/[handle]/page.tsx` — post grid opens viewer  
- `src/hooks/useMediaViewer.ts` — continuous queue + prefetch  
- `src/components/media/GestureHandler.tsx` — vertical axis  
- `src/context/MediaViewerContext.tsx` — `continuous` flag  
- `src/server/dto/public.ts` + mappers — optional `publicId`  
- `.env.example` — `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  
- `docs/system-architecture.md`  

---

## Verification checklist

- [x] Implementation complete per Phase 5 scope (+ §14 continuous discovery)  
- [x] `npm run build`  
- [x] Phase 5 media modules pass ESLint  
- [ ] Manual smoke: Home / Feed / Store / PDP / Designer media open  
- [ ] Manual: URL sync on PDP (`?media=N`)  
- [ ] Manual: Gallery swipe / keyboard / zoom  
- [ ] Manual: Continuous vertical swipe from a video (product card / feed)  
- [ ] Manual: Leave mid-video → reopen resumes timestamp  
- [ ] Manual: Open continuous on product B after product A → new queue from B  
- [ ] Manual: Video play + single active video  
- [ ] Manual: Cloudinary transforms on Cloudinary URLs  
- [ ] Manual: Dashboard + mock mode still work  

---

## Known limitations

- Feed posts still expose a single cover image (Phase 4 feed mapping); multi-asset feed galleries need richer feed DTOs later  
- Pinch zoom is approximate (no native gesture library)  
- In-memory playback coordinator is per JS realm (fine for SPA; multi-tab independent)  
- StoryViewer remains separate; can share Image/Video primitives in a follow-up  
- `useMediaViewer` open/close analytics may fire with stale index on rapid close  
- Recommendation pool is mock catalog today; swap `catalog.ts` for API cursor pages later  
- AI / personalized / sponsored strategies not implemented (hooks exist via strategy list)  

---

## Next phase prerequisites

- Do not start likes/comments/cart/checkout here  
- Optional: wire StoryViewer onto shared primitives  
- Optional: Redis-backed rate limits / real analytics vendor behind existing stubs  
- When Saved Items ships, call `openMediaViewer` with the same adapters  
- Optional: replace mock `getMediaPool()` with backend recommendation API  

---

## Stop condition

Stopped after Universal Media Viewer, image/video experiences, gallery navigation, continuous media discovery, URL sync, Cloudinary optimization, accessibility, performance, and documentation. No social or commerce features.
