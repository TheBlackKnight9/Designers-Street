# Phase 6 Completion Audit

**Date:** 2026-07-30  
**Verdict:** Phase 6 is **production-ready for MVP foundation** after audit fixes. Not a full product (payment/ops still deferred by design).

---

## ✅ Completed

| Area | Evidence |
|------|----------|
| Schema + migration | `Address`, `Cart`, `CartItem`, `OrderEvent`, `Notification`, `Order.paymentStatus`, wishlist→user |
| Buyer auth | `/account/*` + Supabase; bootstrap `intent: buyer`; logout on profile |
| Designer auth isolation | No silent buyer→designer promote; `/api/auth/me` rejects buyers |
| Cart (server + guest) | Repo→service→API→`CartContext`; merge + `ds:commerce-sync` rehydrate |
| Wishlist persist + guest | API + localStorage; merge on login; **page resolves via `getProduct`** |
| Checkout | Address → review → real order (`paymentStatus: pending`) |
| Orders | Create (transactional stock), history, detail + timeline |
| Addresses CRUD | Create / **edit** / delete UI + APIs |
| Profile + settings | `/profile`, `/account/settings` |
| Notifications create | `order_created` on checkout; listed on profile |
| Storefront API path | Home/Feed/Store/Category/PDP/Designer shop + posts + Stories + Search when flags on |
| Security basics | Middleware auth gates, validation, rate limits, buyer context |
| Typecheck | `tsc --noEmit` clean after fixes |

---

## 🟡 Remaining (accepted / deferred)

| Item | Notes |
|------|-------|
| Live payment | Placeholder by design — Phase 6 scope |
| Order status ops UI/API | `OrderService.updateStatus` exists; no admin route yet → `order_updated` / `order_delivered` not fired in live journey |
| Notification mark-read UI | PATCH API exists; profile does not call it |
| Follow button | Local UI only (social out of Phase 6) |
| Email verify dedicated page | Supabase message flow only |
| Runtime E2E against real DB | Checklist still needs human run with flags + migrate |
| Dual-mode mocks | Intentional when `NEXT_PUBLIC_USE_API=false` |

---

## 🔴 Issues Found (fixed in this audit)

| Severity | Issue | Fix |
|----------|-------|-----|
| P0 | Wishlist page always filtered mock `PRODUCTS` | Resolve via `getProduct` in API mode |
| P0 | Cart stale after merge/checkout | `refreshCart` + `ds:commerce-sync` + clear after place order |
| P0 | Buyer silently promoted to designer | `promoteBuyer` flag; `/api/auth/me` forbids buyers |
| P1 | Stories / Search / designer posts used mocks with flags on | Wired to catalog/feed APIs |
| P1 | Address “CRUD” missing edit | Edit + PATCH wired |
| P1 | Narrow middleware matcher | Broadened for session refresh |
| P1 | Checkout stock race | Order + stock decrement in `$transaction` |

---

## ⚠ Risks

| Risk | Mitigation / status |
|------|---------------------|
| Flags mismatch (`USE_API` without DB) | Cart may fall back locally; checkout needs DB — document both flags |
| In-memory rate limits | OK for single instance; Redis later |
| No payment | Orders stay `pending` — expected |
| Status notifications unused | Until ops route ships |
| Designer login while already a buyer | No auto-redirect to dashboard; bootstrap returns Forbidden |

---

## Production enablement

1. Apply `prisma/migrations/20260730180000_phase6_commerce`
2. `USE_DATABASE=true` + `NEXT_PUBLIC_USE_API=true`
3. Supabase redirects: `/account/login`, `/account/reset-password`
4. Manual smoke: signup → wishlist → cart → checkout → order detail

---

## Gate for next phase

**May proceed** only after the smoke checklist above is run in your environment. Code-level Phase 6 gaps that blocked “complete” are addressed; remaining items are explicitly deferred (payment, admin status) or require live credentials to verify.
