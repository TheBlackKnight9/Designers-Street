# Architecture Audit & Feature Roadmap

**Status:** Documentation only — no code written. Awaiting approval.  
**Branch:** `docs/local-development-setup`  
**Date:** 2026-07-30  
**Principle:** Extend the existing architecture. Do not invent a parallel stack, design language, or folder convention.

---

# Part A — Architecture Audit

## 1. Complete Routing Structure

Next.js **App Router** under `src/app/`. Almost every page is `"use client"`. Root `layout.tsx` is the only shared layout; there is **no** nested route-group layout (e.g. `(shop)/layout.tsx`).

| Route | File | Kind | Purpose |
|-------|------|------|---------|
| `/` | `app/page.tsx` | Static ○ | Home: hero, categories, featured, product grid, footer |
| `/feed` | `app/feed/page.tsx` | Static ○ | Stories + Instagram-style feed |
| `/category` | `app/category/page.tsx` | Static ○ | Category posters / tree entry |
| `/category/[slug]` | `app/category/[slug]/page.tsx` | Dynamic ƒ | PLP: filters, sort, `ProductCard` grid |
| `/store` | `app/store/page.tsx` | Static ○ | Shop-all catalog with same filter strip pattern |
| `/product/[productId]` | `app/product/[productId]/page.tsx` | Dynamic ƒ | PDP: gallery, size, bag, wishlist, customize CTA |
| `/designer/[handle]` | `app/designer/[handle]/page.tsx` | Dynamic ƒ | Designer house profile (posts / shop tabs) |
| `/cart` | `app/cart/page.tsx` | Static ○ | Bag lines + totals |
| `/wishlist` | `app/wishlist/page.tsx` | Static ○ | Saved products grid |
| `/profile` | `app/profile/page.tsx` | Static ○ | Guest account shell |
| `/bespoke` | `app/bespoke/page.tsx` | Static ○ | Multi-step customization / consultation UI |
| `/admin` | `app/admin/page.tsx` | Static ○ | Local catalog CRUD (ungated) |

Dynamic params use **`params: Promise<{…}>`** + React **`use(params)`** (Next 15/16 convention).

**Not present:** `/api/*`, middleware, auth routes, designer dashboard routes, media upload routes.

---

## 2. Every Reusable Component and Purpose

### Shell / navigation

| Component | Path | Purpose |
|-----------|------|---------|
| `TopBar` | `components/TopBar.tsx` | Fixed wordmark header; opens search; wishlist/cart badges |
| `BottomNav` | `components/BottomNav.tsx` | Fixed 5-tab nav (Home, Feed, Category, Store, Profile) via `usePathname` |
| `SearchOverlay` | `components/SearchOverlay.tsx` | Full-screen search modal (trending + designer/product hits) |
| `Footer` | `components/Footer.tsx` | Dark brand footer (used on home) |

### Catalog UI

| Component | Path | Purpose |
|-----------|------|---------|
| `ProductCard` | `components/ui/ProductCard.tsx` | Grid card: image, rating, quick-add, double-tap wishlist, price/MRP/best-price |
| `Button` | `components/ui/Button.tsx` | Neumorphic CTA (`primary` / `inverted`); `href` or `onClick` |

### Feed / stories

| Component | Path | Purpose |
|-----------|------|---------|
| `StoriesStrip` | `components/home/StoriesStrip.tsx` | Horizontal story avatars + seen state |
| `StoryViewer` | `components/home/StoryViewer.tsx` | Fullscreen story slides, progress bars, tap zones, 5s auto-advance |
| `FeedPost` | `components/home/FeedPost.tsx` | Instagram-style post: header, image, like/double-tap, product tag, cart |

### Page-local (not shared yet)

Hero carousels, store/category filter strips, PDP sections, bespoke wizard steps, and the entire admin dashboard live **inside page files**. Extract only when a second consumer appears.

---

## 3. Layouts and Navigation Flow

### Layout composition (de facto pattern)

