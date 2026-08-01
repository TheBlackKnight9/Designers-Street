import {
  AppointmentRepository,
  BespokeRepository,
  LookbookRepository,
  AppointmentSlotRepository,
  BespokeMessageRepository,
  BespokeAttachmentRepository,
} from "@/server/repositories/luxury-repository";
import { NotificationService } from "@/server/services/notification-service";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/errors";
import { requireString } from "@/server/utils/validation";
import {
  DEMO_LOOKBOOKS,
  getLookbookBySlug,
  getLookbooksByDesigner,
} from "@/lib/phase8-demo";
import {
  DEMO_APPOINTMENT_REQUESTS,
  DEMO_APPOINTMENT_SLOTS,
  DEMO_BESPOKE_REQUESTS,
} from "@/lib/phase10-demo";
import type { AppointmentStatus, CustomizationStatus } from "@prisma/client";

function requireDb() {
  if (!isDatabaseEnabled()) {
    throw new ValidationError("This feature requires USE_DATABASE=true");
  }
}

export class LookbookService {
  constructor(private readonly lookbooks = new LookbookRepository()) {}

  async listByDesigner(designerId: string) {
    if (!isDatabaseEnabled()) {
      return getLookbooksByDesigner(designerId);
    }
    const rows = await this.lookbooks.listByDesigner(designerId);
    if (rows.length) {
      return rows.map((r) => ({
        id: r.id,
        designerId: r.designerId,
        title: r.title,
        slug: r.slug,
        kind: r.kind as "seasonal" | "collection" | "campaign" | "editorial",
        season: r.season ?? undefined,
        coverImage: r.coverImage,
        description: r.description ?? undefined,
        items: r.items.map((i) => ({
          id: i.id,
          mediaUrl: i.mediaUrl,
          mediaKind: i.mediaKind as "image" | "video",
          caption: i.caption ?? undefined,
          productId: i.productId ?? undefined,
        })),
      }));
    }
    return getLookbooksByDesigner(designerId);
  }

  async getBySlug(designerId: string, slug: string) {
    if (!isDatabaseEnabled()) {
      const lb = getLookbookBySlug(designerId, slug);
      if (!lb) throw new NotFoundError("Lookbook not found");
      return lb;
    }
    const row = await this.lookbooks.findBySlug(designerId, slug);
    if (row) {
      return {
        id: row.id,
        designerId: row.designerId,
        title: row.title,
        slug: row.slug,
        kind: row.kind as "seasonal" | "collection" | "campaign" | "editorial",
        season: row.season ?? undefined,
        coverImage: row.coverImage,
        description: row.description ?? undefined,
        items: row.items.map((i) => ({
          id: i.id,
          mediaUrl: i.mediaUrl,
          mediaKind: i.mediaKind as "image" | "video",
          caption: i.caption ?? undefined,
          productId: i.productId ?? undefined,
        })),
      };
    }
    const fallback = getLookbookBySlug(designerId, slug);
    if (!fallback) throw new NotFoundError("Lookbook not found");
    return fallback;
  }

  async ensureDemoSeed() {
    if (!isDatabaseEnabled()) return;
    for (const lb of DEMO_LOOKBOOKS) {
      const exists = await prisma.lookbook.findUnique({
        where: {
          designerId_slug: { designerId: lb.designerId, slug: lb.slug },
        },
      });
      if (exists) continue;
      const designer = await prisma.designerHouse.findUnique({
        where: { id: lb.designerId },
      });
      if (!designer) continue;
      await prisma.lookbook.create({
        data: {
          id: lb.id,
          designerId: lb.designerId,
          title: lb.title,
          slug: lb.slug,
          kind: lb.kind,
          season: lb.season,
          coverImage: lb.coverImage,
          description: lb.description,
          items: {
            create: lb.items.map((item, i) => ({
              id: item.id,
              mediaUrl: item.mediaUrl,
              mediaKind: item.mediaKind,
              caption: item.caption,
              productId: item.productId,
              displayOrder: i,
            })),
          },
        },
      });
    }
  }
}

export class AppointmentService {
  constructor(
    private readonly appointments = new AppointmentRepository(),
    private readonly slots = new AppointmentSlotRepository(),
    private readonly notifications = new NotificationService()
  ) {}

  async listSlots(designerId: string, date?: string) {
    if (!isDatabaseEnabled()) {
      return DEMO_APPOINTMENT_SLOTS.filter(
        (s) => s.designerId === designerId && (!date || s.date === date)
      );
    }
    return this.slots.listAvailable(designerId, date);
  }

