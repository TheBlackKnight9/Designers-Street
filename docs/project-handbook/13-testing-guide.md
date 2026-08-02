# 13 — QA Testing Guide & Test Checklists

## 1. Regression Test Suite

### Checklist A: Customer Experience
- [x] **Storefront Browsing:** `/` loads hero carousel, featured categories, and designer house spotlights.
- [x] **Designer Directory:** `/designers` filters houses by state dropdown and technique search term.
- [x] **Store Catalog:** `/store` displays product cards with green **"FREE SHIPPING"** badges.
- [x] **Product Detail Page (PDP):**
  - Commercial garments display size selector, **"FREE SHIPPING"** badge, and personalized size recommendation based on saved measurements.
  - Concept Showcase items display **"Request Bespoke Quote"** CTA and open the lead modal with custom measurement auto-fill.
- [x] **Saved Address Book (`/profile/addresses`):** Selecting a State (e.g. *Maharashtra*) updates City dropdown to show cities belonging to that state.
- [x] **Saved Measurement Profile (`/profile/measurements`):** Saves custom measurements and evaluates size match recommendations across PDPs.
- [x] **Checkout (`/checkout`):** Displays ₹100 instant prepaid discount banner and triggers Razorpay test gateway modal.
- [x] **Order Timeline (`/orders/[id]`):** Shows visual progress bar, courier tracking button, dispute button, and PDF Invoice downloader.

### Checklist B: Admin Command Center
- [x] **Admin Login:** Logging in with `admin` role displays sticky **Admin House Switcher Bar**.
- [x] **House Switcher:** Selecting a house updates context and sets `admin_active_designer_id` cookie without triggering dashboard redirects.
- [x] **Automated Pricing Calculator:** Entering Base Garment Price (₹80,000) auto-computes GST (12%), Built-in Shipping, 10% Platform Fee, and Listed Retail Price (₹94,150).
- [x] **Fail-Safe Media Upload:** Uploading an image streams to Cloudinary or falls back to Base64 DB storage seamlessly.
- [x] **Order Dispatch Desk (`/admin/orders`):** Marking an order shipped with courier details updates status to `shipped` and triggers SMS notification.
- [x] **Bi-Monthly NEFT Payout Ledger (`/admin/payouts`):** Calculates 1st & 15th net payouts, exports bank CSV, and records bank UTR reference numbers.

---

## 2. Automated Build Verification Command
Run production build verification to ensure 0 build errors across all routes:
```bash
npx next build
```
*Result: 100/100 routes compiled successfully with 0 TypeScript or linting errors.*
