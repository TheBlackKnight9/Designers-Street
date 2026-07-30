# Project Analysis — Designer's Street

**Status:** Analysis only. No features implemented. Awaiting approval before any build work.  
**Branch at analysis:** `docs/local-development-setup`  
**Date:** 2026-07-30

---

## 1. Project Architecture

Designer's Street is a **single-service, frontend-only** mobile-first luxury fashion commerce UI.

```
Browser
  └── Next.js App Router (React 19 client pages)
        ├── Providers (Data / Cart / Wishlist)  → localStorage
        ├── Pages compose TopBar + content + BottomNav
        ├── Domain types + mock seed data (src/lib)
        └── next/image → remote HTTPS URLs (Unsplash; Cloudinary host allowed)
```

| Layer | Reality in this repo |
|-------|----------------------|
| Frontend | Next.js 16 App Router + React 19 + Tailwind CSS 4 |
| Backend | **None** — no `src/app/api`, no server actions for persistence, no BFF |
| Database / ORM | **None** |
| Auth | **None** — profile is Guest placeholder |
| APIs | **None** — no fetch clients, no API base URL |
| Persistence | Browser `localStorage` only |
| Media CDN | External URLs (Unsplash in seed; Cloudinary hostname pre-allowed) |

**Do not introduce** a new state library, UI kit, or folder layout unless approved — the existing Context + App Router + `src/{app,components,context,lib}` pattern is the architecture.

---

## 2. Folder Structure

```
designer fe/
├── .cursor/rules/          # Agent rules (e.g. git-safety)
├── docs/                   # Setup & analysis docs
├── public/                 # Stock create-next-app SVGs (mostly unused by UI)
├── src/
│   ├── app/                # Routes (file-based App Router)
│   │   ├── layout.tsx      # Root shell + providers + metadata
│   │   ├── globals.css     # Design system tokens & utilities
│   │   ├── page.tsx        # Home
│   │   ├── admin/          # Local catalog admin (monolithic page)
│   │   ├── bespoke/
│   │   ├── cart/
│   │   ├── category/ + [slug]/
│   │   ├── designer/[handle]/
│   │   ├── feed/
│   │   ├── product/[productId]/
│   │   ├── profile/
│   │   ├── store/
│   │   └── wishlist/
│   ├── components/         # Shared UI
│   │   ├── home/           # FeedPost, StoriesStrip, StoryViewer
│   │   ├── ui/             # Button, ProductCard
│   │   ├── TopBar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Footer.tsx
│   │   └── SearchOverlay.tsx
│   ├── context/            # React Context providers + hooks
│   └── lib/                # types.ts, mock-data.ts (+ helpers)
├── next.config.ts
├── package.json            # npm scripts: dev, build, start, lint
└── tsconfig.json           # @/* → ./src/*
```

There is **no** `services/`, `hooks/` (beyond context hooks), `api/`, `prisma/`, or `store/` (Redux/Zustand) directory.

---

## 3. Existing Tech Stack

| Concern | Choice |
|---------|--------|
| Language | TypeScript (strict) |
| Framework | Next.js **16.2.10** (Turbopack in `next dev`) |
| UI library | React **19.2.4** |
| Styling | Tailwind CSS **v4** (`@import "tailwindcss"` + `@theme inline`) |
| Package manager | **npm** (`package-lock.json`) |
| Images | `next/image` |
| Lint | ESLint 9 + `eslint-config-next` |
| Deploy hint | Standard Next.js / Vercel-compatible; no `vercel.json` / Docker |

---

## 4. Frontend Architecture

### Pattern

- Almost every page is a **`"use client"`** page component.
- Root `layout.tsx` is a Server Component that wraps children in:
  1. `DataProvider`
  2. `CartProvider`
  3. `WishlistProvider`
- Pages **manually compose** chrome: `TopBar` → `<main>` → `BottomNav` (and sometimes `Footer` on home). There is no shared `(shop)/layout.tsx` shell yet.
- Path alias: `@/` → `src/`.

### Routing (App Router)

| Route | Page role |
|-------|-----------|
| `/` | Home: hero carousel, featured grids, product shelves |
| `/feed` | Stories strip + feed posts |
| `/category` | Category tree / posters |
| `/category/[slug]` | PLP with sort/filters |
| `/store` | Store / catalog browse |
| `/product/[productId]` | PDP |
| `/designer/[handle]` | Designer house profile |
| `/cart` | Bag |
| `/wishlist` | Saved products |
| `/profile` | Account shell (Guest) |
| `/bespoke` | Made-to-measure configurator UI |
| `/admin` | Designer/product/promo CRUD (local) |

Dynamic routes use Next 15+/16 style **`params: Promise<…>`** with React `use(params)`.

Bottom nav highlights: Home, Feed, Category, Store, Profile (`usePathname`).