  async createSlot(designerId: string, input: { date: string; startTime: string; endTime: string; type?: any }) {
    if (!isDatabaseEnabled()) {
      const slot = {
        id: `slot-${Date.now()}`,
        designerId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        type: input.type || "virtual",
        isAvailable: true,
      };
      DEMO_APPOINTMENT_SLOTS.push(slot);
      return slot;
    }
    return this.slots.create({
      designer: { connect: { id: designerId } },
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      type: input.type || "virtual",
    });
  }

  async listMine(userId: string) {
    if (!isDatabaseEnabled()) {
      return DEMO_APPOINTMENT_REQUESTS.filter((a) => a.userId === userId || userId === "usr-1");
    }
    return this.appointments.listByUser(userId);
  }

  async listForDesigner(designerId: string) {
    if (!isDatabaseEnabled()) {
      return DEMO_APPOINTMENT_REQUESTS.filter((a) => a.designerId === designerId || designerId === "dh-1");
    }
    return this.appointments.listByDesigner(designerId);
  }

  async create(
    userId: string,
    input: {
      designerId: string;
      slotId?: string;
      preferredDate: string;
      preferredTime: string;
      appointmentType?: "virtual" | "studio_visit" | "phone";
      purpose: string;
      message?: string;
    }
  ) {
    if (!isDatabaseEnabled()) {
      const created: any = {
        id: `app-${Date.now()}`,
        userId,
        userName: "Aria Dev",
        designerId: input.designerId,
        designerName: "Maison Residency",
        slotId: input.slotId,
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime,
        appointmentType: input.appointmentType || "virtual",
        purpose: input.purpose,
        message: input.message,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      DEMO_APPOINTMENT_REQUESTS.unshift(created);
      return created;
    }

    const designerId = requireString(input.designerId, "designerId");
    const preferredDate = requireString(input.preferredDate, "preferredDate");
    const preferredTime = requireString(input.preferredTime, "preferredTime");
    const purpose = requireString(input.purpose, "purpose");

    const designer = await prisma.designerHouse.findUnique({
      where: { id: designerId },
    });
    if (!designer) throw new NotFoundError("Designer not found");

    if (input.slotId) {
      await this.slots.markBooked(input.slotId);
    }

    const row = await this.appointments.create({
      user: { connect: { id: userId } },
      designer: { connect: { id: designerId } },
      ...(input.slotId ? { slot: { connect: { id: input.slotId } } } : {}),
      preferredDate,
      preferredTime,
      appointmentType: (input.appointmentType as any) || "virtual",
      purpose,
      message: input.message?.trim() || null,
      status: "pending",
    });

    await this.notifications.notifyAppointmentRequested(
      userId,
      designerId,
      row.id,
      designer.name
    );
    if (designer.ownerUserId) {
      await this.notifications.notifyDesignerAppointment(
        designer.ownerUserId,
        designerId,
        row.id
      );
    }

    return row;
  }

  async updateStatus(
    actorUserId: string,
    appointmentId: string,
    status: AppointmentStatus,
    statusNotes?: string
  ) {
    if (!isDatabaseEnabled()) {
      const found = DEMO_APPOINTMENT_REQUESTS.find((a) => a.id === appointmentId);
      if (found) {
        found.status = status as any;
        found.statusNotes = statusNotes;
      }
      return found;
    }

    const row = await this.appointments.findById(appointmentId);
    if (!row) throw new NotFoundError("Appointment not found");

    const updated = await this.appointments.updateStatus(
      appointmentId,
      status,
      statusNotes ?? null
    );
    await this.notifications.notifyAppointmentStatus(
      row.userId,
      row.designerId,
      appointmentId,
      status
    );
    return updated;
  }
}

export class BespokeService {
  constructor(
    private readonly requests = new BespokeRepository(),
    private readonly messages = new BespokeMessageRepository(),
    private readonly attachments = new BespokeAttachmentRepository(),
    private readonly notifications = new NotificationService()
  ) {}

  async listMine(userId: string) {
    if (!isDatabaseEnabled()) {
      return DEMO_BESPOKE_REQUESTS.filter((r) => r.userId === userId || userId === "usr-1");
    }
    return this.requests.listByUser(userId);
  }

  async listForDesigner(designerId: string) {
    if (!isDatabaseEnabled()) {
      return DEMO_BESPOKE_REQUESTS.filter((r) => r.designerId === designerId || designerId === "dh-1");
    }
    return this.requests.listByDesigner(designerId);
  }

