# 10 — UI Component Library & Props Reference

## 1. Storefront & Customer Components

### `DesignerHouseCard`
- **File:** `src/components/designer/DesignerHouseCard.tsx`
- **Purpose:** Renders a luxury designer house card in `/designers` directory.
- **Props:**
  ```typescript
  type DesignerHouseCardProps = {
    house: {
      id: string;
      name: string;
      handle: string;
      logo: string | null;
      banner: string | null;
      location: string | null;
      signatureTechniques: string[];
      _count: { products: number };
    };
  };
  ```
- **Dependencies:** Next.js `Link`, `Image`.

### `ProductCard`
- **File:** `src/components/product/ProductCard.tsx`
- **Purpose:** Renders product cards across store grids, search results, and category pages.
- **Features:** Displays image/video preview, green **"FREE SHIPPING"** badge for commercial items, **"🎨 Concept Showcase"** badge for concept items, base/retail prices, and wishlist button.

### `SizeRecommendation`
- **File:** `src/components/product/SizeRecommendation.tsx`
- **Purpose:** Compares customer's saved body measurements (`/profile/measurements`) against product size chart to show personalized fit recommendations (*"Recommended Size: M"*).

### `ConceptInterestModal`
- **File:** `src/components/product/ConceptInterestModal.tsx`
- **Purpose:** Bespoke lead capture modal for `CONCEPT_ART` items. Auto-fills customer contact info and saved measurements.

---

## 2. Admin Command Center Components

### `AdminHouseSwitcher`
- **File:** `src/components/admin/AdminHouseSwitcher.tsx`
- **Purpose:** Sticky top bar rendering on `/admin/*` and `/dashboard/*`. Allows admin team to select active house context.
- **Context Used:** `AdminHouseContext`.

### `MediaGalleryUploader`
- **File:** `src/components/dashboard/MediaGalleryUploader.tsx`
- **Purpose:** Fail-safe media gallery uploader supporting drag-and-drop files (server upload stream) and direct image URL paste fallback.

### `ProductEditor`
- **File:** `src/components/dashboard/ProductEditor.tsx`
- **Purpose:** Master product creation and editing form. Features the **Automated Retail Pricing Calculator** (Base + GST + Built-in Shipping + 10% Platform Fee).