---

## 5. Backend Architecture

**Not present.**

No REST/GraphQL layer, no middleware auth, no workers. Any future backend must be added deliberately; until then, treat `DataContext` + `mock-data.ts` as the “API.”

---

## 6. State Management

| Store | Hook | Persistence | Responsibility |
|-------|------|-------------|----------------|
| Data | `useData()` | `ds_designers`, `ds_products`, `ds_promo` | Catalog CRUD + promo banner |
| Cart | `useCart()` | `ds-cart` | Line items, totals, drawer open flags |
| Wishlist | `useWishlist()` | `ds-wishlist` | Product ID list, toggle |

**Conventions already in use:**

- Provider + `createContext` + custom hook that throws if missing provider
- Hydrate from `localStorage` in `useEffect`, then sync on change
- Cart/Wishlist also use `useCallback` / `useMemo`

**Important inconsistency:** some surfaces still import static `PRODUCTS` / `DESIGNERS` / `FEED_POSTS` / `STORIES` from `mock-data` instead of `useData()` (notably search + wishlist + feed/stories). Prefer **`useData()` for editable catalog**; static imports remain appropriate for feed/stories/categories until those become editable.

Do **not** add Redux, Zustand, or React Query unless approved — Context is the established pattern.

---

## 7. APIs Organization

None. Helpers that act as a thin data access layer live in `src/lib/mock-data.ts`:

- `formatPrice` (INR via `en-IN`)
- `getDesignerById` / `getDesignerByHandle`
- `getProductsByDesigner` / `getProductsByCategory` / `getProductById`
- `findCategoryBySlug` (recursive category tree)

When adding a real API later, mirror this domain language (`DesignerHouse`, `Product`, etc. from `types.ts`) rather than inventing parallel models.

---

## 8. Authentication Flow

**None implemented.**

- `/profile` shows a Guest card and inert sections (Orders, Measurements, Addresses, Consultations, Help).
- `/admin` has **no login gate**.
- No cookies, JWT, NextAuth, Clerk, or session code.

---

## 9. Database Models & ORM

**None.** Domain models are TypeScript interfaces in `src/lib/types.ts`:

- `DesignerHouse`, `Product`, `Category`, `StoryItem` / `StorySlide`
- `FeedPostData`, `CartItem`, `BespokeConfig`, `FilterState`

IDs are string prefixes such as `dh-*`, `prod-*` (admin generates via `Date.now()`).

---

## 10. Images, Video & Upload Flow

### Media handling (current)

| Aspect | Behavior |
|--------|----------|
| Primary renderer | `next/image` (`fill` or fixed width/height) |
| Allowed remotes | `images.unsplash.com`, `res.cloudinary.com` in `next.config.ts` |
| Seed content | Absolute Unsplash HTTPS URLs with `?w=&q=` query params |
| Video | **Not used** — no `<video>`, no video types, stories are image slides |
| Local `/public` assets | Default Next SVGs; product UI does not depend on them |

### Upload flow (current)

**There is no file upload pipeline.**

Admin “media” is **paste URL** text fields:

- Designer: `logo`, `banner` placeholders `https://...`
- Product: comma-separated `images` URL string, split into `string[]`
- Defaults fall back to hardcoded Unsplash URLs if empty

No `input type="file"`, no FormData, no Cloudinary/S3 SDK, no signed upload, no server route.

Future upload work should extend this **URL-on-entity** model (or replace it deliberately) and reuse `next/image` + `remotePatterns`.

---

## 11. Reusable UI Components

| Component | Path | Role — reuse this first |
|-----------|------|-------------------------|
| `Button` | `components/ui/Button.tsx` | Primary / inverted neumorphic CTA; supports `href` or `onClick` |
| `ProductCard` | `components/ui/ProductCard.tsx` | Grid card: image, rating, quick-add, wishlist, price/MRP |
| `TopBar` | `components/TopBar.tsx` | Fixed header + search + wishlist/cart badges |
| `BottomNav` | `components/BottomNav.tsx` | Fixed 5-tab nav |
| `SearchOverlay` | `components/SearchOverlay.tsx` | Full-screen search (opened from TopBar) |
| `Footer` | `components/Footer.tsx` | Dark footer (used on home) |
| `StoriesStrip` | `components/home/StoriesStrip.tsx` | Horizontal story avatars |
| `StoryViewer` | `components/home/StoryViewer.tsx` | Full-screen story slides |
| `FeedPost` | `components/home/FeedPost.tsx` | Editorial feed card |

Page-local UI (hero slides, admin forms, bespoke steps) lives **inside page files**, not as shared components — extract only when a second consumer appears.

---

## 12. Design System

Defined primarily in `src/app/globals.css`.

### Colors (CSS variables → Tailwind via `@theme`)

