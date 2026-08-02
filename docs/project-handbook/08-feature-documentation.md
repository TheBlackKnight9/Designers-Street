# 08 — Feature Matrix & Implementation Status

## 1. Feature Tracing Matrix

Every feature is evaluated across the 8-tier architectural pipeline:

| Feature | UI Component | Hook / Context | Client API | API Route Handler | Service Layer | Repository Layer | Prisma Model | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|:---:|
| **Buyer Auth** | `/account/login` | Supabase Auth | `supabase.auth` | `/api/auth/me` | N/A | N/A | `User` | ✅ Shipped |
| **Address Book** | `/profile/addresses` | `AddressForm` | `fetch` | `/api/profile/addresses` | N/A | N/A | `Address` | ✅ Shipped |
| **Measurement Profile**| `/profile/measurements`| `useMeasurements` | `fetch` | `/api/account/measurements`| N/A | N/A | `MeasurementProfile` | ✅ Shipped |
| **Admin Switcher** | `AdminHouseSwitcher` | `AdminHouseContext` | Cookies | N/A | N/A | `DesignerRepository` | `DesignerHouse` | ✅ Shipped |
| **Product Pricing Engine**| `ProductEditor` | N/A | `fetch` | `/api/dashboard/products` | `DashboardProductService`| `ProductRepository` | `Product` | ✅ Shipped |
| **Fail-Safe Media Upload**| `MediaGalleryUploader`| N/A | `upload` | `/api/dashboard/media/upload`| `MediaService` | `MediaRepository` | `MediaRecord` | ✅ Shipped |
| **Concept Art Lead Desk** | `ConceptInterestModal` | N/A | `fetch` | `/api/concept-interest` | N/A | N/A | `ConceptInterest` | ✅ Shipped |
| **Razorpay Checkout** | `/checkout` | N/A | `Razorpay` | `/api/checkout/create-order`| `ShippingCalculator` | `OrderRepository` | `Payment` / `Order` | ✅ Shipped |
| **Prepaid Discount** | `/checkout` | N/A | N/A | `/api/checkout/create-order`| `FinancialAccounting` | `OrderRepository` | `Payment` | ✅ Shipped |
| **Order Dispatch Desk** | `/admin/orders` | N/A | `fetch` | `/api/admin/orders` | `SmsService` | `OrderRepository` | `Order` | ✅ Shipped |
| **NEFT Payout Ledger** | `/admin/payouts` | N/A | `fetch` | `/api/admin/payouts` | `FinancialAccounting` | N/A | `Payout` | ✅ Shipped |
| **MSG91 SMS Gateway** | Server Background | N/A | N/A | `/api/orders/[id]` | `SmsService` | N/A | N/A | ✅ Shipped |
| **PDF Invoice Generator**| `/orders/[id]` | N/A | Window | `/api/orders/[id]/invoice` | N/A | `OrderRepository` | `Order` | ✅ Shipped |

---

## 2. Feature Detailed Specs

### A. All-Inclusive Pricing & Free Shipping
- **Implementation:** When an Admin creates a product, entering the Base Garment Price automatically computes GST (12%), Built-in Shipping (from item weight), and 10% Platform Fee.
- **Storefront Display:** All buyable garments display a green **"FREE SHIPPING"** badge across storefront search, category, and PDP pages.

### B. ₹100 Instant Online Prepaid Discount
- **Implementation:** At checkout, choosing online payment (UPI, Credit/Debit Cards, Net Banking) deducts ₹100 from the order total.
- **Multi-Vendor Cart Accounting:** Pro-rata discount share is split across designer sub-orders based on their subtotal ratio.

### C. Concept Art & Bespoke Lead Engine
- **Implementation:** Products marked `CONCEPT_ART` bypass inventory stock and weight fields, replacing "Add to Cart" with **"Request Bespoke Quote"**.
- **Customer Integration:** Opening the lead modal allows one-click auto-fill of saved customer body measurements.
- **Admin Desk:** Leads populate the Admin Concept Lead Desk (`/admin/concept-leads`).

### D. Bi-Monthly NEFT Payout Ledger
- **Implementation:** Calculates net earnings on the 1st & 15th (Gross Sales - 10% Fee - 18% GST - 1% TCS).
- **Export & Execution:** Admin exports 1-click NEFT Bank CSV for corporate net banking and enters UTR transaction reference numbers to mark payouts `Completed`.
