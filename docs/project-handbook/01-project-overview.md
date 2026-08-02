# 01 — Project Overview & Business Model

## 1. Executive Summary

**Designers Street** is an exclusive digital marketplace connecting discerning fashion connoisseurs with premier Indian luxury designer houses (Ateliers).

The platform bridges the gap between traditional Indian haute couture ateliers—celebrated for handcrafted Zardozi, Marodi, Chikankari, and handloom craftsmanship—and modern digital consumers globally.

---

## 2. Problem Statement

1. **High Friction for Independent Designers:** Premier boutique ateliers in cities like Jaipur, Delhi, and Mumbai lack the dedicated technical teams needed to manage complex e-commerce platforms, payment gateways, and inventory systems.
2. **Fragmented Luxury Discovery:** Consumers seeking authentic designer garments must navigate disparate social media feeds, unstructured WhatsApp catalogs, or legacy uncurated marketplaces lacking luxury aesthetics.
3. **Lack of Digital Prototype Validation:** Designers frequently produce digital sketches or runway samples without a direct, low-risk way to gauge customer interest or collect custom bespoke inquiries prior to manufacturing.

---

## 3. Vision & Product Strategy

Designers Street resolves these challenges through an **Admin-Managed Luxury Marketplace Engine**:
- **Curated Storefront & Social Commerce:** High-resolution video feed, multi-slide campaign stories, and clickable product hotspot tags.
- **Dual Product Listing Architecture:**
  - **Commercial Garments (`COMMERCIAL`):** Physical buyable luxury garments with size variants, stock control, all-inclusive pricing, and **Free Shipping**.
  - **Concept Showcase (`CONCEPT_ART`):** Runway previews and digital sketches featuring a **"Request Bespoke Quote"** CTA and custom body measurement integration.
- **Admin-Managed Model:** A 3-person platform team centrally manages all designer houses, product catalogs, feed posts, order fulfillment, and bi-monthly NEFT payouts.

---

## 4. Marketplace & Operating Model

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                      DESIGNERS STREET MARKETPLACE                       │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
┌─────────────────────┐                               ┌─────────────────────┐
│  CUSTOMER (BUYER)   │                               │    ADMIN (TEAM)     │
├─────────────────────┤                               ├─────────────────────┤
│ • Browse Storefront │                               │ • Multi-House Admin │
│ • Search 36 States  │                               │   Switcher Bar      │
│ • Saved Addresses   │                               │ • Manage Catalogs   │
│ • Saved Measurements│                               │ • Server Uploads    │
│ • Checkout (₹100    │                               │ • Order Dispatch    │
│   Prepaid Discount) │                               │ • Manual NEFT Bank  │
│ • Order Timeline &  │                               │   Payouts (1st/15th)│
│   SMS Updates       │                               │ • Concept Lead Desk │
└─────────────────────┘                               └─────────────────────┘
```

### Commercial Financial Model:
- **Platform Commission:** Flat **10%** calculated on the Base Garment Price.
- **Delivery Model:** **"FREE SHIPPING"** across the storefront. Shipping fees are auto-calculated from item weight and built directly into the listed retail price.
- **Prepaid Payment Discount:** **-₹100 Instant Discount** on all online prepaid checkouts (Razorpay UPI, Cards, Net Banking).
- **GST TCS Deduction:** **1%** collected under Section 52 of the Central Goods and Services Tax Act.
- **Seller Payout Schedule:** **Bi-monthly** (1st and 15th of every month) via manual corporate net banking (NEFT/IMPS) with downloadable bank CSV exports and UTR tracking.

---

## 5. End-to-End User Journeys

### Customer Journey:
1. Customer lands on home page (`/`), views hero collection banners, featured designer houses, and campaign stories.
2. Browses the Designer Directory (`/designers`), filters by State/City or signature technique (*Zardozi*, *Block Print*).
3. Views Product Detail Page (`/product/[id]`). For buyable garments, observes **"FREE SHIPPING"**, personalized size match recommendation based on saved measurement profile (`/profile/measurements`), and Size Guide drawer.
4. For Concept Showcase items (`CONCEPT_ART`), clicks *"Request Bespoke Quote"* to open the lead capture modal, attaching custom measurements.
5. Adds garment to cart (`/cart`) $\to$ Proceeds to checkout (`/checkout`) $\to$ Selects saved address (36 States & UTs dropdowns) $\to$ Sees ₹100 Instant Prepaid Discount banner $\to$ Completes Razorpay online payment.
6. Receives MSG91 SMS confirmation $\to$ Tracks visual order timeline (`/orders/[id]`) $\to$ Downloads GST Invoice PDF.

### Admin Journey:
1. Admin logs into platform panel (`/admin`), greeted by the sticky **Admin House Switcher Bar**.
2. Admin selects an active house (e.g. *Vasavi Atelier*).
3. Navigates to `/admin/products` $\to$ Enters Base Garment Price $\to$ Pricing calculator automatically computes GST (12%), Built-in Shipping, 10% Platform Fee, and Listed Retail Price.
4. Uploads product images using server-side fail-safe uploader (Cloudinary + Base64 DB fallback).
5. Publishes feed media (`/admin/posts`) and multi-slide stories (`/admin/stories`) on behalf of the selected house.
6. Manages order dispatch (`/admin/orders`) $\to$ Enters courier tracking number (BlueDart, DTDC, Delhivery) $\to$ Triggers customer SMS.
7. On 1st & 15th, opens Payout Ledger (`/admin/payouts`) $\to$ Exports NEFT Bank CSV $\to$ Executes bank transfer $\to$ Inputs UTR reference number to mark payout `Completed`.

---

## 6. Current Phase & Version Status

- **Current Version:** `1.0.0-production`
- **Current Phase:** Phase 12+ (Production Engine complete with 100/100 compiled routes).
- **Core Role Modes:** 2 Active Roles (`buyer` and `admin`). Self-serve designer signup/login is disabled.
