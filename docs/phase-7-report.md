# Phase 7 Report — Social Commerce

## Summary

Phase 7 extends the Phase 6 production foundation with persistent social commerce: likes, follows, comments/replies, share, social notifications, wishlist polish, and non-AI feed ranking. No redesign; existing repos/services/API patterns reused.

## Files changed (primary)

### Schema / migrations
- `prisma/schema.prisma` — likes product target, commentsCount, notification social refs
- `prisma/migrations/20260730190000_phase7_social/migration.sql`

### Repositories
- `src/server/repositories/like-repository.ts` (new)
- `src/server/repositories/follow-repository.ts` (new)
- `src/server/repositories/comment-repository.ts` (new)
- `src/server/repositories/feed-repository.ts` — sort modes + engagement scoring
- `src/server/repositories/notification-repository.ts` — social create fields

### Services
- `src/server/services/like-service.ts` (new)
- `src/server/services/follow-service.ts` (new)
- `src/server/services/comment-service.ts` (new)
- `src/server/services/notification-service.ts` — social event helpers
- `src/server/services/public-catalog-service.ts` — feed sort + engagement hydrate

### APIs
- `src/app/api/posts/[id]/like/route.ts`
- `src/app/api/products/[id]/like/route.ts`
- `src/app/api/designers/[id]/follow/route.ts`
- `src/app/api/posts/[id]/comments/route.ts`
- `src/app/api/comments/[id]/route.ts`
- `src/app/api/feed/route.ts` — `sort` + viewer hydrate
- `src/app/api/notifications/route.ts` — unread + mark all
- `src/app/api/account/me/route.ts` — `followingCount`

### Hooks / client
- `src/hooks/useSocial.ts` — `useLike`, `useFollow`
- `src/hooks/useShare.ts`
- `src/hooks/useStorefrontCatalog.ts` — feed `sort`
- `src/lib/api/catalog.ts` — `listFeed({ sort })`
- `src/lib/types.ts` — engagement fields on feed posts

### UI
- `src/components/home/FeedPost.tsx` — persistent like/follow/comments/share/save
- `src/components/comments/CommentPanel.tsx`
- `src/components/ShareButton.tsx`
- `src/components/designer/DesignerGridPost.tsx`
- `src/app/designer/[handle]/page.tsx` — follow + share + grid likes
- `src/app/product/[productId]/page.tsx` — product like + share
- `src/app/feed/page.tsx` — sort tabs
- `src/app/notifications/page.tsx`
- `src/app/profile/page.tsx` — link to notifications

### Docs
- `docs/phase-7.md`
- `docs/phase-7-report.md`
- `docs/phase-7-audit.md`

## Migrations

| Name | Applied |
|------|---------|
| `20260730190000_phase7_social` | Yes (Supabase `apply_migration`) |

If local Prisma history drifts, run:

```bash
npx prisma migrate resolve --applied 20260730190000_phase7_social
npx prisma generate
```

## New APIs

See [phase-7.md](./phase-7.md) API table.

## Components reused
- `TopBar`, `BottomNav`, `CatalogStatus`, `ProductCard`, `StoriesStrip`
- Wishlist / Cart contexts (Phase 6)
- Notification repository/service (Phase 6 order path)
- Rate limit + `ok`/`fail` + buyer session helpers

## Components added
- `ShareButton`
- `CommentPanel`
- `DesignerGridPost`
- Notifications page

## Technical decisions

1. **Single Like model** for posts and products (nullable FKs) — no parallel tables.
2. **Feed like target resolution** — try Post id, else Product id (product-backed feed).
3. **Weighted ranking in memory** on a capped window — YAGNI vs materialized scores.
4. **Optimistic UI** with server reconciliation; rollback on auth/error.
5. **Comments ownership** enforced server-side; UI hides edit/delete for non-owners.
6. **Share** prefers `navigator.share`, falls back to clipboard deep link.
7. **No redesign** — engagement controls added inside existing feed/PDP chrome.

## Risks / follow-ups
- Stop any running `next dev` before `prisma generate` on Windows (DLL file lock / EPERM).
- Confirm `_prisma_migrations` row exists after remote apply (resolve if needed).
- Popular/trending cursor pagination is window-based, not globally exact at huge scale.
