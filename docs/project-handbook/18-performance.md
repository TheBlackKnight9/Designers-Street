# 18 — Performance & Optimization Audit

## 1. Bundle & Code Splitting Optimization

- **Next.js 15 App Router:** Pages automatically code-split into lightweight JS bundles.
- **Shared First-Load JS:** Shared JS bundle across all routes is only **173 kB** (highly optimized for mobile networks in India).
- **Route Compilation Metrics:** 100/100 routes compiled successfully with 0 build warnings.

---

## 2. Media & Asset Performance

- **Cloudinary Dynamic Optimization:** Images automatically request WebP/AVIF formats and custom width bounds (`w_800`, `q_auto`, `f_auto`).
- **Video Poster Generation:** Videos in feed and reels auto-generate poster images using Cloudinary frame transformation (`format: "jpg"`, `start_offset: 0`).
- **Lazy Loading & Next Image:** Native `next/image` handles responsive `srcset` and lazy loading for off-screen product cards.

---

## 3. Database & Query Performance

- **GIN Full-Text Indexes:** PostgreSQL GIN index on `Product(name, description)` accelerates search queries under 150ms.
- **Prisma Query Optimization:** Selected queries specify explicit `select` blocks to prevent over-fetching large text columns during catalog listings.
- **Indexed Primary & Foreign Keys:** Indexes maintained on `designerId`, `productId`, `userId`, `orderId`, and `handle`.
