# 05 — Database Schema & Data Models

## 1. Database Overview & Entity-Relationship Diagram

Designers Street uses PostgreSQL (hosted on Supabase) via Prisma ORM. The relational model enforces strict constraints across User Accounts, Designer Houses, Products, Variants, Media Records, Cart Items, Multi-Vendor Sub-Orders, Payout Ledgers, and Customer Measurement Profiles.

```
┌──────────────┐         1:N          ┌──────────────┐         1:N          ┌───────────────────┐
│     User     ├─────────────────────►│   Address    │                      │  ProductVariant   │
└──────┬───────┘                      └──────────────┘                      └─────────▲─────────┘
       │                                                                              │
       │ 1:1 (Admin/Designer)                                                         │ 1:N
       ▼                                                                              │
┌──────────────┐         1:N          ┌──────────────┐         1:N          ┌─────────┴─────────┐
│DesignerHouse ├─────────────────────►│   Product    ├─────────────────────►│    MediaRecord    │
└──────┬───────┘                      └──────┬───────┘                      └───────────────────┘
       │                                     │
       │ 1:N                                 │ 1:N
       ▼                                     ▼
┌──────────────┐                      ┌──────────────┐                      ┌───────────────────┐
│    Payout    │                      │  OrderItem   │                      │  ConceptInterest  │
└──────────────┘                      └──────▲───────┘                      └───────────────────┘
                                             │
                                             │ 1:N
                                      ┌──────┴───────┐                      ┌───────────────────┐
                                      │    Order     ├─────────────────────►│   OrderDispute    │
                                      └──────────────┘         1:N          └───────────────────┘
```

---

## 2. Table Specifications

### A. `User`
Stores system accounts for buyers and platform administrators.
- **Fields:** `id` (cuid), `email` (unique string), `name` (string), `role` (`buyer` | `admin` | `designer`), `avatarUrl` (string), `createdAt`, `updatedAt`.
- **Indexes:** Unique index on `email`.
- **Used By:** Auth middleware, buyer account management, admin permission checks.

### B. `DesignerHouse`
Stores brand profile, bank accounts, tax details, and commission configuration.
- **Fields:** `id` (cuid), `name` (string), `handle` (unique string), `bio` (text), `logo` (string), `banner` (string), `location` (string), `signatureTechniques` (string array), `accountStatus` (`active` | `suspended`), `bankBeneficiaryName`, `bankAccountNumber`, `bankIfsc`, `bankName`, `gstin`, `panNumber`, `shippingPincode`, `shippingCity`, `shippingState`, `commissionRate` (float, default 10.0).
- **Indexes:** Unique index on `handle`.
- **Used By:** `AdminHouseSwitcher`, `/admin/designers`, `/designer/[handle]`, payout engine.

### C. `Product`
Stores commercial luxury garments and concept showcase items.
- **Fields:** `id` (cuid), `designerId` (FK), `name`, `description` (text), `category`, `subcategory`, `price` (int, listed retail price in paise), `basePrice` (int), `mrp` (int), `listingType` (`COMMERCIAL` | `CONCEPT_ART`), `conceptCta` (`BESPOKE_INQUIRY` | `EXPRESS_INTEREST`), `estimatedLaunch`, `weightGrams` (int), `netQuantity`, `manufacturerName`, `manufacturerAddress`, `countryOfOrigin`, `sizeChart` (json), `status` (`draft` | `published` | `archived`), `images` (string array).
- **Foreign Keys:** `designerId` $\to$ `DesignerHouse.id`.
- **Indexes:** Full-text search GIN index on `name` and `description`.
- **Used By:** Storefront catalog (`/store`), PDP (`/product/[id]`), `AdminInventoryStudio`.

### D. `ProductVariant`
Per-Size $\times$ per-Color inventory stock control.
- **Fields:** `id` (cuid), `productId` (FK), `size` (string), `color` (string), `sku` (unique string), `stock` (int, default 0).
- **Constraints:** Unique composite constraint on `[productId, size, color]`.
- **Used By:** Inventory Studio (`/admin/inventory`), size selector on PDP, stock locking.

### E. `MediaRecord`
Metadata for images and short videos linked to products, posts, or designer branding.
- **Fields:** `id` (cuid), `ownerType` (`product` | `designer` | `post` | `story`), `type` (`image` | `video`), `cloudinaryPublicId` (string), `secureUrl` (string), `width`, `height`, `bytes`, `format`, `displayOrder` (int), `productId` (FK), `designerId` (FK).
- **Used By:** Fail-safe media upload stream (`/api/dashboard/products/[id]/media/upload`).

### F. `Order`
Multi-vendor sub-order records generated per designer house.
- **Fields:** `id` (cuid), `parentPaymentId` (FK), `designerId` (FK), `userId` (FK), `status` (`paid` | `confirmed` | `processing` | `shipped` | `delivered` | `cancelled` | `disputed`), `subtotal` (int), `baseGarmentPrice` (int), `builtInShippingFee` (int), `platformCommission` (int, 10%), `gstAmount` (int, 12%), `prepaidDiscountShare` (int), `tcsDeducted` (int, 1%), `designerNetPayable` (int), `courierName`, `trackingNumber`, `trackingUrl`, `shippedAt`, `deliveredAt`.
- **Used By:** Checkout split engine (`/api/webhooks/razorpay`), Admin Dispatch Desk (`/admin/orders`), Buyer visual order timeline (`/orders/[id]`).

### G. `Payout`
Bi-monthly payout ledger records for 1st and 15th net banking disbursements.
- **Fields:** `id` (cuid), `designerId` (FK), `payoutPeriodStart`, `payoutPeriodEnd`, `grossSales`, `totalCommission`, `totalCommissionGst`, `totalTcsDeducted`, `netAmount`, `status` (`pending` | `completed`), `bankUtrNumber` (string), `paidAt`.
- **Used By:** Admin Payout Ledger (`/admin/payouts`), NEFT CSV exporter.

### H. `MeasurementProfile`
Customer saved custom body measurements.
- **Fields:** `id` (cuid), `userId` (FK), `profileName` (string, default "My Default Fit"), `unit` (`inches` | `cm`), `bustChest` (float), `waist` (float), `hips` (float), `shoulder` (float), `armLength` (float), `height` (float), `preferredLength` (float), `isDefault` (boolean).
- **Used By:** PDP Size Recommendation matcher, Concept Art lead capture modal.
