# Foundation Stabilization Audit — v0.8.1

## Files changed

- Repository/service boundary: user and designer repositories/services; buyer/designer
  auth adapters; account/auth API routes; dashboard layout.
- Catalog state boundary: root layout, admin layout, public catalog/product/designer/
  lookbook pages.
- Accessibility/versioning: root viewport and `package.json`.
- Documentation: `FOUNDATION.md`, this audit, and the v0.8.1 release note.

## Architecture improvements

- Removed direct Prisma access from Route Handlers and the dashboard layout.
- Auth integration now reaches persistence through repositories.
- Isolated mutable legacy `DataContext` to `/admin`; storefront pages use catalog hooks
  with the canonical mock/API facade fallback.
- Restored browser zoom by removing the global maximum-scale and user-scalable lock.

## Deferred code classification

Appointments and bespoke workflows are incomplete, not dead. Their repositories,
services, API routes, and client methods remain preserved for a future approved phase.
The appointment form remains unmounted and neither deferred workflow is newly exposed
in navigation. The existing `/bespoke` presentation page is deliberately not connected
to persistence.

## Technical debt removed

- Direct API/layout Prisma imports for account, designer-session inspection, and
  dashboard designer-name lookup.
- Storefront reliance on mutable `DataContext` catalog state.
- Global zoom restriction.
- v0.1.0 package metadata drift.

## Remaining debt and risks

- The legacy `/admin` local editor intentionally remains separate from production
  dashboard persistence and is not an operational admin system.
- In-memory rate limiting is not distributed.
- Payments remain placeholder-only.
- Cart writes are not serialized and may race under concurrent interaction.
- Deferred appointment/bespoke APIs must not be activated without product and operations
  requirements.

## Recommendations

Treat v0.8.1 as the release baseline. Before Phase 9, commit the existing Phase 8 work,
run production environment E2E smoke tests with both database/API flags enabled, and
decide the lifecycle of the legacy `/admin` editor in a dedicated operational phase.

## Verification

- `npm exec tsc -- --noEmit` — passed.
- `npm run build` — passed; all 45 routes generated successfully.
- The build emits the existing Next.js 16 deprecation warning for the `middleware`
  file convention. Migration to `proxy` is intentionally deferred because it changes a
  framework integration boundary outside this stabilization scope.
