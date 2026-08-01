# Phase 10 Implementation Plan — Atelier & Bespoke Services

**Version Target:** v0.10.0  
**Baseline:** v0.9.0 (Frozen)  
**Status:** Approved with 4 Refinements  
**Objective:** Transform Designer's Street into a luxury fashion atelier where customers can book designer-defined consultation slots (virtual, studio, phone), submit custom garment bespoke requests with named measurement profile versions, engage in bespoke conversation threads, upload inspiration & sketch attachments, and allow designers to manage atelier requests via a designer dashboard.

---

## 1. Refinements Incorporated

1. **`AppointmentSlot` Model**: Designers define available consultation time slots. Customers select from published open slots.
2. **Bespoke Conversation Thread**: `BespokeMessage` history timeline on bespoke requests for updates and client-designer communication.
3. **Multi-Type File Attachments**: `BespokeAttachment` support for inspiration images, sketches, fabric references, and measurement documents.
4. **Named Measurement Profiles & Versions**: Named fit profiles (e.g. *Standard*, *Wedding*, *Winter Fit*, *Custom Tailoring*) with a default profile flag (`isDefault`).

---

## 2. Database Schema Additions (`prisma/schema.prisma`)

```prisma
enum AppointmentType {
  virtual
  studio_visit
  phone
}

enum BespokeStatus {
  draft
  submitted
  under_review
  accepted
  in_production
  ready
  delivered
  cancelled
}

enum AttachmentType {
  inspiration_image
  sketch
  fabric_reference
  measurement_document
}

model AppointmentSlot {
  id          String          @id @default(cuid())
  designerId  String          @map("designer_id")
  date        String          // YYYY-MM-DD
  startTime   String          @map("start_time") // HH:mm
  endTime     String          @map("end_time")   // HH:mm
  type        AppointmentType @default(virtual)
  isAvailable Boolean         @default(true) @map("is_available")
  createdAt   DateTime        @default(now()) @map("created_at")

  designer     DesignerHouse       @relation(fields: [designerId], references: [id], onDelete: Cascade)
  appointments AppointmentRequest[]

  @@index([designerId, date, isAvailable])
  @@map("appointment_slots")
}

model MeasurementProfile {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  name      String   @default("Standard Fit")
  isDefault Boolean  @default(false) @map("is_default")
  unit      String   @default("inches")
  height    Float?
  chest     Float?
  waist     Float?
  hip       Float?
  shoulder  Float?
  sleeve    Float?
  inseam    Float?
  neck      Float?
  notes     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("measurement_profiles")
}

model BespokeAttachment {
  id        String         @id @default(cuid())
  requestId String         @map("request_id")
  url       String
  title     String?
  type      AttachmentType @default(inspiration_image)
  createdAt DateTime       @default(now()) @map("created_at")

  request CustomizationRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@index([requestId])
  @@map("bespoke_attachments")
}

model BespokeMessage {
  id         String   @id @default(cuid())
  requestId  String   @map("request_id")
  senderId   String   @map("sender_id")
  senderRole String   // "buyer" | "designer" | "system"
  message    String
  createdAt  DateTime @default(now()) @map("created_at")

  request CustomizationRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@index([requestId, createdAt])
  @@map("bespoke_messages")
}
```

*Note: Update `AppointmentRequest` and `CustomizationRequest` to link slots, messages, and attachments.*

---

## 3. Repositories & Services (`src/server/`)

- **`MeasurementRepository` & `MeasurementService`**: CRUD for named measurement profiles and default setting.
- **`AppointmentRepository` & `AppointmentService`**: Slot creation by designers, available slot listing, appointment booking, status transitions, and notification dispatch.
- **`BespokeRepository` & `BespokeService`**: Request submission, status transitions, conversation thread (`BespokeMessage`), file attachment management (`BespokeAttachment`), and designer notes.

---

## 4. API Endpoints (`src/app/api/`)

### Appointments & Slots
- `GET/POST /api/appointments/slots`: List available slots for a designer / create slot (designer).
- `GET/POST /api/appointments`: List appointments / book slot.
- `PATCH /api/appointments/[id]`: Update status (accept, cancel, complete).

### Bespoke Requests & Threads
- `GET/POST /api/bespoke`: List bespoke requests / create request with attachments & profile.
- `GET/PATCH /api/bespoke/[id]`: Get details / update status.
- `GET/POST /api/bespoke/[id]/messages`: Fetch message thread / send message.
- `POST /api/bespoke/[id]/attachments`: Add attachment.

### Measurement Profiles
- `GET/POST /api/account/measurements`: List/create fit profiles.
- `PUT/DELETE /api/account/measurements/[id]`: Update/delete fit profile.

---

## 5. UI Components & Pages

### Reused Systems
- **`NotificationService`**: Real-time alerts on slot booking, status updates, and messages.
- **`MediaViewer` / Upload API**: Handlers for attachment previews.
- **`TopBar` & `BottomNav`**: Persistent navigation.

### Components (`src/components/atelier/`)
- `SlotPicker.tsx`: Calendar & time slot selector.
- `BespokeConversationThread.tsx`: Client-designer chat & activity log.
- `AttachmentUploader.tsx`: Multi-file upload for sketches & fabric samples.
- `MeasurementProfileCard.tsx`: Profile selector & editor.

### Pages & Dashboards
- **`/account/atelier`**: Customer dashboard for tracking bespoke requests, appointments, fit profiles, and message threads.
- **`/dashboard/atelier`**: Designer dashboard for managing availability slots, reviewing bespoke requests, accepting/rejecting, and updating statuses.
- **`/appointments/book`**: Customer slot booking page.
- **`/bespoke/request`**: Customer multi-step bespoke request creator.

---

## 6. Rollout & Verification

1. Add Prisma models & run `npx prisma generate`.
2. Implement backend repositories, services, demo fallback (`phase10-demo.ts`), and API routes.
3. Build client API façade (`src/lib/api/atelier.ts`) & custom hooks (`src/hooks/useAtelier.ts`).
4. Build UI components, customer dashboard, and designer dashboard.
5. Verification: `npx tsc --noEmit` & `npm run build`.
6. Generate documentation: `docs/phase-10.md`, `docs/phase-10-report.md`, `docs/phase-10-final-qa.md`, `docs/releases/v0.10.0.md`.
