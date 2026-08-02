# 06 — API Endpoint Specification

## 1. Authentication & System APIs

### `GET /api/auth/me`
- **Description:** Resolves active Supabase user session and returns Prisma database record with role information.
- **Auth:** Optional (returns `{ user: null }` if unauthenticated).
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "user": { "id": "usr_123", "email": "buyer@example.com", "name": "Priya Sharma", "role": "buyer" }
    }
  }
  ```

---

## 2. Storefront & Catalog APIs

### `GET /api/designers`
- **Description:** Returns active Designer Houses for the public directory (`/designers`).
- **Auth:** Public.
- **Query Params:** `?search=jaipur`, `?category=bridal`.
- **Response:** List of houses with logo, banner, location, signature techniques, product count, and top 3 featured items.

### `GET /api/storefront/products`
- **Description:** Search and filter catalog items for the public store (`/store`).
- **Auth:** Public.
- **Query Params:** `?search=`, `?category=`, `?listingType=COMMERCIAL`, `?minPrice=`, `?maxPrice=`, `?sort=newest`.
- **Response:** List of products with images, price, basePrice, and `listingType`.

### `GET /api/storefront/products/[id]`
- **Description:** Returns full product details for PDP (`/product/[id]`).
- **Auth:** Public.
- **Response:** Product record with size variants, gallery media, size chart, Legal Metrology details, and verified reviews.

---

## 3. Admin Command Center APIs

### `GET /api/admin/designers`
- **Description:** Returns all Designer Houses for the Admin House Switcher and `/admin/designers`.
- **Auth:** Required (`User.role === 'admin'`).
- **Response:** List of all active/suspended houses with bank details, GSTIN, PAN, and total order counts.

### `POST /api/admin/designers`
- **Description:** Manually creates a new Designer House.
- **Auth:** Required (`User.role === 'admin'`).
- **Request Body:** `{ name, handle, bio, logo, banner, state, city, bankBeneficiary, bankAccount, bankIfsc, bankName, gstin, pan, shippingPincode, commissionRate }`.

### `POST /api/dashboard/products/[id]/media/upload`
- **Description:** Fail-safe server-side upload stream to Cloudinary with automatic Base64 DB fallback.
- **Auth:** Required (`User.role === 'admin'`).
- **Request Body:** `FormData` containing `file`.
- **Response:** Updated product object with newly registered media record.

---

## 4. Checkout & Commerce APIs

### `POST /api/checkout/create-order`
- **Description:** Creates Razorpay Order with -₹100 online prepaid payment discount.
- **Auth:** Required (`User.role === 'buyer'`).
- **Request Body:** `{ items: [{ productId, variantId, quantity }], shippingAddress: { ... } }`.
- **Response:** `{ razorpayOrderId, amountInPaise, keyId }`.

### `POST /api/webhooks/razorpay`
- **Description:** Razorpay payment captured webhook processor.
- **Auth:** Webhook HMAC Signature (`x-razorpay-signature`).
- **Logic:**
  1. Verifies payment capture signature.
  2. Splits cart into $N$ per-designer sub-orders sharing `parentPaymentId`.
  3. Calculates pro-rata ₹100 prepaid discount share per designer.
  4. Saves complete financial accounting snapshot (Subtotal, Base Price, Shipping, 10% Platform Fee, 12% GST, 1% TCS).
  5. Permanently decrements variant stock.
  6. Triggers MSG91 SMS notifications.

---

## 5. Payouts & Invoices

### `GET /api/orders/[id]/invoice`
- **Description:** Generates downloadable GST-compliant PDF invoice.
- **Auth:** Required (Order owner or Admin).
- **Response:** PDF binary download (`Content-Type: application/pdf`).

### `POST /api/admin/payouts/export-neft`
- **Description:** Generates bank-formatted NEFT CSV export for 1st & 15th payouts.
- **Auth:** Required (`User.role === 'admin'`).
- **Response:** CSV file download (`Content-Type: text/csv`).
