# Environment Variables

## Summary

This project currently uses **zero environment variables**. There is no `.env.example`, no `process.env` / `NEXT_PUBLIC_*` usage in source, and no server-side secrets.

A `.env` / `.env.local` file is **not required** to run the app locally.

`.gitignore` ignores `.env*` (standard Next.js template).

---

## Variables

| Variable Name | Purpose | Required? | Example Value | Where Used |
|---------------|---------|-----------|---------------|------------|
| — | No application env vars defined | N/A | N/A | N/A |

---

## Optional Next.js / tooling variables (not used by app code)

These may appear in general Next.js workflows but are **not referenced** by Designer's Street today:

| Variable Name | Purpose | Required? | Example Value | Where Used |
|---------------|---------|-----------|---------------|------------|
| `PORT` | Override default HTTP port | No | `3000` | Next.js CLI (optional) |
| `NODE_ENV` | `development` / `production` | Set by Next automatically | `development` | Next.js runtime |

---

## Creating `.env`

**Do not invent secret values.** Because there is no `.env.example` and no required secrets:

- No `.env` was created during local setup.
- When you add a backend later, introduce `.env.example` with placeholders only, e.g.:

```env
# NEXT_PUBLIC_API_BASE_URL=https://api.example.com
# DATABASE_URL=
# AUTH_SECRET=
```

---

## Browser storage (not env)

Runtime “config” lives in `localStorage`:

| Key | Purpose |
|-----|---------|
| `ds_designers` | Admin-edited designer list |
| `ds_products` | Admin-edited product list |
| `ds_promo` | Promo banner text |
| `ds-cart` | Cart line items |
| `ds-wishlist` | Wishlist product IDs |
