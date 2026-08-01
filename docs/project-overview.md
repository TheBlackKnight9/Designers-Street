# Project Overview — Designer's Street

## Summary

**Designer's Street** is a mobile-first luxury fashion storefront (frontend-only) for discovering Indian designer houses, browsing limited-edition collections, managing cart/wishlist, and configuring bespoke consultations. It is a Next.js App Router SPA-style client app backed by **in-memory mock data** persisted to **browser `localStorage`**. There is **no separate backend, database, or authentication service** in this repository.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (localhost:3000)                               │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ App Router    │  │ React        │  │ localStorage │ │
│  │ pages         │◄─┤ Contexts     │◄─┤ cart,        │ │
│  │ (client)      │  │ Data/Cart/   │  │ wishlist,    │ │
│  │               │  │ Wishlist     │  │ catalog CRUD │ │
│  └───────┬───────┘  └──────▲───────┘  └──────────────┘ │
│          │                 │                             │
│          └────────┬────────┘                             │
│                   ▼                                      │
│          src/lib/mock-data.ts (seed catalog)             │
│          Remote images: Unsplash / Cloudinary            │
└─────────────────────────────────────────────────────────┘
         ▲
         │ next dev / next start
┌────────┴────────┐
│  Next.js 16     │
│  React 19       │
│  Tailwind CSS 4 │
└─────────────────┘
```

- **Single service:** Next.js serves UI and static assets.
- **Data layer:** `src/lib/mock-data.ts` + `DataContext` (admin CRUD) + cart/wishlist contexts.
- **No API routes** under `src/app/api`.
- **No server actions** for persistence.

---

## Folder Structure

| Path | Role |
|------|------|
| `src/app/` | Next.js App Router pages & layout |
| `src/app/page.tsx` | Home (hero, categories, product grid) |
| `src/app/feed/` | Instagram-style feed + stories |
| `src/app/store/` | Store / catalog browse |
| `src/app/category/` | Category index + `[slug]` PLP |
| `src/app/product/[productId]/` | PDP |
| `src/app/designer/[handle]/` | Designer house profile |
| `src/app/cart/`, `wishlist/`, `profile/` | Commerce / account shells |
| `src/app/bespoke/` | Made-to-measure flow UI |
| `src/app/admin/` | Local admin CRUD for designers/products/promo |
| `src/components/` | Shared UI (TopBar, BottomNav, ProductCard, etc.) |
| `src/components/home/` | Feed/stories components |
| `src/components/ui/` | Button, ProductCard |
| `src/context/` | Data, Cart, Wishlist providers |
| `src/lib/types.ts` | Domain TypeScript types |
| `src/lib/mock-data.ts` | Seed designers, products, categories, feed, stories |
| `src/app/globals.css` | Design tokens + Tailwind theme |
| `public/` | Default Next.js SVG assets |
| `docs/` | Local setup & audit documentation |

---

## Technologies

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| Runtime | Node.js (20.9+ recommended for Next 16; local verified on 24.15) |
| Framework | Next.js **16.2.10** (App Router, Turbopack in `next dev`) |
| UI | React **19.2.4** |
| Styling | Tailwind CSS **v4** via `@tailwindcss/postcss` |
| Package manager | **npm** (`package-lock.json`) |
| Lint | ESLint 9 + `eslint-config-next` |
| Images | `next/image` with remote patterns for Unsplash & Cloudinary |
| State | React Context (`DataContext`, `CartContext`, `WishlistContext`) |
| Persistence | `localStorage` only |
| Backend | None in-repo |
| Database | None |
| Auth | None (profile is a Guest placeholder) |
| Tests | None configured |
| Deploy target | Vercel-friendly Next.js app (no `vercel.json` present) |

---

## How Frontend Talks to Backend

**It does not.** There is no HTTP API client, no `fetch` to a product API, and no env-based API base URL.

| Concern | Mechanism |
|---------|-----------|
| Catalog | Imported from `mock-data.ts`; admin edits live in `DataContext` → keys `ds_designers`, `ds_products`, `ds_promo` |
| Cart | `CartContext` → key `ds-cart` |
| Wishlist | `WishlistContext` → key `ds-wishlist` |
| Search | Client filter over mock `PRODUCTS` / `DESIGNERS` in `SearchOverlay` |
| Media | Absolute HTTPS URLs to Unsplash (and allowed Cloudinary host) |

When a real backend is added later, contexts and pages that still import static `PRODUCTS` from mock-data (e.g. wishlist, search) will need aligning with `useData()`.

---

## Important Configs

| File | Notes |
|------|-------|
| `package.json` | Scripts: `dev`, `build`, `start`, `lint` |
| `next.config.ts` | Allows `images.unsplash.com` and `res.cloudinary.com` |
| `tsconfig.json` | Path alias `@/*` → `./src/*`, `strict: true` |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `eslint.config.mjs` | Next core-web-vitals + TypeScript rules |
| `AGENTS.md` / `CLAUDE.md` | Reminder that Next 16 docs live under `node_modules/next/dist/docs/` |

---

## Existing Scripts

```bash
npm run dev      # Next.js dev server (Turbopack) — default port 3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

There are no format, typecheck, test, seed, or migrate scripts.

---

## Development Workflow

1. Install: `npm install`
2. Start: `npm run dev`
3. Open: [http://localhost:3000](http://localhost:3000)
4. Edit pages under `src/app/` or components under `src/components/`
5. Optional: manage catalog via `/admin` (persists in browser storage)
6. Reset admin data: use **Reset to defaults** in admin (clears `ds_*` keys)

---

## Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static | Home |
| `/feed` | Static | Social feed |
| `/store` | Static | Store browse |
| `/category` | Static | Category list |
| `/category/[slug]` | Dynamic | Category PLP |
| `/product/[productId]` | Dynamic | Product detail |
| `/designer/[handle]` | Dynamic | Designer profile |
| `/cart` | Static | Cart |
| `/wishlist` | Static | Wishlist |
| `/profile` | Static | Account shell (Guest) |
| `/bespoke` | Static | Bespoke configurator UI |
| `/admin` | Static | Local catalog admin |
