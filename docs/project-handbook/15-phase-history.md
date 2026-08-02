# 15 — Phase History & Platform Evolution

## Phase Milestone Log

- **Phases 0–10 (Foundational Setup):**
  - Established Next.js App Router repository, Supabase Auth integration, Prisma schema models, basic product CRUD, Cloudinary media pipeline, and initial mobile responsive layouts.
- **Phase 11 (Refinement & Audit):**
  - Conducted deep-dive code audits, stabilized media viewer, reels, and stories components, implemented initial health check endpoints.
- **Phase 12 (Buyer Auth, Security & Address UX):**
  - Implemented customer login/signup UI (`/account/login`), saved address manager (`/profile/addresses`) with 36 Indian States & dependent City dropdowns, customer saved body measurement profiles (`/profile/measurements`), and customer legal pages (`/terms`, `/privacy`, `/cookies`).
- **Phase 13 (Admin Multi-House Management Engine):**
  - Built the sticky **Admin House Switcher Bar** (`AdminHouseSwitcher`), House Directory Manager (`/admin/designers`), and switched architecture to a 2-Role System (`buyer` + `admin`), disabling self-serve designer registration.
- **Phase 14 (Universal Content Studio & Fail-Safe Media Engine):**
  - Built server-side upload stream (`/api/dashboard/products/[id]/media/upload`) with automatic Base64 DB fallback, feed post editor with product hotspot tags, and multi-slide story builder.
- **Phase 15 (Inventory Studio, Product Pricing Engine & Concept Art):**
  - Built dual listing classification (`COMMERCIAL` vs `CONCEPT_ART`), **Automated Retail Pricing Calculator** (Base + GST + Built-in Shipping + 10% Platform Fee), storefront **"FREE SHIPPING"** badges, size chart builder, and Legal Metrology inputs.
- **Phase 16 (Public Designer Directory & Concept Vault):**
  - Built public Designer Directory (`/designers`), top header & bottom nav "Houses" links, and public designer profile (`/designer/[handle]`) with the **Concept Vault** tab.
- **Phase 17 (Commerce Engine, ₹100 Prepaid Discount & Multi-Vendor Split):**
  - Built Razorpay Checkout integration, **-₹100 Online Prepaid Discount** logic, and **Multi-Vendor Cart Split Accounting Engine**.
- **Phase 18 (Order Dispatch Desk, SMS Gateway & Dispute Engine):**
  - Built Admin Order Dispatch Desk (`/admin/orders`), MSG91 SMS notification engine, visual order progress timeline (`/orders/[id]`), and buyer "Report Not Received" dispute freezer.
- **Phase 19 (Financial Accounting Engine, GST TCS & Manual Payout Ledger):**
  - Built 10% platform commission engine, 1% GST TCS Section 52 collection logic, **Bi-Monthly NEFT Payout Ledger** (`/admin/payouts`) with bank CSV exporter and UTR tracking, and PDF GST Invoice generator.
- **Phase 20 (Social Persistence, Reviews & Concept Leads):**
  - Built database persistence for Wishlist, Follows, Likes, Comments, verified buyer review engine with photos, and Admin Concept Leads Desk (`/admin/concept-leads`).
- **Phase 23 (Search Engine & Promotional Coupons):**
  - Built PostgreSQL full-text search, live autocomplete API, faceted store filter panel, promotional coupon validation engine, and Admin Coupon Manager (`/admin/coupons`).
