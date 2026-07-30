# Phase 7 — Social Commerce

Status: **Complete (post-audit)** — see [phase-7-audit.md](./phase-7-audit.md)

Builds on frozen Phase 6 (`v0.6.0` / `phase-6-complete`). Mock mode remains available via flags. Production path requires `USE_DATABASE=true` and `NEXT_PUBLIC_USE_API=true`.

## Features implemented

### 1. Persistent likes
- Like / unlike **posts** and **products**
- DB uniqueness per user+post and user+product
- Optimistic UI via `useLike`
- Counts stored on `Post.likesCount` / `Product.likesCount`
- Feed hydration sets `likedByMe` for signed-in viewers

### 2. Persistent follow
- Follow / unfollow designer houses
- Follower count synced to `DesignerHouse.followersCount` display
- Following count on `GET /api/account/me`
- Feed `sort=following` filters to followed houses
- Optimistic UI via `useFollow`

### 3. Comments
- Add, edit own, delete own
- Nested replies (`parentId`)
- `Post.commentsCount` maintained transactionally
- Pagination (cursor) + load replies on demand
- Sanitization (strip `<>`, length cap 1000)
- Optimistic-friendly reload after mutations

### 4. Feed engagement
- Like / comment / follow / save / share reflected in feed UI immediately
- Server returns engagement flags when authenticated

### 5. Save products (wishlist)
- Reuses Phase 6 `/api/wishlist` persistence
- Feed save uses product id only (not post id)
- PDP + designer grid saved indicators

### 6. Share
- `useShare` + `ShareButton`: native Web Share API with clipboard fallback
- Absolute deep links for product, designer, and feed posts

### 7. Social notifications
- Types: `social_follow`, `social_like`, `social_comment`, `social_reply`
- Reuses `Notification` model + Phase 6 order notification path
- Center at `/notifications` (mark one / mark all read)
- Profile links to notification center

### 8. Feed ranking (non-AI)
Sort modes on `/api/feed?sort=` and Feed UI tabs:
| Sort | Behavior |
|------|----------|
| `recent` | `createdAt` desc |
| `popular` | likes×2 + comments×3 |
| `trending` | engagement / age^0.6 |
| `following` | posts from followed houses |

### 9. Performance
- Cursor pagination + infinite scroll (existing)
- Batch like/follow hydration (no N+1 per post)
- Indexes on like/comment foreign keys
- In-memory score window capped (40–120) for popular/trending

### 10. Security
- Buyer auth for mutate endpoints (`requireBuyerContext`)
- Ownership checks on comment edit/delete
- Rate limits on social routes
- Comment sanitization + length limits
- Unique constraints prevent duplicate likes/follows

## APIs

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/posts/[id]/like` | Toggle post or product-backed feed id |
| POST | `/api/products/[id]/like` | Toggle product like |
| GET/POST | `/api/designers/[id]/follow` | Status + toggle |
| GET/POST | `/api/posts/[id]/comments` | List (paginated) / create |
| PATCH/DELETE | `/api/comments/[id]` | Own comment only |
| GET | `/api/feed?sort=` | Ranking + engagement hydrate |
| GET/POST | `/api/notifications` | List / unreadCount / mark_all_read |
| PATCH | `/api/notifications/[id]` | Mark read |
| GET | `/api/account/me` | Includes `followingCount` |

Wishlist/cart/order APIs unchanged from Phase 6.

## Database changes

Migration: `prisma/migrations/20260730190000_phase7_social`

- `posts.comments_count`
- `products.likes_count`
- `likes.post_id` nullable; `likes.product_id` + FK + unique
- Comment indexes (`parent_id`, `user_id`)
- Notification social refs: `post_id`, `product_id`, `designer_id`, `actor_user_id`

Existing `Like`, `Follow`, `Comment` tables extended — no duplicate tables.

## Architecture

```
UI (FeedPost / Designer / PDP / CommentPanel / ShareButton / Notifications)
  → hooks (useLike, useFollow, useShare, useStorefrontFeed)
  → API routes
  → services (Like / Follow / Comment / Notification / PublicCatalog)
  → repositories
  → Prisma / Postgres
```

## Out of scope (later phases)
AI, CRM, marketing, reputation, brand story, collections, luxury marketplace extras, atelier enhancements.

## Testing checklist

- [ ] Like / unlike post (persists across refresh / device)
- [ ] Like / unlike product on PDP
- [ ] Follow / unfollow designer; follower count updates
- [ ] Comment, reply, edit own, delete own; unauthorized edit fails
- [ ] Comment pagination + nested replies
- [ ] Wishlist save indicator on feed + PDP
- [ ] Share (native or copy link) for product / designer / feed
- [ ] Social notifications appear for follow / like / comment / reply
- [ ] Mark notification read / mark all read
- [ ] Feed sorts: Recent, Trending, Popular, Following
- [ ] Infinite scroll still works
- [ ] Guest cannot mutate (401); Phase 6 checkout still works
