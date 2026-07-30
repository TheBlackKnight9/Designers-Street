# Environment Variables

## Summary

Phase 1 introduces optional backend env vars. **None are required** for the existing UI (defaults keep mock data).

Copy placeholders:

```bash
copy .env.example .env
```

Never commit real secrets. `.env` / `.env.local` are gitignored; `.env.example` is committed.

---

## Application / façade

| Variable Name | Purpose | Required? | Example Value | Where Used |
|---------------|---------|-----------|---------------|------------|
| `NODE_ENV` | Runtime mode | No (set by Next) | `development` | Next.js / health |
| `NEXT_PUBLIC_APP_URL` | Absolute origin for server-side fetch to `/api` | No | `http://localhost:3000` | `src/lib/api/catalog.ts` |
| `NEXT_PUBLIC_USE_API` | Façade uses HTTP `/api/*` instead of in-process mock | No | `false` | `src/lib/api/catalog.ts` |
| `USE_DATABASE` | Services/repositories use Prisma instead of mock-data | No | `false` | `src/server/utils/env.ts`, services |
| `PORT` | Override Next port | No | `3000` | Next CLI |

---

## Database

| Variable Name | Purpose | Required? | Example Value | Where Used |
|---------------|---------|-----------|---------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | Yes when `USE_DATABASE=true` | `postgresql://designers:designers@localhost:5432/designers_street?schema=public` | Prisma (`prisma/schema.prisma`), `src/server/db.ts` |

Local Docker Compose credentials match the example above (`docker compose up -d`).

---

## Auth scaffold (Phase 2 ready)

| Variable Name | Purpose | Required? | Example Value | Where Used |
|---------------|---------|-----------|---------------|------------|
| `AUTH_SECRET` | Hash pepper for session tokens | Yes before production auth | long random string | `src/server/auth/session.ts` |
| `SESSION_COOKIE_NAME` | Session cookie name | No | `ds_session` | auth session helpers |
| `SESSION_MAX_AGE_DAYS` | Session lifetime | No | `14` | auth session helpers |

---

## Media (Phase 3 placeholders)

| Variable Name | Purpose | Required? | Example Value | Where Used |
|---------------|---------|-----------|---------------|------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud | No (Phase 3) | — | future upload sign |
| `CLOUDINARY_API_KEY` | API key | No | — | future |
| `CLOUDINARY_API_SECRET` | API secret | No | — | future |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client cloud name | No | — | future |

---

## Browser storage (not env)

| Key | Purpose |
|-----|---------|
| `ds_designers` / `ds_products` / `ds_promo` | Admin catalog |
| `ds-cart` | Cart |
| `ds-wishlist` | Wishlist |
