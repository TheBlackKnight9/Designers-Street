# Codebase Audit — Designer's Street

Audit date: 2026-07-30  
Scope: first-pass review of structure, quality, and risks. **Report only — no refactors applied.**

---

## Critical

| ID | Finding | Notes |
|----|---------|-------|
| C1 | **No real backend / auth / payments** | Expected for a mock FE prototype, but `/admin` is fully open (no gate). Anyone with the URL can mutate local catalog. Do not treat as production-ready. |
| C2 | **Admin + commerce are client-only** | Catalog mutations and cart never leave the browser. Data is lost across devices/browsers; not suitable for multi-user production. |

---

## High

| ID | Finding | Notes |
|----|---------|-------|
| H1 | **Split data sources** | `DataContext` owns editable designers/products, but `wishlist/page.tsx` and `SearchOverlay.tsx` still import static `PRODUCTS` / `DESIGNERS` from `mock-data`. Admin-added products may not appear in search/wishlist. |
| H2 | **`category/[slug]/page.tsx` imports unused static `PRODUCTS`** | Page mostly uses `useData()`, but dead import of `PRODUCTS` (and unused `Image` / `formatPrice`) signals incomplete migration to context. |
| H3 | **ESLint errors on clean install** | `npm run lint` fails with 6 errors (explicit `any`, `set-state-in-effect` in contexts). Blocks lint-gated CI if added later. Build still passes. |
| H4 | **`admin/page.tsx` ~1150+ lines** | Monolithic client page (forms, tabs, CRUD). High change risk and hard reviews. |
| H5 | **`mock-data.ts` ~1000 lines** | Large seed file; fine for prototype, painful for maintenance. |

---

## Medium

| ID | Finding | Notes |
|----|---------|-------|
| M1 | **Profile / orders / measurements are placeholders** | Guest-only UI; no sign-in, no order history. |
| M2 | **Bespoke flow is UI-only** | Config state is local component state; no submission API. |
| M3 | **Cart checkout not implemented** | Cart CRUD exists; no payment/order pipeline. |
| M4 | **Unused vars from lint** | `deleteDesigner` / `deleteProduct` destructured but unused in admin; unused hooks/imports in store & category pages. |
| M5 | **`store/page.tsx` exhaustive-deps warning** | `useMemo` missing `products` dependency — possible stale filters. |
| M6 | **Default system font stacks** | `globals.css` uses SF Pro / Helvetica / Georgia system stacks — fine for mobile OS, weak brand differentiation if design goals require custom type. |
| M7 | **No tests** | No unit/e2e coverage for cart math, filters, or admin CRUD. |
| M8 | **No format / typecheck scripts** | Only `lint` + `build`. |
| M9 | **`public/` still has create-next-app SVGs** | Unused default assets (`next.svg`, `vercel.svg`, etc.) likely dead. |
| M10 | **README is stock create-next-app** | Does not describe Designer's Street product or local docs under `/docs`. |

---

## Low

| ID | Finding | Notes |
|----|---------|-------|
| L1 | **No TODO/FIXME comments found** | Grep showed no `TODO`/`FIXME` markers. |
| L2 | **Duplicate pattern: TopBar + BottomNav on most pages** | Repeated composition; could be a shared shell layout later. |
| L3 | **localStorage hydrate via `useEffect` + setState** | Triggers React 19 ESLint `set-state-in-effect`; common pattern but flagged. Prefer lazy `useState(() => …)` with SSR-safe guards when refactoring. |
| L4 | **`as any` casts** | Home product filter tab and admin gender/tab handlers. |
| L5 | **Viewport `userScalable: false`** | May hurt accessibility (zoom). |
| L6 | **pnpm available but lockfile is npm** | Documented preference for npm. |
| L7 | **npm `devdir` warning** | Environment noise, unrelated to app code. |

---

## Security (summary)

| Topic | Status |
|-------|--------|
| Secrets in repo | None found |
| Auth | Absent |
| Admin protection | Absent (client-only) |
| XSS via admin image/URL fields | Untrusted URL strings rendered in `next/image` / img — low risk with Next image domains, still trust-browser-only |
| Dependency surface | Small: next, react, react-dom + Tailwind/ESLint toolchain |

---

## Unused packages

All declared dependencies appear used by the Next/Tailwind/TS toolchain. No obvious unused npm packages. Stock `public/*.svg` assets are likely unused by app UI.

---

## Circular dependencies

No evidence of circular imports among `context` ↔ `components` ↔ `lib` (contexts import types/mock; pages import contexts). Low risk today.

---

## Large components (by approx. lines)

| File | ~Lines | Rank |
|------|--------|------|
| `src/app/admin/page.tsx` | 1150 | High |
| `src/lib/mock-data.ts` | 994 | Medium (data) |
| `src/app/page.tsx` | 374 | Medium |
| Dynamic product/designer/category pages | ~300–320 each | Medium |
| `FeedPost.tsx` | 247 | Low–Medium |

---

## Recommended next steps (await approval)

1. Unify catalog reads on `useData()` (wishlist, search, helpers).
2. Add `.env.example` only when a real API exists.
3. Split `admin/page.tsx` into tab components.
4. Fix ESLint errors for CI readiness.
5. Add auth gate before any production deploy of `/admin`.
6. Introduce backend + DB when multi-device persistence is required.

**No architectural refactoring performed** pending your approval.