  async getById(id: string) {
    if (!isDatabaseEnabled()) {
      const found = DEMO_BESPOKE_REQUESTS.find((r) => r.id === id);
      if (!found) throw new NotFoundError("Bespoke request not found");
      return found;
    }
    const row = await this.requests.findById(id);
    if (!row) throw new NotFoundError("Bespoke request not found");
    return row;
  }

  async create(
    userId: string,
    input: {
      designerId?: string;
      productId?: string;
      category?: string;
      occasion?: string;
      budget?: number;
      deadline?: string;
      notes?: string;
      measurementProfileId?: string;
      measurements?: Record<string, any>;
      referenceImages?: string[];
    }
  ) {
    if (!isDatabaseEnabled()) {
      const created: any = {
        id: `bespoke-${Date.now()}`,
        userId,
        userName: "Aria Dev",
        designerId: input.designerId || "dh-1",
        designerName: "MAISON RIVIÈRE",
        productId: input.productId,
        category: input.category || "Custom Garment",
        occasion: input.occasion || "Couture Gala",
        budget: input.budget || 250000,
        deadline: input.deadline,
        notes: input.notes,
        measurementProfileId: input.measurementProfileId,
        measurements: input.measurements || {},
        referenceImages: input.referenceImages || [],
        attachments: [],
        messages: [
          {
            id: `msg-${Date.now()}`,
            requestId: `bespoke-${Date.now()}`,
            senderId: userId,
            senderRole: "buyer",
            senderName: "Aria Dev",
            message: input.notes || "Bespoke request submitted.",
            createdAt: new Date().toISOString(),
          },
        ],
        status: "submitted",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      DEMO_BESPOKE_REQUESTS.unshift(created);
      return created;
    }

    let designerId = input.designerId;
    if (!designerId && input.productId) {
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
      });
      if (!product) throw new NotFoundError("Product not found");
      designerId = product.designerId;
    }

    const row = await this.requests.create({
      user: { connect: { id: userId } },
      ...(designerId ? { designer: { connect: { id: designerId } } } : {}),
      ...(input.productId ? { product: { connect: { id: input.productId } } } : {}),
      fabric: input.category?.trim() || null,
      occasion: input.occasion?.trim() || null,
      budget: input.budget ?? null,
      notes: input.notes?.trim() || null,
      measurements: input.measurements ?? undefined,
      referenceImages: input.referenceImages ?? [],
      status: "submitted",
    });

    await this.notifications.notifyBespokeSubmitted(userId, designerId ?? null, row.id);

    return row;
  }

  async updateStatus(
    actorUserId: string,
    requestId: string,
    status: CustomizationStatus,
    statusNotes?: string
  ) {
    if (!isDatabaseEnabled()) {
      const found = DEMO_BESPOKE_REQUESTS.find((r) => r.id === requestId);
      if (found) {
        found.status = status as any;
        found.statusNotes = statusNotes;
      }
      return found;
    }

    const row = await this.requests.findById(requestId);
    if (!row) throw new NotFoundError("Request not found");

    const updated = await this.requests.update(requestId, {
      status,
      statusNotes: statusNotes?.trim() || null,
    });

    if (row.userId) {
      await this.notifications.notifyBespokeStatus(
        row.userId,
        row.designerId,
        requestId,
        status
      );
    }
    return updated;
  }

  async addMessage(requestId: string, senderId: string, senderRole: "buyer" | "designer" | "system", message: string) {
    if (!isDatabaseEnabled()) {
      const req = DEMO_BESPOKE_REQUESTS.find((r) => r.id === requestId);
      const newMsg = {
        id: `msg-${Date.now()}`,
        requestId,
        senderId,
        senderRole,
        senderName: senderRole === "buyer" ? "Client" : "Master Weaver",
        message,
        createdAt: new Date().toISOString(),
      };
      if (req) {
        req.messages = req.messages || [];
        req.messages.push(newMsg);
      }
      return newMsg;
    }

    return this.messages.create({
      request: { connect: { id: requestId } },
      senderId,
      senderRole,
      message,
    });
  }

  async addAttachment(requestId: string, url: string, title?: string, type: any = "inspiration_image") {
    if (!isDatabaseEnabled()) {
      const req = DEMO_BESPOKE_REQUESTS.find((r) => r.id === requestId);
      const newAtt = {
        id: `att-${Date.now()}`,
        requestId,
        url,
        title,
        type,
        createdAt: new Date().toISOString(),
      };
      if (req) {
        req.attachments = req.attachments || [];
        req.attachments.push(newAtt);
      }
      return newAtt;
    }

    return this.attachments.create({
      request: { connect: { id: requestId } },
      url,
      title: title || null,
      type,
    });
  }
}
