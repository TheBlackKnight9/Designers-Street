# Phase 9 Implementation Plan — Editorial & Discovery Experience

**Version Target:** v0.9.0  
**Baseline:** v0.8.1 Foundation Stabilization  
**Status:** Approved with refinements  
**Objective:** Transform Designer's Street into an ultra-luxury digital fashion magazine & editorial discovery storefront (inspired by Farfetch, SSENSE, Net-a-Porter) with PostgreSQL persistence, dual-mode API fallback, CMS admin management, and zero structural redesign of working components.

---

## 1. Database Schema Additions (`prisma/schema.prisma`)

```prisma
enum SectionType {
  hero_campaign
  designer_spotlight
  editorial_collection
  article_rail
  lookbook_rail
  limited_edition_shelf
  editors_pick_shelf
}

model EditorialCampaign {
  id                 String   @id @default(cuid())
  title              String
  slug               String   @unique
  subtitle           String?
  heroImage          String   @map("hero_image")
  heroVideoUrl       String?  @map("hero_video_url")
  headline           String
  body               String
  badge              String?  // e.g. "Cover Story", "SS26 Residency"
  featuredDesignerId String?  @map("featured_designer_id")
  ctaLabel           String?  @map("cta_label")
  ctaLink            String?  @map("cta_link")
  published          Boolean  @default(true)
  sortOrder          Int      @default(0) @map("sort_order")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  featuredDesigner DesignerHouse? @relation(fields: [featuredDesignerId], references: [id], onDelete: SetNull)

  @@index([published, sortOrder])
  @@map("editorial_campaigns")
}

model EditorialCollection {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  tagline      String?
  coverImage   String   @map("cover_image")
  description  String?
  curatorNotes String?  @map("curator_notes")
  published    Boolean  @default(true)
  sortOrder    Int      @default(0) @map("sort_order")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  items EditorialCollectionItem[]

  @@index([published, sortOrder])
  @@map("editorial_collections")
}

model EditorialCollectionItem {
  id            String   @id @default(cuid())
  collectionId  String   @map("collection_id")
  productId     String   @map("product_id")
  displayOrder  Int      @default(0) @map("display_order")
  editorialNote String?  @map("editorial_note")
  createdAt     DateTime @default(now()) @map("created_at")

  collection EditorialCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  product    Product              @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([collectionId, productId])
  @@index([collectionId, displayOrder])
  @@map("editorial_collection_items")
}

model EditorialArticle {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  category    String   // e.g. "Atelier Visit", "Craft & Origin", "Trend Edit"
  excerpt     String
  coverImage  String   @map("cover_image")
  contentJson Json     @map("content_json") // Rich blocks: text, image, quote, product_card
  authorName  String?  @map("author_name")
  authorRole  String?  @map("author_role")
  designerId  String?  @map("designer_id")
  published   Boolean  @default(true)
  publishedAt DateTime @default(now()) @map("published_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  designer DesignerHouse? @relation(fields: [designerId], references: [id], onDelete: SetNull)

  @@index([published, publishedAt])
  @@map("editorial_articles")
}

model FeaturedSection {
  id         String      @id @default(cuid())
  title      String
  subtitle   String?
  type       SectionType
  targetSlug String?     @map("target_slug") // Collection slug, campaign slug, designer handle, etc.
  sortOrder  Int         @default(0) @map("sort_order")
  active     Boolean     @default(true)
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")

  @@index([active, sortOrder])
  @@map("featured_sections")
}
```

---

## 2. Repositories & Services (`src/server/`)

### Repositories (`src/server/repositories/editorial-repository.ts`)
- `EditorialRepository`:
  - `findActiveCampaign()`, `listCampaigns()`
  - `listCollections()`, `findCollectionBySlug(slug)`
  - `listArticles(limit)`, `findArticleBySlug(slug)`
  - `listActiveFeaturedSections()`
  - Admin CRUD methods: `createCampaign`, `updateCampaign`, `createCollection`, `updateCollection`, `createArticle`, `updateArticle`, `updateSectionOrders`.

### Services (`src/server/services/editorial-service.ts`)
- `EditorialService`:
  - Business rules, DTO mapping, dual-mode fallback to `src/lib/phase9-demo.ts` when `USE_DATABASE=false`.

---

## 3. API Endpoints (`src/app/api/`)

### Public Discovery APIs (`src/app/api/editorial/`)
1. `GET /api/editorial/home`: Full dynamic homepage payload.
2. `GET /api/editorial/campaigns` & `/api/editorial/campaigns/[slug]`
3. `GET /api/editorial/collections` & `/api/editorial/collections/[slug]` (RESTful plural `/collections/`)
4. `GET /api/editorial/articles` & `/api/editorial/articles/[slug]`

### CMS / Admin APIs (`src/app/api/dashboard/editorial/`)
1. `GET/POST/PUT/DELETE /api/dashboard/editorial/campaigns`
2. `GET/POST/PUT/DELETE /api/dashboard/editorial/collections`
3. `GET/POST/PUT/DELETE /api/dashboard/editorial/articles`
4. `GET/PUT /api/dashboard/editorial/sections` (dynamic home section ordering)

---

## 4. Client API Façade & Hooks

- `src/lib/api/editorial.ts`: Browser-safe API façade supporting `isRemoteApiEnabled()`.
- `src/hooks/useEditorial.ts`:
  - `useEditorialHome()`
  - `useEditorialCollection(slug)`
  - `useEditorialArticle(slug)`
  - `useAdminEditorial()`

---

## 5. UI Components & Page Evolutions

### Reused Systems (No Redesign)
- **`MediaViewer`**: Campaign videos and article galleries.
- **`ProductCard`**: Collection items, staff picks, and inline article products.
- **`LookbookCard`**: Trending lookbook rails.
- **`TopBar` & `BottomNav`**: Maintained.

### Components (`src/components/editorial/`)
- `HeroCampaignBanner.tsx`: Magazine cover hero.
- `DesignerSpotlight.tsx`: House highlight with product shelf.
- `EditorialCollectionShelf.tsx`: Themed collection grid.
- `ArticleCard.tsx`: Magazine story feature card.
- `FeaturedSectionRenderer.tsx`: Dynamic section renderer.

### Pages & Routes
- **Home Page (`src/app/page.tsx`)**: Dynamic magazine homepage driven by active `FeaturedSection` config.
- **Article Detail (`src/app/editorial/[slug]/page.tsx`)**: Long-form magazine reader.
- **Collection Detail (`src/app/collections/[slug]/page.tsx`)**: RESTful `/collections/[slug]` campaign gallery.
- **Admin Dashboard (`src/app/admin/page.tsx` & `/dashboard`)**: Added **Editorial CMS** tab for creating/editing campaigns, collections, articles, and section orders.

---

## 6. Verification & Release Docs

- `npx tsc --noEmit`
- `npm run build`
- `docs/phase-9-report.md`
- `docs/phase-9-final-qa.md`
- `docs/releases/v0.9.0.md`
- `walkthrough.md`
