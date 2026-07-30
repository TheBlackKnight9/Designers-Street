# Local Setup — Designer's Street

## Prerequisites

| Tool | Required | Verified on this machine | Notes |
|------|----------|--------------------------|-------|
| **Node.js** | **≥ 20.9** (Next.js 16) | v24.15.0 | Do not use Node 18 |
| **npm** | Comes with Node | 11.12.1 | Lockfile is npm (`package-lock.json`) |
| pnpm | Not required | 9.15.9 present | Prefer `npm` to match lockfile |
| Yarn | Not required | Missing | — |
| Python | Not required | 3.14.4 | Frontend-only |
| Java / Rust / Go | Not required | — | — |
| Docker | Not required | 29.6.1 present | No Dockerfile / compose in repo |
| Database | Not required | — | Mock data + localStorage |

---

## Installation

```bash
# From repo root
npm install
```

Uses `package-lock.json`. Avoid `npm install --force` unless diagnosing a specific conflict.

---

## Environment Variables

None required. See [environment.md](./environment.md).

---

## Database

**None.** Catalog ships in `src/lib/mock-data.ts`. Cart, wishlist, and admin edits persist in the browser via `localStorage`.

No migrations, Prisma, Supabase, or seed scripts.

To reset admin catalog data: open `/admin` → reset to defaults, or clear keys `ds_designers`, `ds_products`, `ds_promo` in DevTools.

---

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve .next after build
npm run lint     # ESLint (currently reports existing warnings/errors)
```

Startup order: **only the Next.js app** (no DB/backend/worker).

---

## Development Workflow

1. `npm install`
2. `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Edit under `src/` — Turbopack hot-reloads
5. Optional: `/admin` for local catalog CRUD
6. Before PRs: `npm run lint` and `npm run build`

---

## Health Check (verified)

| Check | Result |
|-------|--------|
| `npm install` | Success |
| `npm run build` | Success (Next.js 16.2.10 / Turbopack) |
| `npm run dev` | Ready on port **3000** |
| `/`, `/feed`, `/store`, `/cart`, `/wishlist`, `/profile`, `/admin`, `/bespoke`, `/category` | HTTP 200 |
| `/product/prod-1`, `/designer/maison-riviere` | HTTP 200 |
| Database | N/A |
| Auth | Guest-only UI; no login |
| Uploads | N/A (image URLs as strings) |
| Backend API | N/A |

---

## Common Issues & Troubleshooting

### Port 3000 already in use

```bash
# Windows PowerShell — find and stop process, or:
npx next dev -p 3001
```

### `npm run lint` fails with errors

Known existing issues (see [codebase-audit.md](./codebase-audit.md)):

- `@typescript-eslint/no-explicit-any` in `admin/page.tsx`, `page.tsx`
- `react-hooks/set-state-in-effect` in Cart/Data/Wishlist contexts (localStorage hydrate pattern)
- Unused imports/vars

These do **not** block `next build` or `next dev` today.

### Images fail to load

- Ensure network access to `images.unsplash.com`
- Remote hosts must stay listed in `next.config.ts` → `images.remotePatterns`

### Wrong package manager

Prefer **npm** so installs stay consistent with `package-lock.json`. Mixing pnpm/yarn without generating their lockfile can cause drift.

### Node version too old

Upgrade to Node **20.9+** (LTS 22 or current 24 also fine for local). Do not downgrade Next to fix Node — upgrade Node instead.

### Stale Next cache

```bash
Remove-Item -Recurse -Force .next   # PowerShell
npm run dev
```

### Admin data looks wrong / missing products

Clear `localStorage` keys `ds_*` or use Reset in `/admin`. Wishlist still reads static `PRODUCTS` from mock-data (see audit).

### npm warn `Unknown env config "devdir"`

Comes from a user/global npmrc env; harmless for this project. Optional: remove custom `devdir` from npm config if desired.
