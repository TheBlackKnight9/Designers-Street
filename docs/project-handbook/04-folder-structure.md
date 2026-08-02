# 04 — Directory Structure & File Map

## 1. Top-Level Directory Tree

```
phase 10 orignal/
├── docs/                    # Architectural reports, phase history, and project-handbook
├── prisma/                  # Database schema (schema.prisma) and seed scripts
├── public/                  # Static images, icons, and public assets
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   ├── components/          # Reusable UI components (dashboard, product, designer, header)
│   ├── context/             # React Context Providers (AdminHouseContext, WishlistContext)
│   ├── hooks/               # Custom React hooks (useToast, useWishlist)
│   ├── lib/                 # Utility helpers, API clients, static datasets (india-locations)
│   └── server/              # Server-side architecture (auth, db, services, repositories)
├── .env                     # Local environment variables
├── middleware.ts            # Next.js edge middleware routing gate
├── next.config.ts           # Next.js configuration
├── package.json             # Project dependencies and npm scripts
└── tsconfig.json            # TypeScript compiler configuration
```

---

## 2. Exhaustive `src/app` Route Map

### Storefront Routes (Customer Facing)
- **`src/app/page.tsx`**: Public home page (Hero carousel, featured houses, editorial drops).
- **`src/app/store/page.tsx`**: Storefront catalog grid with filter chips and "FREE SHIPPING" badges.
- **`src/app/product/[productId]/page.tsx`**: Product Detail Page (PDP) supporting `COMMERCIAL` buyable garments and `CONCEPT_ART` bespoke inquiries.
- **`src/app/designers/page.tsx`**: Public Designer Directory searchable by 36 States/UTs and techniques.
- **`src/app/designer/[handle]/page.tsx`**: Public Designer House Profile featuring the `Concept Vault` tab.
- **`src/app/feed/page.tsx`**: Full-screen Reels, stories tray, and product-tagged video posts.
- **`src/app/cart/page.tsx`**: Multi-vendor shopping bag grouped by house.
- **`src/app/checkout/page.tsx`**: Multi-vendor checkout with saved address selector and ₹100 prepaid discount.
- **`src/app/checkout/failed/page.tsx`**: Payment failure screen with 15-minute stock hold retry.
- **`src/app/orders/page.tsx`**: Customer order history.
- **`src/app/orders/[id]/page.tsx`**: Customer order visual timeline, tracking link, dispute button, and GST Invoice downloader.
- **`src/app/profile/addresses/page.tsx`**: Customer saved address manager with 36 State & dependent City dropdowns.
- **`src/app/profile/measurements/page.tsx`**: Customer saved measurement profile manager (Inches/CM).

### Admin Command Center Routes (Admin Facing)
- **`src/app/admin/page.tsx`**: Admin root dashboard with high-level KPI cards.
- **`src/app/admin/designers/page.tsx`**: House Directory Manager (Create/Edit houses, bank details, GST, commission rates).
- **`src/app/admin/products/page.tsx`**: Central catalog manager across all designer houses.
- **`src/app/admin/inventory/page.tsx`**: Multi-variant inventory grid (Sizes $\times$ Colors stock).
- **`src/app/admin/orders/page.tsx`**: Central order dispatch desk & courier tracking entry modal.
- **`src/app/admin/payouts/page.tsx`**: Bi-monthly NEFT payout ledger (1st & 15th) with CSV export and UTR tracking.
- **`src/app/admin/concept-leads/page.tsx`**: Concept Art bespoke inquiry lead desk.

### API Routes (`src/app/api/*`)
- **`src/app/api/auth/me/route.ts`**: Resolves active Supabase session & user role.
- **`src/app/api/admin/designers/route.ts`**: Admin list/create designer houses.
- **`src/app/api/dashboard/products/[id]/media/upload/route.ts`**: Fail-safe server media upload stream with Base64 DB fallback.
- **`src/app/api/checkout/create-order/route.ts`**: Creates Razorpay order with -₹100 prepaid discount.
- **`src/app/api/webhooks/razorpay/route.ts`**: Webhook verification & multi-vendor cart split engine.
- **`src/app/api/orders/[id]/invoice/route.ts`**: Generates downloadable GST-compliant PDF invoice.

---

## 3. Server Architecture Directory Map (`src/server`)

```
src/server/
├── auth/                    # Auth session helpers and permission checks
│   ├── dashboard-session.ts # Resolves admin session and active house context
│   └── permissions.ts       # Role access logic (canAccessDesignerDashboard)
├── db/                      # Prisma database singleton instance
│   └── index.ts
├── errors/                  # Custom error classes (ValidationError, NotFoundError, UnauthorizedError)
│   └── index.ts
├── media/                   # Cloudinary SDK wrapper and signed upload params
│   └── cloudinary.ts
├── repositories/            # Data access layer (Prisma queries)
│   ├── designer-repository.ts
│   ├── media-repository.ts
│   ├── order-repository.ts
│   └── product-repository.ts
├── services/                # Business logic services
│   ├── dashboard-product-service.ts
│   ├── financial-accounting.ts
│   ├── media-service.ts
│   ├── shipping-calculator.ts
│   └── sms-service.ts
└── utils/                   # Server utilities (API response wrappers, logger, ID generator)
    ├── api-response.ts
    ├── ids.ts
    └── logger.ts
```
