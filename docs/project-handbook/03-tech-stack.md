# 03 — Technology Stack & Dependencies

## 1. Complete Technology Inventory

| Category | Technology / Package | Version | Purpose & Rationale |
|:---|:---|:---:|:---|
| **Core Framework** | Next.js | `15.1.0` | React server components, SSR, serverless API routes, optimized bundle splitting |
| **Language** | TypeScript | `^5.0.0` | Strict static typing across database schemas, APIs, and UI props |
| **UI Library** | React | `19.0.0` | Declarative UI rendering, hooks, hydration |
| **DOM Manipulation** | React DOM | `19.0.0` | Client-side DOM rendering and portal hydration |
| **Database** | PostgreSQL (Supabase) | `15.x` | Production relational database hosted on Supabase (ap-south-1) |
| **ORM** | Prisma | `^6.0.1` | Type-safe database queries, schema migrations, relationship mapping |
| **Prisma Client** | `@prisma/client` | `^6.0.1` | Generated query builder for runtime database access |
| **Authentication** | `@supabase/ssr` & `@supabase/supabase-js` | `^0.5.2` | SSR-compatible authentication, session cookies, Google OAuth |
| **Media CDN** | Cloudinary SDK (`cloudinary`) | `^2.5.1` | Cloud image/video storage, signed uploads, edge transformations |
| **Payments** | Razorpay SDK (`razorpay`) | `^2.9.5` | Standard checkout gateway for UPI, Credit/Debit cards, Net Banking |
| **Icons** | Lucide React (`lucide-react`) | `^0.468.0` | Clean SVG icon library for UI controls and navigation |
| **Styling** | Tailwind CSS | `^3.4.1` | Utility-first CSS framework for responsive luxury design system |
| **PostCSS** | PostCSS & Autoprefixer | `^8.4.38` | CSS processing and vendor prefixing |
| **Form Utilities** | Native HTML5 + React State | N/A | High-performance controlled forms without heavy library overhead |
| **IDs** | CUID / NanoID (`cuid2`) | `^2.2.2` | Collision-resistant, URL-safe database primary key generation |

---

## 2. Technology Rationale & Selection Criteria

### Why Next.js 15 (App Router)?
- **SEO & Performance:** Fast initial page loads for luxury garment storefronts using Server Components.
- **Unified Architecture:** Combines React frontend with Node.js serverless API routes in a single codebase.

### Why Prisma ORM over Raw SQL?
- **Type Safety:** Auto-generates TypeScript interfaces directly from `schema.prisma`.
- **Migration Stability:** Declarative schema migration management (`prisma db push`).

### Why Supabase Auth + PostgreSQL?
- **Managed Auth:** Out-of-the-box support for email/password and Google OAuth without managing JWT servers.
- **Relational Integrity:** Foreign key constraints and transaction support for multi-vendor cart orders.

### Why Cloudinary with Base64 Fallback?
- **Edge Transformations:** Automatically generates optimized WebP/AVIF formats and video poster thumbnails.
- **Fail-Safe Reliability:** If Cloudinary credentials fail, the server automatically falls back to Base64 DB storage.

### Why Razorpay?
- **India Market Dominance:** Seamless support for UPI (GPay, PhonePe, Paytm), net banking, and card EMI options.
