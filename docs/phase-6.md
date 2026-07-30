# Phase 6 — Production Foundation

Status: **Complete (post-audit)** — see [phase-6-audit.md](./phase-6-audit.md)

Mock mode remains available via flags. Production path requires `USE_DATABASE=true` and `NEXT_PUBLIC_USE_API=true`.

## Features completed

### 1. Mock → production data path
- Storefront pages continue to use `NEXT_PUBLIC_USE_API` + existing catalog hooks.
- Designer public profile now loads via `/api/designers/handle/...` when API mode is on (`useStorefrontDesigner`).
- Feed prefers `Post` rows when present; falls back to product-backed feed.
- Defaults remain mock-compatible: `USE_DATABASE=false`, `NEXT_PUBLIC_USE_API=false`.

### 2. Public storefront
Verified production path (with flags on): Home, Feed, Store, Category, PDP, Designer Profile.

### 3. Buyer authentication (Supabase reuse)
| Route | Purpose |
|-------|---------|
| `/account/signup` | Buyer signup + `intent: "buyer"` bootstrap |
| `/account/login` | Buyer login + guest cart/wishlist merge |
| `/account/forgot-password` | Supabase reset email |
| `/account/reset-password` | Set new password |
| Profile logout | `supabase.auth.signOut()` |

Designer `/login` + `/signup` unchanged. Bootstrap accepts `intent: "buyer" | "designer"`.

### 4. Buyer profile
- `/profile` — session-aware account hub + order notifications snippet
- `/account/settings` — edit display name
- `/account/addresses` — address book CRUD

### 5. Wishlist
- Logged-in + `USE_DATABASE`: `/api/wishlist` persistence
- Guest: `localStorage` (`ds-wishlist`)
- Merge on login/signup via `/api/wishlist/merge`

### 6. Cart
- Server cart: user or guest (`ds_guest_token` cookie)
- APIs: GET/POST/PATCH/DELETE `/api/cart`, POST `/api/cart/merge`
- Inventory checks: published product, valid size, `piecesRemaining`
- UI `CartContext` syncs when `NEXT_PUBLIC_USE_API=true`

### 7. Checkout
- `/checkout` — shipping address → review → place order
- Payment **placeholder** only (`paymentStatus: pending`) — no fake paid success
- Success = real order detail at `/orders/[id]?placed=1`

### 8. Orders
- Create via POST `/api/orders`
- History `/orders`, detail `/orders/[id]` with timeline (`OrderEvent`)

### 9. Notifications (basic in-app)
Types: `order_created`, `order_updated`, `order_delivered`  
Listed on profile; APIs `/api/notifications`

### 10. Security
- Auth required for checkout/orders/addresses/settings (middleware)
- Buyer APIs use `requireBuyerContext` (no designer promotion)
- Input validation via shared helpers + service checks
- Rate limits on commerce routes (existing public limiter)
- Errors via `ok`/`fail` without leaking internals in production

## APIs added/updated

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/bootstrap` | `intent` buyer \| designer |
| GET/PATCH | `/api/account/me` | Buyer profile |
| GET/POST/PATCH/DELETE | `/api/cart` | Guest or user |
| POST | `/api/cart/merge` | Guest → user |
| GET/POST | `/api/wishlist` | Auth |
| POST | `/api/wishlist/merge` | Auth |
| GET/POST | `/api/orders` | Auth checkout + list |
| GET | `/api/orders/[id]` | Auth |
| GET/POST | `/api/addresses` | Auth |
| PATCH/DELETE | `/api/addresses/[id]` | Auth |
| GET | `/api/notifications` | Auth |
| PATCH | `/api/notifications/[id]` | Mark read |

## Database changes

Migration: `prisma/migrations/20260730180000_phase6_commerce`

New / updated:
- `addresses`
- `carts`, `cart_items`
- `order_events`
- `notifications`
- `orders.payment_status`
- `wishlist_items` → User FK

## Components reused
- `TopBar`, `BottomNav`, cart/wishlist contexts, catalog hooks, Supabase clients, `ok`/`fail`, rate limiter, designer auth pages pattern

## New UI surfaces
- `/account/*` auth + settings + addresses
- `/checkout`, `/orders`, `/orders/[id]`
- Profile upgraded (not redesigned)

## Architecture decisions
1. Dual-mode flags preserved — no breaking mock UI.
2. Buyer bootstrap never creates DesignerHouse.
3. Guest cart cookie httpOnly; guest wishlist local until merge.
4. Payment intentionally pending — architecture ready for Stripe later.
5. Prefer extending existing repos/services/routes over parallel systems.

## Testing checklist
- [ ] `USE_DATABASE=true` + `NEXT_PUBLIC_USE_API=true` + migrate
- [ ] Buyer signup / email verify (if enabled) / login / logout
- [ ] Forgot + reset password
- [ ] Guest wishlist → login merge
- [ ] Guest cart → login merge; qty + stock validation
- [ ] Checkout creates order + notification; cart clears
- [ ] Order history + detail timeline
- [ ] Profile / settings / addresses
- [ ] Storefront pages load from APIs
- [ ] Designer login/dashboard still works
- [ ] Mock flags off still run local demo

## Known limitations
- No real payment capture (placeholder only)
- No admin order status UI/API yet (`OrderService.updateStatus` ready; `order_updated` / `order_delivered` notifications wait on ops)
- Notification mark-read API unused by profile UI
- In-memory rate limits (per process)
- Cart API requires DB when API flag on — enable both production flags together
- Follow on designer profile is local-only (social out of scope)

## Audit
Completion audit + fixes: [phase-6-audit.md](./phase-6-audit.md)