```
RootLayout (providers + body bg-paper)
  └── Page
        ├── TopBar (+ spacer)
        ├── <main className="min-h-screen …">
        ├── BottomNav (body also pads for nav height)
        └── [optional Footer]
```

Admin **does not** use TopBar/BottomNav — it is a full-screen dashboard chrome of its own.

### Primary user flows

```
BottomNav Home ──► / ──► ProductCard ──► /product/[id]
                 └──► Category posters ──► /category/[slug]
                 └──► Designer shelf ──► /designer/[handle]

BottomNav Feed ──► /feed ──► StoriesStrip ──► StoryViewer (overlay)
                 └──► FeedPost ──► /designer/… or /product/… or /category/…

TopBar Search ──► SearchOverlay ──► product / designer links
TopBar Heart ──► /wishlist
TopBar Bag   ──► /cart

PDP customizable ──► /bespoke
Profile          ──► guest shell (future auth)
Admin            ──► /admin (local CRUD → DataContext)
```

Overlays (z-index ladder): TopBar `z-50` → SearchOverlay `z-[70]` → StoryViewer `z-[80]`.

---

## 4. Design System

Source of truth: `src/app/globals.css` (+ Tailwind v4 `@theme inline`).

### Colors

| Token | Hex | Role |
|-------|-----|------|
| `paper` | `#FDFCF8` | Primary canvas |
| `mist` | `#F3F0E9` | Soft surface |
| `cloud` | `#E3DBCC` | Nude accent |
| `charcoal` | `#101010` | High-contrast / primary buttons |
| `graphite` | `#2E2B27` | Secondary |
| `stone` | `#787268` | Muted |
| `silver` | `#A8A196` | Ghost |
| `gold` / gold-zari | `#C5A059` | Story-ring accent |

JSX also hardcodes cousins (`#2B2B2B`, `#FAFAFA`, `#A0A0A0`, `#E0E0E0`) — match the surrounding page when extending.

### Typography

- `font-sans` — SF Pro / Helvetica system UI  
- `font-display` — serif/UI-serif for wordmarks & section titles  
- Pattern: uppercase labels + `tracking-nav` / `tracking-label` / `tracking-widest`

### Spacing & chrome

- Top bar: `52px`; bottom nav: `64px` + safe-area  
- Page gutters: typically `px-4`  
- Product grids: `grid-cols-2 gap-3` (mobile-first)

### Visual language

Neumorphism utilities: `.curvy-card`, `.curvy-btn`, `.curvy-btn-dark`, `.curvy-input`, `.neu-raised-sm`, `.neu-inset`, `.product-card`, `.bottom-nav-glass`, `.story-ring`.

### Animations

`fade-up` / `fade-in`, `slide-up`, `scale-in`, `heart-pop`, `story-progress`, stagger children; `prefers-reduced-motion` respected.

**Rule for new UI:** reuse these tokens/classes. Do not introduce a second palette, card system, or icon library unless approved.

---

## 5. Responsive Strategy

**Mobile-first, phone-centric commerce app.**

| Technique | Where |
|-----------|--------|
| Viewport locked | `userScalable: false`, `maximumScale: 1` in root layout |
| 2-column product grids | Wishlist, store, category, related products |
| Occasional `sm:` breakpoints | Home hero aspect (`4/5` → `16/9`), featured `grid-cols-12` + `sm:col-span-*`, typography bumps |
| Horizontal shelves | `overflow-x-auto hide-scrollbar` (stories, designers, chips) |
| Sticky filter bars | Store / category under top bar |
| Touch targets | `.touch-target` 44×44; press feedback `.btn-press` |
| Image `sizes` | Mobile-aware (`50vw` grids, `100vw` heroes) |

Desktop is a stretched phone layout, not a separate desktop IA. New features should stay mobile-first.

---

## 6. Current Data Flow

