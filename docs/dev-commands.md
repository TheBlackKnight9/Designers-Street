# Dev Commands Cheatsheet

## Install

```bash
npm install
```

## Start frontend (only service)

```bash
npm run dev
# → http://localhost:3000
```

## Start backend

```bash
# N/A — no backend in this repository
```

## Lint

```bash
npm run lint
```

## Format

```bash
# N/A — no Prettier / format script configured
# Optional (if you add Prettier later):
# npx prettier --write .
```

## Typecheck

```bash
# No dedicated script; Next runs TypeScript during build.
npx tsc --noEmit
# or
npm run build
```

## Build

```bash
npm run build
```

## Start production server

```bash
npm run build
npm run start
# → http://localhost:3000
```

## Test

```bash
# N/A — no test runner or test script
```

## Seed DB

```bash
# N/A — seed is src/lib/mock-data.ts (imported at runtime)
```

## Reset DB / local catalog

```bash
# Browser DevTools → Application → Local Storage → clear:
#   ds_designers, ds_products, ds_promo, ds-cart, ds-wishlist
# Or use /admin → Reset to defaults (catalog keys only)
```

## Generate Prisma

```bash
# N/A — Prisma not used
```

## Run migrations

```bash
# N/A — no database
```

## Clean cache

```bash
# PowerShell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Reinstall (if needed)
Remove-Item -Recurse -Force node_modules
npm install
```

## Useful URLs (dev)

| URL | Page |
|-----|------|
| http://localhost:3000/ | Home |
| http://localhost:3000/feed | Feed |
| http://localhost:3000/store | Store |
| http://localhost:3000/admin | Admin CRUD |
| http://localhost:3000/bespoke | Bespoke |
| http://localhost:3000/cart | Cart |
