# 07 — Screen & Page Registry

## 1. Storefront Screens (Customer Facing)

### A. Home Page (`/`)
- **Purpose:** Luxury landing page introducing featured collections, ateliers, and campaign drops.
- **Components Used:** `HeroCarousel`, `FeaturedHouses`, `CategoryStrip`, `EditorialDropBanner`.
- **States:**
  - Loading: Skeleton loader for hero and category images.
  - Empty: Fallback static editorial assets.

### B. Designer Directory (`/designers`)
- **Purpose:** Public directory to search and filter all listed Designer Houses.
- **Components Used:** `DesignerHouseCard`, `StateCityFilterPills`, `TechniqueSearchInput`.
- **User Actions:**
  - Type in search bar to filter houses by name, city, or technique (*Zardozi*).
  - Click state filter chip (e.g. *Rajasthan*) to view regional ateliers.
  - Click **"Explore Atelier"** to open `/designer/[handle]`.

### C. Public Designer Profile & Concept Vault (`/designer/[handle]`)
- **Purpose:** Dedicated public landing page for a Designer House.
- **Tabs:**
  1. `Store`: Buyable garments (`COMMERCIAL`) displaying green **"FREE SHIPPING"** badges.
  2. `Concept Vault`: Digital sketches and runway previews (`CONCEPT_ART`) displaying **"Request Bespoke Quote"** CTAs.
  3. `Lookbooks`: Campaign photo galleries.
  4. `Posts`: Behind-the-scenes feed media.

### D. Product Detail Page (`/product/[productId]`)
- **Purpose:** Primary conversion page for purchasing garments or submitting bespoke inquiries.
- **Components Used:** `ProductGallery`, `SizeRecommendation`, `SizeChartDrawer`, `LegalMetrologyDisclosure`, `APlusContentRenderer`, `ProductReviews`, `ConceptInterestModal`.
- **Dynamic Behavior:**
  - `COMMERCIAL`: Shows "Add to Bag" & "Buy Now", price breakdown, and size selector.
  - `CONCEPT_ART`: Shows "Request Bespoke Quote" CTA, opening `ConceptInterestModal` with saved measurement auto-fill.

### E. Cart & Checkout (`/cart`, `/checkout`)
- **Purpose:** Review order items, select delivery address, apply prepaid discount, and complete payment.
- **Components Used:** `SavedAddressSelector`, `PrepaidDiscountBanner`, `RazorpayPaymentModal`.
- **Incentive Banner:** *"✨ Extra ₹100 Instant Discount Applied for Online Payment!"*

### F. Customer Profile & Orders (`/profile`, `/orders/[id]`, `/profile/addresses`, `/profile/measurements`)
- **Saved Addresses (`/profile/addresses`):** Add/Edit address using 36 State & dependent City dropdowns.
- **Saved Measurements (`/profile/measurements`):** Saved body measurement profile (Bust, Waist, Hips, Shoulder, Height).
- **Order Timeline (`/orders/[id]`):** Visual progress bar (Placed $\to$ Confirmed $\to$ Processing $\to$ Shipped $\to$ Delivered), courier tracking button, dispute button, and PDF Invoice downloader.

---

## 2. Admin Command Center Screens (Admin Facing)

### A. Admin Dashboard Root (`/admin`)
- **Purpose:** High-level executive overview for the 3-person platform team.
- **Components Used:** `AdminHouseSwitcher`, `KPIStatCards`, `QuickActionLinks`.

### B. House Directory Manager (`/admin/designers`)
- **Purpose:** Create, edit, suspend, or reactivate Designer Houses.
- **Modal Fields:** Brand Name, Handle, Bio, Logo, Banner, Bank A/C, IFSC, GSTIN, PAN, Shipping Origin Pincode, Commission Rate (%).

### C. Universal Catalog Studio (`/admin/products`)
- **Purpose:** Create and edit products for any house selected in the Admin House Switcher.
- **Automated Pricing Calculator:** Computes Listed Retail Price from Base Garment Price + GST (12%) + Built-in Shipping + 10% Platform Fee.

### D. Central Order Dispatch Desk (`/admin/orders`)
- **Purpose:** View incoming orders, assign courier tracking numbers (BlueDart, DTDC, Delhivery), and mark orders shipped/delivered.

### E. Bi-Monthly NEFT Payout Ledger (`/admin/payouts`)
- **Purpose:** Review 1st & 15th net payouts per house, export NEFT Bank CSVs, and record bank UTR reference numbers.