```
mock-data.ts (seed)
       │
       ├─► static imports (FEED_POSTS, STORIES, CATEGORIES, some PRODUCTS)
       │
       └─► DataContext initial state
                │
                ├─► localStorage ds_designers / ds_products / ds_promo
                │
                └─► useData() → Home / Store / PDP / Designer / Category / Admin

CartContext  ←→ localStorage ds-cart  ←→ TopBar badge, Cart page, ProductCard, FeedPost
WishlistContext ←→ localStorage ds-wishlist ←→ TopBar, Wishlist, ProductCard, FeedPost, PDP
```

**Mutation path today:** Admin forms → `add/update/delete*` on `DataContext` → React state + `localStorage`. No network.

**Read inconsistency:** Wishlist + Search still filter static `PRODUCTS`/`DESIGNERS` from mock-data, so admin-created items may not appear there. Store/PDP/home (via `useData`) do.

---

## 7. React Contexts and Custom Hooks

| Context | Hook | API surface | Storage |
|---------|------|-------------|---------|
| `DataProvider` | `useData()` | `designers`, `products`, `promoBanner`, CRUD, `updatePromoBanner`, `resetToDefaults` | `ds_*` |
| `CartProvider` | `useCart()` | `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `total`, `itemCount`, `isOpen`/`openCart`/`closeCart` | `ds-cart` |
| `WishlistProvider` | `useWishlist()` | `ids`, `isWished`, `toggle`, `count` | `ds-wishlist` |

There are **no** standalone `src/hooks/*` files. Custom hooks are the three `use*` exports above.

**Extension pattern:** add a new Context next to these (e.g. `AuthContext`, `FeedContext`) **or** grow `DataContext` only when the data is catalog-scoped. Prefer small focused contexts matching Cart/Wishlist style.

---

## 8. Mock Data Structure & Future API Replacement

### Seed modules (`src/lib/mock-data.ts`)

| Export | Type | Role |
|--------|------|------|
| `DESIGNERS` | `DesignerHouse[]` | Houses |
| `PRODUCTS` | `Product[]` | Catalog |
| `CATEGORIES` | `Category[]` (nested `children`) | Taxonomy |
| `STORIES` | `StoryItem[]` | Story rail |
| `FEED_POSTS` | `FeedPostData[]` | Feed |
| Helpers | functions | `formatPrice`, getters, `findCategoryBySlug` |

### How to replace with APIs **without** a parallel architecture

1. Keep **`src/lib/types.ts`** as the contract (extend fields; don’t rename casually).  
2. Introduce a thin **`src/lib/api/`** (or `src/lib/data/`) with functions that return the **same types** (`getProducts()`, `getDesignerByHandle()`, etc.).  
3. Point **`DataContext`** (and later Feed) at those functions instead of importing seed arrays — same provider API (`useData()`).  
4. Keep `mock-data.ts` as **dev fallback / seed** until backend is live.  
5. Do **not** introduce a second product shape for “API product” vs “UI product.” Map once at the API boundary.

Suggested swap order: Products/Designers (already behind context) → Feed/Stories → Categories → Cart/Wishlist sync → Admin writes.

---

## 9. Product Model and Related Types

Canonical definitions: `src/lib/types.ts`.

### `Product`

Identity: `id`, `name`, `designerName`, `designerId`  
Commerce: `price`, `mrp?`, `bestPrice?`, `sizes[]`, `colors?`  
Media: `images: string[]` (HTTPS URLs only today)  
Taxonomy: `category`, `subcategory?`, `gender`, `occasion?`, `tags?`  
Editorial: `description`, `story?`, `craftOrigin?`, `material?`, `technique?`, `fit?`  
Flags: `verified?`, `piecesRemaining?`, `limitedEdition?`, `customizable?`, `rating?`, `deliveryText?`

### Related

- **`DesignerHouse`** — house profile; `handle` drives `/designer/[handle]`; `offersBespoke`  
- **`Category`** — recursive tree for PLP/nav  
- **`CartItem`** — denormalized line (`productId`, `name`, `brand`, `price`, `size`, `image`, `quantity`)  
- **`BespokeConfig`** — customization payload (typed but bespoke page uses inline state today)  
- **`FilterState`** — intended filter model (partially mirrored by store/category local state)  
- **`FeedPostData` / `StoryItem` / `StorySlide`** — social layer (image-only today)

---

## 10. Wishlist, Cart, Profile, Store Architecture

### Wishlist

- IDs-only in context; UI resolves products via **static** `PRODUCTS` on `/wishlist`.  
- Toggle from `ProductCard`, PDP, `FeedPost` (sometimes uses post/productTag id — watch consistency).  
- Double-tap-to-wish on cards / like animation patterns shared with feed.

### Cart

- Full line objects in context; `/cart` renders qty controls + INR totals via `formatPrice`.  
- Quick-add from `ProductCard` / `FeedPost` uses first size or `"M"`.  
- `isOpen` exists for a drawer pattern but primary UX is the `/cart` page.

### Profile

- Presentational Guest shell; sections are non-navigating placeholders.  
- Natural home for **buyer auth**, orders, measurements, addresses later — **same route**, richer content.

### Store

- `useData().products` + local sort/quick-filter/size state (`useMemo`).  
- UI pattern twin of `/category/[slug]` (sticky SORT/SIZE strip + chip row + 2-col grid).  
- Reuse this PLP pattern for any new catalog views.

### Admin (related)

- Full CRUD over designers/products/promo via `useData`.  
- Prototype of a **designer dashboard** — but global/ungated and monolithic. Designer-scoped dashboard should **narrow** this UI, not replace it with a different design system.

---

## 11. Current Performance Optimizations

| Optimization | Present? | Notes |
|--------------|----------|-------|
| `next/image` | Yes | Remote allowlist; `fill` + `sizes`; some `priority` on heroes/PDP/stories |
| Turbopack | Yes | `next dev` |
| Context memoization | Partial | Cart/Wishlist use `useCallback`/`useMemo`; DataContext less so |
| List memo filters | Yes | Store/category `useMemo` for sorted/filtered lists |
| Code splitting | Default | Per-route; no manual `dynamic()` |
| Virtualization | No | Fine for current mock sizes |
| Server Components / RSC data | Minimal | Pages are client; layout is server for metadata only |
| Caching / SWR / React Query | No | No network layer yet |
| Bundle splitting for admin | No | Admin is a large client page |

---

## 12. Opportunities to Extend Without Breaking Consistency

1. **Unify catalog reads on `useData()`** (wishlist, search) — same architecture, fewer bugs.  
2. **Optional `(shop)/layout.tsx`** wrapping TopBar + BottomNav — same chrome, less duplication (only if approved).  
3. **Grow `FeedPostData` / `StorySlide`** with optional `videoUrl` / `mediaType` — extend StoryViewer & FeedPost rather than new apps.  
4. **Promote admin sections** into `components/admin/*` while keeping `/admin` route and neumorphic forms.  
5. **`src/lib/api/*` façade** matching existing helper names — contexts stay the UI API.  
6. **AuthContext** beside Cart/Wishlist; gate `/admin` and future `/designer/dashboard`.  
7. **Reuse `/bespoke` + `BespokeConfig` + `Product.customizable`** for product customization — pass `productId` query.  
8. **Media still ends as URL strings on entities** — upload service writes URL into `images[]` / `logo` / feed fields.  
9. **Fullscreen viewers** as overlays in `components/home/` or `components/media/` following `StoryViewer` (fixed inset, high z-index, body scroll lock).  
10. Stay on **feature branches**; never push `main`/`master`.

---

# Part B — Feature Roadmap (Fit Into Existing Architecture)

For each feature: **where it lives**, **what to reuse**, **what to extend**, **what not to do**.

---

## Phase 0 — Foundation (before feature builds)

| Work | Fits where |
|------|------------|
| Unify wishlist/search on `useData()` | Existing pages/components only |
| API façade stubs returning mock types | `src/lib/api/` → consumed by contexts |
| Auth placeholder context | `src/context/AuthContext.tsx` + wrap in `layout.tsx` like others |

---

## 1. Designer Accounts

**Fit:** Extend `DesignerHouse` + new auth identity; do not create a separate “Brand” model.

| Layer | Approach |
|-------|----------|
| Types | Add optional `ownerUserId` / `accountStatus` on `DesignerHouse` in `types.ts` |
| Auth | `AuthContext` with roles: `buyer` \| `designer` \| `admin` |
| Profile | `/profile` shows designer CTA when role is designer; keep Guest UI for buyers |
| Routes | Prefer `/profile` + `/designer/[handle]` public; avoid a totally new public IA |
| Data | Designer registration creates/links a `DesignerHouse` row (today: `addDesigner`) |

**Do not:** Build a second designer profile UI unrelated to `/designer/[handle]`.

---

## 2. Designer Dashboard

**Fit:** Evolve **`/admin`** into role-scoped tooling, or add **`/admin` tabs gated by designer** / sibling route **`/dashboard`** that **reuses admin section UI and `useData` mutations**.

| Layer | Approach |
|-------|----------|
| UI | Split `admin/page.tsx` into `components/admin/*` (overview, designers, products, curation) — same styles (`curvy-input`, charcoal buttons) |
| Scope | Designer role: only `designerId === me` products/posts |
| Nav | Link from Profile; do not add a sixth BottomNav item unless product requires it |
| Chrome | Dashboard may omit shop BottomNav (like current admin) |

**Do not:** Introduce a new admin template (e.g. generic shadcn dashboard) that fights neumorphic off-white language.

---

## 3. Image Uploads

**Fit:** Replace URL text fields with upload → **still store HTTPS URL strings** on `logo`, `banner`, `Product.images[]`, feed/story image fields.

| Layer | Approach |
|-------|----------|
| UI | Small uploader inside admin/dashboard forms (next to existing `placeholder="https://..."`) |
| API | `POST` upload route or external signer; response URL written into form state |
| Config | Keep/extend `next.config.ts` `images.remotePatterns` (Cloudinary already allowed) |
| Types | No change to `images: string[]` |

**Do not:** Store File blobs in Context or change Product media to a parallel `MediaObject`-only model without migrating call sites.

---

## 4. Video Uploads

**Fit:** Extend media fields; reuse upload pipeline from images.

| Layer | Approach |
|-------|----------|
| Types | `StorySlide.videoUrl?`, `FeedPostData.videoUrl?` / `mediaType?: "image" \| "video"` |
| Dashboard | Same uploader component with `accept="video/*"` |
| Playback | New viewers (below) consume URLs — FeedPost/StoryViewer gain branches |

**Do not:** A separate “Video Studio” app outside feed/stories/admin.

---

## 5. Instagram-Style Feed (enrichment)

**Fit:** **`/feed` already is this.** Deepen it; don’t fork a new social product.

| Layer | Approach |
|-------|----------|
| Data | Move `FEED_POSTS` behind `FeedContext` or `useData` extension with CRUD for designer posts |
| UI | Keep `FeedPost` + `StoriesStrip`; add carousel, multi-image, video poster |
| Engagement | Persist likes/follows via API later; today local state in `FeedPost` |
| Creation | Designer dashboard “New post” → same `FeedPostData` shape |

**Do not:** New `/social` route that duplicates `/feed`.

---

## 6. Facebook-Style Image Viewer

> **Superseded by Phase 5 — [Universal Media Experience](./phase-5.md).**  
> Do not ship a Feed-only or PDP-only image overlay. Use one `MediaViewer` (image + video primitives, `media[]` + index, URL sync, a11y, virtualized thumbs, progressive loading).

**Historical note:** Original fit was an overlay modeled on `StoryViewer`. That intent remains, but scope is now the app-wide media system.

---

## 7. Fullscreen Vertical Video Viewer

> **Superseded by Phase 5 — [Universal Media Experience](./phase-5.md).**  
> Vertical / Reels-like playback belongs in `VideoViewer` inside the same `MediaViewer` shell (separate controls/gestures from images). Do not create a second standalone video app.

**Historical note:** Sibling of StoryViewer for feed video posts — now a mode/primitive of the universal viewer, not a duplicate stack.

---

## 8. Product Customization

**Fit:** Already wired: `Product.customizable` → link to **`/bespoke`**. Strengthen that path.

| Layer | Approach |
|-------|----------|
| Routing | `/bespoke?productId=` (or `/product/[id]/customize` that renders bespoke steps) |
| Types | Use existing `BespokeConfig`; persist with cart line optional fields later |
| UI | Keep step wizard on bespoke page; prefill from product (fabric/category) |
| Cart | Extend `CartItem` with optional `customization?: BespokeConfig` when approved |

**Do not:** A second customization wizard on the PDP with different steps/visuals.

---

## 9. Backend Integration

**Fit:** Façade under `src/lib` + context adapters; pages keep calling `useData` / `useCart` / feed hooks.

| Layer | Approach |
|-------|----------|
| `src/lib/api/products.ts` etc. | Functions returning `Product[]`, `DesignerHouse`, … |
| Env | `NEXT_PUBLIC_API_BASE_URL` when needed (document in `docs/environment.md`) |
| Admin/dashboard mutations | `addProduct` becomes optimistic UI + API write |
| Cart/Wishlist | Eventually sync to user-scoped endpoints; keep same hooks |

**Do not:** Call `fetch` ad hoc from every page; don’t adopt a second state library solely for server cache unless approved (if needed, one data library — not parallel to Context for the same entities).

---

## 10. Authentication

**Fit:** New context + profile/admin gates; Guest UI on `/profile` becomes signed-in states.

| Layer | Approach |
|-------|----------|
| `AuthContext` | `user`, `role`, `signIn`, `signOut`, `isDesigner` |
| Routes | Protect `/admin` / dashboard; optional middleware later |
| Profile | Replace Guest card with account info; keep section list pattern |
| Designer accounts | Auth user linked to `DesignerHouse.id` |

**Do not:** A separate auth micro-frontend or unrelated profile design.

---

## 11. Database

**Fit:** Server-side mirror of **`types.ts`** entities — not a new domain language.

| Suggested tables/collections | Maps to |
|------------------------------|---------|
| `designer_houses` | `DesignerHouse` |
| `products` | `Product` (`images` as JSON/array of URLs) |
| `categories` | `Category` tree |
| `feed_posts` / `stories` | `FeedPostData` / `StoryItem` |
| `users` / `sessions` | Auth |
| `carts` / `wishlists` | Optional server sync of existing contexts |
| `bespoke_requests` | `BespokeConfig` + user/product refs |
| `media_assets` | Optional; UI still consumes URLs on parent entities |

ORM choice is open (Prisma/Drizzle/etc.) but **schema must follow existing TypeScript models**. Seed from `mock-data.ts`.

---

## Suggested Delivery Order

```
0. Unify data reads + api façade stubs
1. AuthContext + profile enrichment
2. Designer accounts ↔ DesignerHouse link
3. Designer dashboard (scoped admin)
4. Image upload → URL fields
5. Feed CRUD behind real/mock API (Instagram feed depth)
6. ImageViewer overlay
7. Video upload + VerticalVideoViewer
8. Bespoke query-param + CartItem customization
9. Hard backend + database cutover
10. Cart/wishlist server sync + checkout (future)
```

---

## Consistency Checklist (every future PR)

- [ ] Reuses `ProductCard` / `Button` / TopBar / BottomNav / FeedPost / StoryViewer where applicable  
- [ ] Extends `types.ts` rather than inventing duplicate models  
- [ ] Uses Context hooks as the UI data API  
- [ ] Media remains URL- consumable by `next/image` or `<video>`  
- [ ] Matches off-white neumorphic tokens in `globals.css`  
- [ ] Mobile-first; overlays follow StoryViewer patterns  
- [ ] Feature branch only — never push `main`/`master`  

---

## Stop

Architecture audit and roadmap documented in this file. **No implementation started.**

Awaiting your approval before any feature work.
