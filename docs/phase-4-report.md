# Phase 4 Report — Public Marketplace Integration

**Date:** 2026-07-30  
**Branch:** `feature/backend-foundation`  
**Status:** Complete (stop before social/commerce/search)

## Summary

Public shop pages now read through `PublicCatalogService` → DTOs when `USE_DATABASE=true` and `NEXT_PUBLIC_USE_API=true`. Visibility is centralized (`published` + active designer). Dashboard APIs remain separate. Mock mode is unchanged when flags are off.

## Delivered

### Backend

- `src/server/dto/public.ts` + `src/server/dto/mappers.ts`
- `src/server/services/public-visibility.ts`
- `src/server/services/public-catalog-service.ts`
- `src/server/utils/public-analytics.ts` (noop stubs)
- `ProductRepository.findPublicPage` / `findPublicById` (cursor + filters)
- Enhanced routes:
  - `GET /api/products` — cursor page + filters
  - `GET /api/products/[id]` — detail DTO or 404
  - `GET /api/feed` — product-backed feed DTOs + cursor
  - `GET /api/categories` — CategoryDTO tree

### Frontend

- Extended `src/lib/api/catalog.ts` (cursor/filters, card/detail helpers)
- `src/lib/api/product-mappers.ts` (client-safe UI mapping)
- `src/hooks/useStorefrontCatalog.ts`
- `src/components/ui/CatalogStatus.tsx`
- Wired: Home, Feed (infinite scroll), Store, Category index/slug, PDP
- Public rate limiting on products / feed / categories (`RATE_LIMITED` + `Retry-After`)
- Documented `/api/v1/*` versioning strategy (no path migration yet)

### Docs

- `docs/phase-4.md`, this report
- Updates to `docs/system-architecture.md`, `docs/product-lifecycle.md`

## Verification checklist

- [x] `npm run build` succeeds
- [ ] Mock mode (`USE_API=false`): Home/Feed/Store/Category/PDP still work from mock/context
- [ ] API mode: published products from active designers appear; drafts/archived do not
- [ ] PDP 404 for non-visible products
- [ ] Feed infinite scroll loads `nextCursor`
- [ ] Dashboard login/upload still works
- [ ] `/admin` mock CRUD still works when API off

## Explicitly not done

Likes, comments, search engine, cart, checkout, orders, recommendations, Redis cache.
