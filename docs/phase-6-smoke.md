# Phase 6 Smoke Test Report

**Date:** 2026-07-30  
**Project:** `desginer ef` (`jwqpqlifszfveuldpujn`)  
**Flags:** `USE_DATABASE=true`, `NEXT_PUBLIC_USE_API=true`  
**Prisma:** connected via pooler `:6543` (`pgbouncer=true`)

## Verdict

**PASS (28/28 functional).** One assertion was a false negative on stock math (see below).

**Production blocker fixed during smoke:** `src/middleware.ts` had lost its `middleware` export (matcher-only). Restored before re-run.

## Passed

| Area | Result |
|------|--------|
| Health + DB connected | ✅ |
| Products / Feed / Stories / Categories / Designers | ✅ |
| Designer handle + Product detail APIs | ✅ |
| Guest cart add/get | ✅ |
| Buyer signup + login + bootstrap (`buyer`) | ✅ |
| Cart merge after login | ✅ |
| Wishlist persist | ✅ |
| Address create + update | ✅ |
| Checkout → order create | ✅ |
| Stock decrement | ✅ `5 → 2` (cart qty was 3 after merge+add) |
| Order history + timeline | ✅ |
| `order_created` notification | ✅ |
| Account me | ✅ |
| UI: Home, Feed, Store, PDP, Designer, Account login | ✅ |

## Failed (none after review)

| Test | Raw | Resolution |
|------|-----|------------|
| `stock_decrement` expected `5→3` | observed `5→2` | Guest cart qty 1 + add qty 2 ⇒ **3** units; decrement correct |

## Blockers

None remaining for Phase 6 freeze.

## Notes

- Rotate the DB password shared in chat when convenient (credential exposure in conversation history).
- Keep `DATABASE_URL` gitignored; never commit `.env`.
