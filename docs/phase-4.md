# Phase 4 — Public Marketplace Integration

## Goal

Wire the public shop (Home, Feed, Store, Categories, PDP) to Supabase through a **Public Service + DTO** layer with cursor pagination and centralized visibility rules. Dashboard APIs stay separate. Mock mode remains the default when flags are off.

## Architecture

```
UI (Home / Feed / Store / Category / PDP)
  → src/lib/api/catalog  (façade)
       ├── mock-data          when NEXT_PUBLIC_USE_API=false
       └── /api/products|feed|categories
              → PublicCatalogService
                   → public-visibility (published + active designer)
                   → ProductRepository / FeedRepository
                   → DTO mappers (cover / gallery / feed cards)
```

**Separate from dashboard:** `/api/dashboard/*` is unchanged. Public routes never share handlers with dashboard ownership APIs.

### Layers

| Layer | Role |
|-------|------|
| Repository | Cursor + filter queries (`findPublicPage`, `findPublicById`) |
| PublicCatalogService | List/detail/feed/categories → DTOs only |
| Route handlers | Thin: parse query → service → `{ ok, data }` |
| Façade (`catalog.ts`) | Client entry; mock fallback |
| UI hooks | `useStorefrontCatalog` — page-level fetch when API on |

### Visibility (single helper)

`src/server/services/public-visibility.ts`:

```ts
{ status: "published", designer: { accountStatus: "active" } }
```

`GET /api/products/[id]` returns **404** when not visible.

### DTOs

`src/server/dto/public.ts`:

- `ProductCardDTO` — store / home / category cards  
- `ProductDetailDTO` — PDP (+ designer preview)  
- `FeedPostDTO` — mirrors `FeedPostData` for existing `FeedPost`  
- `CategoryDTO` — category tree  

Media always includes `coverImage`, `gallery[]`, `videoPreview` (from `MediaAsset` by `displayOrder`; fallback `Product.images`).

### Feed mapping

Published products → feed cards:

| Field | Source |
|-------|--------|
| `id` | product id |
| `image` | coverImage |
| `caption` | name / short description |
| `link` | `/product/{id}` |
| `productTag` | `{ productId, name, price }` |
| `type` | `"designer-spotlight"` |

### Filters & pagination

Query params on `GET /api/products`: `category`, `designer`, `tag`, `color`, `size`, `customizable`, `minPrice`, `maxPrice`, `sort=newest|featured|trending` (`featured`/`trending` currently alias `newest`).

List responses: `{ ok, data: { items, nextCursor } }`.

Composite cursor: `createdAt` + `id`.

### Flags

| Mode | `USE_DATABASE` | `NEXT_PUBLIC_USE_API` |
|------|----------------|------------------------|
| Mock shop (default) | false | false |
| Real marketplace | true | true |

When API is off, storefront keeps using `DataContext` / mock so `/admin` CRUD still works locally.

Analytics stubs: `trackPublicEvent(...)` — noop for now.

## API versioning (documented, not migrated)

Unversioned paths (`/api/products`, …) remain the live surface. Document them as **v1-equivalent**; introduce `/api/v1/products` (etc.) only when a breaking change needs a parallel major. See [system-architecture.md](./system-architecture.md) §6.

## Rate limiting

Public `GET` handlers for products, product detail, feed, and categories call `enforcePublicRateLimit` (per-IP fixed window). Configure via `PUBLIC_API_RATE_LIMIT_MAX` / `PUBLIC_API_RATE_LIMIT_WINDOW_SEC`. Returns `429 RATE_LIMITED` + `Retry-After`.

## Frontend wiring

| Page | Behavior |
|------|----------|
| Home | Products / categories / designers via façade when API on |
| Feed | `listFeed` + infinite scroll on `nextCursor`; keep `FeedPost` |
| Store | Fetch products; client quick-filters/sort unchanged |
| Category index | Categories from API when enabled |
| Category slug | Filter by category via API |
| PDP | Detail DTO; gallery/cover map into existing UI |

Loading / empty / error via `CatalogStatus` (minimal, existing tokens).

## Out of scope

No Meilisearch, Redis, likes/comments, cart/checkout/orders, recommendations, or UI redesign.

## Related

- [system-architecture.md](./system-architecture.md)
- [product-lifecycle.md](./product-lifecycle.md)
- [phase-4-report.md](./phase-4-report.md)
