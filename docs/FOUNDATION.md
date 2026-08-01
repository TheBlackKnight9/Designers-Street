# Designer's Street Foundation — v0.8.1

## Architecture

All persistent application behavior follows this direction:

`Prisma/PostgreSQL → Repository → Service → Route Handler → client API facade/hook → UI`

Route Handlers are transport boundaries. They authenticate, validate request input,
apply rate limits where appropriate, and translate domain errors using `ok` / `fail`.
They never call Prisma directly. Repositories are the only persistence layer; services
own business rules, authorization decisions, DTO composition, and transactions.

## Folder conventions

- `src/server/repositories`: Prisma queries only.
- `src/server/services`: domain workflows and policy.
- `src/server/auth`: session integration; persistence is delegated to repositories.
- `src/app/api`: Route Handlers only.
- `src/lib/api`: browser-safe API/mock facade.
- `src/hooks`: reusable client data orchestration.
- `src/context`: global interaction state only (cart, wishlist, media viewer).
- `src/components`: presentation and composable interaction components.
- `src/lib/media` and `src/server/media`: client media behavior and Cloudinary server work.

## State management

Public catalog pages obtain catalog data through `useStorefront*` hooks and
`lib/api/catalog`. Their fallback is the same mock catalog facade, not mutable
application context. `DataContext` is isolated to `/admin` as the legacy local editor
and must not be imported by storefront UI.

Cart, wishlist, and media viewer contexts are global because their state spans routes.
Their server persistence remains behind their existing API endpoints and services.

## Authentication

Supabase provides the authenticated identity and session refresh middleware. Buyer and
designer contexts normalize that identity into application records through repositories.
Buyer-only and dashboard-only authorization remains in `src/server/auth` and services;
do not make authorization decisions in client components.

## Media and luxury components

Use the universal `MediaViewer` and its context for image/video/reel presentation.
Cloudinary signing, validation, registration, and ownership checks stay server-side.
For luxury UI, reuse `EditionBadge`, `ScarcityStrip`, `LuxuryBadges`, `TrustSignals`,
and `LookbookCard`; shared rules live in `src/lib/luxury.ts`.

## Deferred workflows

Appointment and bespoke persistence APIs are retained as deferred post-v0.8.1 work.
`AppointmentRequestForm` is intentionally unmounted and no appointment navigation is
present. The pre-existing `/bespoke` page remains a non-submitting legacy presentation
surface; do not connect it to `BespokeService` or expose the deferred APIs until a
separately approved product phase defines the workflow, authorization, operations, and
notifications.

## Rules for new work

1. Extend an existing repository/service/hook/component before creating a parallel one.
2. Add a repository method before a service needs new persistence behavior.
3. Keep Route Handlers thin and free of Prisma imports.
4. Keep UI components free of Prisma and server imports.
5. Preserve API/mock parity through `lib/api` when a feature supports local demo mode.
6. Prefer focused client components; do not add global context for page-local state.
7. Preserve mobile-first, keyboard-accessible, zoom-friendly luxury UI.
