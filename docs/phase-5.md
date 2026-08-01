# Phase 5 — Universal Media Experience

**Status:** Implemented  
**Supersedes:** Narrow “Fullscreen Media Experience” / separate image vs vertical-video viewers in the original roadmap  
**Depends on:** Phase 2 (MediaAsset + Cloudinary), Phase 4 (public `gallery` / `coverImage` / `videoPreview` DTOs)

---

## Goal

Ship **one** polished media system used across the entire app. After Phase 5, every image and video open from Feed, Store, PDP, Designer Profile, Home product cards, and future Saved Items uses the same viewer, interactions, transitions, and controls.

Do **not** build per-surface viewers (Feed-only, PDP-only, etc.).

---

## Locked architecture

```
MediaViewerProvider (layout)
└── MediaViewer (portal shell)
    ├── MediaOverlay
    ├── MediaControls          — close, counter, prev/next
    ├── GestureHandler         — swipe / pinch / double-tap / wheel
    ├── ImageViewer | VideoViewer
    └── ThumbnailStrip         — gallery mode only

useMediaViewer()               — index, zoom, preload, keyboard, URL sync, continuous queue
MediaPlaybackCoordinator       — single active video app-wide
cloudinary-delivery            — f_auto / q_auto / widths / video profiles
media-analytics (noop)         — open/close/swipe/zoom/play/pause/complete
MediaRecommendationService     — continuous discovery (viewer asks for “next” only)
media[] + currentIndex
```

### Data contract

```ts
type ViewerMediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string | null;
  publicId?: string | null;
  alt?: string;
  productId?: string;
  postId?: string;
  designerId?: string;
  category?: string;
  tags?: string[];
  price?: number;
  colors?: string[];
};
```

Adapters: `productToViewerMedia`, `feedPostToViewerMedia`, `mediaItemsToViewerMedia`, `urlsToViewerMedia`.

---

## Mandatory requirements (13) — satisfied

1. Universal `MediaViewer` (+ Image / Video / Thumbs / Controls / Gestures / Overlay)  
2. Always `media[]` + `currentIndex`  
3. `useMediaViewer()` owns open lifecycle logic used by the shell  
4. Adjacent preload only (`N-1`, `N+1`)  
5. Separate `ImageViewer` / `VideoViewer`  
6. URL sync via `?media=N` (PDP; `syncUrl: true`; disabled in continuous mode)  
7. Virtualized `ThumbnailStrip` (gallery mode)  
8. Progressive stills: thumb underlay → medium → full on zoom  
9. A11y: ESC, arrows, focus trap, labels, ARIA dialog  
10. Reuse: Feed, Home/Store cards, PDP, Designer posts (+ provider for Saved Items)  
11. Single active video via `MediaPlaybackCoordinator`  
12. Cloudinary `f_auto` / `q_auto` / widths (non-Cloudinary URLs unchanged)  
13. Analytics stubs in `trackMediaEvent` — no vendor  

---

## 14. Media Discovery & Continuous Viewing

When a user opens a **video** from Feed, Store, PDP, Product Card, or Designer Profile, they enter an Instagram Reels–style continuous vertical experience. Opening an image keeps **gallery mode** (horizontal swipe + thumbnails).

### Behavior

- Vertical swipe (up = next, down = previous); ArrowDown / ArrowUp; trackpad wheel  
- No dead end after one video — queue grows via cursor pagination  
- Preload adjacent items (poster/thumb for videos)  
- Session dedupe so the same media is not repeated while browsing  

`continuous` defaults to `true` when the starting item is a video (`OpenMediaViewerOptions.continuous` can override).

### Continue Watching

`src/lib/media/watch-progress.ts` stores last playback position per media id (localStorage). Leaving mid-video and reopening resumes near that timestamp (e.g. `01:42 / 03:15`). Progress clears when the video completes or is within a few seconds of the end.

### Smart queue reset

Each continuous open starts a **new** recommendation queue from the tapped seed. If the seed product/post differs from the previous continuous session, prior `sessionSeen` state is cleared so Priority 1–4 rebuild from that product — the old journey is never continued.

### Architecture

```
MediaViewer
      ↓
MediaRecommendationService
      ↓
Recommendation Strategy
      ├── Same Product      (remaining videos on this product)
      ├── Same Designer     (other products’ videos)
      ├── Similar Products  (category / tags / colors / price; videos only)
      └── Image Fallback    (seamless stills when videos run out)
```

The viewer only asks for “next media.” It does not know which strategy produced an item. Strategies can later add AI, personalization, trending, or sponsored slots without changing `MediaViewer`.

### Files

```
src/lib/media/recommendation/
  types.ts
  catalog.ts      — media pool from products + feed (API-ready later)
  strategies.ts
  service.ts      — MediaRecommendationService + session seen set
  index.ts
```

---

## Integration map

| Surface | Open trigger | Mode |
|---------|----------------|------|
| Product detail | Tap hero → gallery; **Lookbook** control → continuous video | Gallery for images; continuous for lookbook video |
| Feed | Single tap (double-tap still likes) | Continuous when post has `videoUrl` / `videoOnly` |
| Home / Store / Category | Expand on `ProductCard` | Continuous when product has videos (starts at first video) |
| Designer profile | Tap post grid | Continuous when post has a video |
| Saved Items | Call `useOpenMediaViewer()` when built | Same rules |

---

## File layout

```
src/components/media/
  MediaViewer.tsx
  ImageViewer.tsx
  VideoViewer.tsx
  ThumbnailStrip.tsx
  MediaControls.tsx
  GestureHandler.tsx
  MediaOverlay.tsx
  index.ts

src/hooks/useMediaViewer.ts
src/context/MediaViewerContext.tsx

src/lib/media/
  types.ts
  cloudinary-delivery.ts
  playback-coordinator.ts
  media-analytics.ts
  adapters.ts
  recommendation/
  index.ts
```

---

## Out of scope (honored)

Likes/comments/saves/shares, search, cart/checkout/orders/payments, notifications, real analytics vendors, UI redesign.  
AI / personalized / sponsored recommendation ranking (service is future-ready; not implemented).

---

## Related

- [phase-5-report.md](./phase-5-report.md)  
- [phase-2.md](./phase-2.md) — media foundation  
- [phase-4.md](./phase-4.md) — public gallery DTOs  
- [system-architecture.md](./system-architecture.md)  