| Token | Value | Use |
|-------|-------|-----|
| `--paper` / `paper` | `#FDFCF8` | Canvas |
| `--mist` / `mist` | `#F3F0E9` | Surfaces |
| `--cloud` / `cloud` | `#E3DBCC` | Soft accent / borders |
| `--charcoal` / `charcoal` | `#101010` | High-contrast text/UI |
| `--graphite` / `graphite` | `#2E2B27` | Secondary text |
| `--stone` / `stone` | `#787268` | Muted |
| `--silver` / `silver` | `#A8A196` | Ghost text |
| `--gold-zari` / `gold` | `#C5A059` | Accent (story ring) |

Inline hex still appears widely in JSX (`#2B2B2B`, `#FAFAFA`, `#A0A0A0`, etc.) — match nearby page style when editing.

### Typography

- `font-sans` — SF Pro / Helvetica system stack  
- `font-display` — UI serif / Georgia for wordmarks & display titles  
- Labels often `uppercase` + wide tracking (`tracking-nav`, `tracking-label`, `tracking-widest`)

### Spacing & chrome

- `--top-bar-height: 52px`, `--bottom-nav-height: 64px`
- Body padding-bottom accounts for bottom nav + safe area
- Common page padding: `px-4`

### Component / visual patterns

- **Neumorphism:** `.curvy-card`, `.curvy-btn`, `.curvy-btn-dark`, `.curvy-input`, `.neu-*`, `.product-card`
- **Glass nav:** `.bottom-nav-glass`
- **Stories:** `.story-ring` / `.story-ring--seen`
- **Motion:** `fade-up`, `heart-pop`, `story-progress`, stagger helpers; respects `prefers-reduced-motion`
- **Touch:** `.touch-target` (44px), `.btn-press`

---

## 13. Coding Conventions

| Area | Convention observed |
|------|---------------------|
| Components | Named exports for shared UI; **default export** for pages |
| Client boundary | `"use client"` at top of interactive modules |
| Naming | `PascalCase` files/components; `camelCase` functions/hooks; route folders kebab-case |
| Types | Centralized in `lib/types.ts`; props interfaces colocated in component files |
| Imports | Prefer `@/` alias |
| Styling | Tailwind utility classes + shared CSS utility classes from `globals.css` |
| Icons | Inline Heroicons-style SVG paths (no icon package) |
| IDs | Optional `id` props on some UI for testing/analytics |
| Currency | Always `formatPrice` for display |
| Comments | Section banners in types/mock-data/CSS (`──` / `────`) |

---

## 14. Existing “Services”

No service classes. Closest equivalents:

1. **`DataContext`** — catalog write/read API for the UI  
2. **`mock-data.ts` helpers** — read helpers over seed arrays  
3. **Cart / Wishlist contexts** — commerce session state  

Reuse these instead of creating `src/services/*` unless a real HTTP client is approved.

---

## 15. Current Deployment Setup

- Scripts: `npm run build` → `npm run start`
- No Dockerfile, CI config, or `vercel.json` in repo
- README still stock create-next-app / Vercel deploy wording
- Suitable for Vercel or any Node host that runs Next 16

---

## 16. Best Practices Already Followed

- Typed domain model separate from UI
- Path aliases and strict TypeScript
- Context hooks guard against missing providers
- `localStorage` hydrate/sync with try/catch
- Mobile-first layout, safe-area aware bottom nav
- Accessible touches: `aria-label`s, `:focus-visible`, reduced-motion media query
- Image optimization via `next/image` + explicit remote allowlist
- Dynamic params typed as Promises (current Next convention)
- Design tokens centralized in CSS variables
- Small shared UI surface (`Button`, `ProductCard`) for catalog grids

---

## 17. Gaps to Remember (not fixes — awareness)

- Catalog data source split (context vs static mock imports)
- No auth, uploads, video, payments, or real APIs
- Admin is a very large single file
- ESLint currently fails on existing `any` / setState-in-effect patterns
- Stock README / public SVGs not product-specific

---

## 18. Reuse Checklist for Future Tasks

Before writing new code:

1. Prefer extending **existing pages/components/contexts** over new packages.  
2. Use **`ProductCard`**, **`Button`**, **`TopBar`/`BottomNav`** for shop surfaces.  
3. Put shared domain types in **`lib/types.ts`**.  
4. Put seed/helpers in **`lib/mock-data.ts`** (or context if mutable).  
5. Follow **neumorphic / off-white** tokens in `globals.css`.  
6. Media = **URL strings + `next/image`** unless upload is explicitly approved.  
7. Do **not** invent backend/auth/ORM layers casually.  
8. Stay off **`main`/`master`** (see git safety rule).

---

## Stop

Analysis complete. **No feature implementation started.**

Awaiting your approval of this report before any build work.
