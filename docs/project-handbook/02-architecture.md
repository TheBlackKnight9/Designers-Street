# 02 — System Architecture & Data Flows

## 1. High-Level Architecture Overview

Designers Street is built on a modern **Next.js 15 App Router** architecture utilizing server-side rendering (SSR), client-side hydration, serverless API routes, and a decoupled Repository-Service-Controller backend pattern over PostgreSQL and Supabase.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER                                   │
│  - Customer Storefront Pages (/store, /product/[id], /cart, /checkout, /orders) │
│  - Admin Multi-House Control Panel (/admin, /dashboard, AdminHouseSwitcher)    │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │ HTTP / JSON / Server Actions
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            NEXT.JS 15 APP ROUTER                                │
│  - Middleware Security Gating (src/middleware.ts, src/lib/supabase/middleware) │
│  - React Server Components & API Routes (src/app/api/*)                         │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│   SERVICE LAYER      │    │  EXTERNAL INTEGRATIONS│   │  REPOSITORY LAYER    │
│ (Business Logic)     │    │ - Supabase Auth      │    │ (Data Access)        │
│ - DashboardProduct   │    │ - Cloudinary CDN     │    │ - ProductRepository  │
│ - MediaService       │    │ - Razorpay Payments  │    │ - DesignerRepository │
│ - FinancialAccounting│    │ - MSG91 SMS Gateway  │    │ - OrderRepository    │
│ - ShippingCalculator │    │ - India Post API     │    │ - MediaRepository    │
└──────────┬───────────┘    └──────────────────────┘    └──────────┬───────────┘
           │                                                       │
           └────────────────────────────┬──────────────────────────┘
                                        │ Prisma ORM
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              POSTGRESQL DATABASE                                │
│  - Supabase PostgreSQL (Production DB with GIN Full-Text Indexes)              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. End-to-End Tracing Pattern

Every feature in the system adheres to a strict 8-tier execution chain:

$$\text{UI Component} \longrightarrow \text{React Context / Hook} \longrightarrow \text{Client API Helper} \longrightarrow \text{Next.js Route Handler} \longrightarrow \text{Service Layer} \longrightarrow \text{Repository Layer} \longrightarrow \text{Prisma Client} \longrightarrow \text{PostgreSQL}$$

### Example Trace: Adding Media to a Product
1. **UI Component:** `MediaGalleryUploader` in `src/components/dashboard/ProductEditor.tsx` handles file selection.
2. **Client API Helper:** Calls `uploadProductMedia(productId, formData)` sending `FormData` containing the file buffer.
3. **Next.js Route Handler:** `POST /api/dashboard/products/[id]/media/upload` (`src/app/api/dashboard/products/[id]/media/upload/route.ts`).
4. **Service Layer:** `MediaService.uploadAndPersist()` streams buffer to Cloudinary; falls back to Base64 DB string if Cloudinary fails.
5. **Repository Layer:** `MediaRepository.create()` formats SQL insert.
6. **Prisma Client:** `prisma.mediaRecord.create(...)` executes database write.
7. **PostgreSQL:** Row inserted into `MediaRecord` table; `DashboardProductService.syncProductImages()` updates `Product.images` string array.

---

## 3. Server Architecture Patterns

### A. Repository Pattern (`src/server/repositories/*`)
Direct data access layer isolating SQL queries and Prisma ORM logic from business rules.
- `ProductRepository`: Product CRUD, raw database lookups, status filtering, count queries.
- `DesignerRepository`: Designer house lookups by handle, ID, or active status.
- `OrderRepository`: Order placement, multi-vendor cart splitting, dispute tracking.
- `MediaRepository`: Media metadata persistence, reordering display sequences.

### B. Service Pattern (`src/server/services/*`)
Encapsulates platform business rules, financial formulas, validation, and external service calls.
- `DashboardProductService`: Product creation validation, publishing requirements guard, status transitions.
- `MediaService`: Cloudinary signed upload signature creation, server buffer streaming, rollback handling.
- `FinancialAccountingService`: 10% platform commission calculation, 18% GST on commission, 1% GST TCS Section 52 deduction, pro-rata ₹100 discount distribution.
- `ShippingCalculator`: Weight-by-zone rate matrix lookup (`ShippingZone` + `ShippingRate`).
- `SmsService`: MSG91 Flow API integration for transactional SMS triggers.

---

## 4. Context & State Management Layer (`src/context/*`)

- **`AdminHouseContext`:** Provides sticky active designer house state (`activeDesignerId`, `activeDesignerName`) across admin routes. Persisted in `sessionStorage` and `admin_active_designer_id` cookie.
- **`WishlistContext`:** Manages buyer wishlist items, automatically syncing guest `localStorage` items to the database upon customer login.
- **`ToastContext`:** Global notification system for displaying success, error, and info toasts.

---

## 5. Security & Middleware Pipeline (`src/middleware.ts`)

- **Supabase Auth Session Refresh:** Every request passes through `updateSession(request)` to refresh Supabase access tokens.
- **Admin Route Guard:** Routes starting with `/admin` require a valid Supabase session with `role === 'admin'`. Unauthenticated users are redirected to `/account/login`.
- **Dashboard Access Logic:** Routes starting with `/dashboard` verify that the user is an admin OR has an `admin_active_designer_id` cookie set. This prevents accidental redirects to public landing pages.
