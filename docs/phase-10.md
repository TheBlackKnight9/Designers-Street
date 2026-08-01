# Phase 10: Atelier & Bespoke Services (v0.10.0)

## Overview
Phase 10 transforms **Designer's Street** from a luxury editorial marketplace into an exclusive fashion atelier where customers can directly request bespoke garments, manage fit profiles, book private consultation appointments with master weavers, and interact in real-time conversation threads with designer houses.

---

## Technical Architecture & Invariants
- **Layering Order**: `Prisma Database → Repositories → Services → API Handlers → Client API Façade / Hooks → Composable Atelier UI`.
- **Dual-Mode System**:
  - `USE_DATABASE=true`: Uses Prisma & PostgreSQL persistence for `AppointmentSlot`, `MeasurementProfile`, `CustomizationRequest`, `BespokeMessage`, and `BespokeAttachment`.
  - `USE_DATABASE=false`: Uses `src/lib/phase10-demo.ts` in-memory fallback datasets.
- **Context Isolation Rules**: Storefront pages use `useStorefrontCatalog` / `useAtelier` and never call admin-only context functions.

---

## Data Models Extended

### 1. `MeasurementProfile`
Allows buyers to store multiple named measurement profiles (e.g. *Bridal Fit '26*, *Winter Gala Suit*) with chest, waist, hip, shoulder, sleeve, inseam, height, and neck measurements.
- Fields: `id`, `userId`, `name`, `isDefault`, `unit`, `height`, `chest`, `waist`, `hip`, `shoulder`, `sleeve`, `inseam`, `neck`, `notes`.

### 2. `AppointmentSlot`
Enables designer houses to publish available virtual, studio visit, or phone consultation slots.
- Fields: `id`, `designerId`, `date`, `startTime`, `endTime`, `type`, `isAvailable`.

### 3. `AppointmentRequest`
Linked to `AppointmentSlot` with appointment status tracking (`pending`, `confirmed`, `completed`, `cancelled`).

### 4. `BespokeMessage`
Conversation history timeline on custom garment requests for client-atelier messaging.
- Fields: `id`, `requestId`, `senderId`, `senderRole`, `senderName`, `message`, `createdAt`.

### 5. `BespokeAttachment`
Multi-file support for inspiration images, sketches, fabric swatches, and measurement documents.

---

## Routes & Views
- **Customer Atelier Portal**: `/account/atelier`
- **Designer Atelier Portal**: `/dashboard/atelier`
- **Book Consultation**: `/appointments/book`
- **Submit Bespoke Request**: `/bespoke/request`
- **API Routes**:
  - `/api/appointments` (GET, POST)
  - `/api/appointments/slots` (GET, POST)
  - `/api/appointments/[id]` (PATCH)
  - `/api/bespoke` (GET, POST)
  - `/api/bespoke/[id]` (GET, PATCH)
  - `/api/bespoke/[id]/messages` (POST)
  - `/api/account/measurements` (GET, POST)
  - `/api/account/measurements/[id]` (DELETE)
