# Phase 6 Report — Production Foundation

## Summary

Phase 6 connects buyer commerce to the existing DB → repository → service → API → hooks → UI stack without redesigning the storefront or replacing Supabase/designer auth.

## Files modified (high-signal)

### Schema / migrations
- `prisma/schema.prisma`
- `prisma/migrations/20260730180000_phase6_commerce/migration.sql`

### Server auth / utils
- `src/server/auth/buyer-session.ts` (new)
- `src/server/auth/index.ts`
- `src/server/utils/guest-token.ts` (new)
- `src/server/utils/cart-identity.ts` (new)
- `src/app/api/auth/bootstrap/route.ts`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`

### Repositories / services
- `src/server/repositories/cart-repository.ts`
- `src/server/repositories/wishlist-repository.ts`
- `src/server/repositories/address-repository.ts`
- `src/server/repositories/order-repository.ts`
- `src/server/repositories/notification-repository.ts`
- `src/server/repositories/index.ts`
- `src/server/services/cart-service.ts`
- `src/server/services/wishlist-service.ts`
- `src/server/services/address-service.ts`
- `src/server/services/order-service.ts`
- `src/server/services/notification-service.ts`
- `src/server/services/public-catalog-service.ts` (feed prefers posts)
- `src/server/services/index.ts`

### API routes (new)
- `src/app/api/cart/route.ts`
- `src/app/api/cart/merge/route.ts`
- `src/app/api/wishlist/route.ts`
- `src/app/api/wishlist/merge/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/addresses/route.ts`
- `src/app/api/addresses/[id]/route.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/route.ts`
- `src/app/api/account/me/route.ts`

### Client / UI
- `src/context/CartContext.tsx`
- `src/context/WishlistContext.tsx`
- `src/hooks/useStorefrontCatalog.ts` (`useStorefrontDesigner`)
- `src/app/designer/[handle]/page.tsx`
- `src/app/cart/page.tsx` (checkout link)
- `src/app/profile/page.tsx`
- `src/app/account/login/page.tsx`
- `src/app/account/signup/page.tsx`
- `src/app/account/forgot-password/page.tsx`
- `src/app/account/reset-password/page.tsx`
- `src/app/account/settings/page.tsx`
- `src/app/account/addresses/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/orders/page.tsx`
- `src/app/orders/[id]/page.tsx`
- `.env.example`
- `docs/phase-6.md`
- `docs/phase-6-report.md`

## New routes (App Router)

| Path | Auth |
|------|------|
| `/account/login` | Public |
| `/account/signup` | Public |
| `/account/forgot-password` | Public |
| `/account/reset-password` | Recovery session |
| `/account/settings` | Buyer |
| `/account/addresses` | Buyer |
| `/checkout` | Buyer |
| `/orders` | Buyer |
| `/orders/[id]` | Buyer |

## New database tables

| Table | Purpose |
|-------|---------|
| `addresses` | Buyer address book |
| `carts` | User or guest cart |
| `cart_items` | Line items (unique cart+product+size) |
| `order_events` | Order timeline |
| `notifications` | In-app order notifications |

Also: `orders.payment_status`, wishlist → user FK.

## Migration summary

1. Apply `20260730180000_phase6_commerce` (`npx prisma migrate deploy` or `migrate dev`).
2. Run `npx prisma generate`.
3. Set `USE_DATABASE=true` and `NEXT_PUBLIC_USE_API=true`.
4. Ensure Supabase Auth redirect URLs include `/account/login` and `/account/reset-password`.

## Performance considerations

- Cart/wishlist fetches are request-scoped; contexts hydrate once per mount.
- Commerce endpoints share the in-memory public rate limiter (not Redis).
- Order create validates each line + optional `piecesRemaining` decrement in sequence (acceptable for MVP volume).
- Catalog/designer hooks already use `cache: "no-store"` for freshness.

## Future compatibility

- Payment provider can attach to `paymentStatus` + order status transitions without schema rewrite.
- `OrderService.updateStatus` ready for admin/ops later.
- Notification types are stringly typed for easy extension (keep Phase 6 scope limited).
- Guest cookie cart merges cleanly into user carts for multi-device after login.
- No AI/CRM/marketing/collections/brand-story features added (explicitly out of scope).

## Out of scope (unchanged)

AI, CRM, Marketing, Reputation, Brand Story, Collections, Stripe live charges, advanced notification center, admin RBAC expansion.
