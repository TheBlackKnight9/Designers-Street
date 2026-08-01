import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

export class LookbookRepository {
  listByDesigner(designerId: string, publishedOnly = true) {
    return prisma.lookbook.findMany({
      where: {
        designerId,
        ...(publishedOnly ? { published: true } : {}),
      },
      include: {
        items: { orderBy: { displayOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findBySlug(designerId: string, slug: string) {
    return prisma.lookbook.findUnique({
      where: { designerId_slug: { designerId, slug } },
      include: {
        items: { orderBy: { displayOrder: "asc" } },
        designer: true,
      },
    });
  }

  create(data: Prisma.LookbookCreateInput) {
    return prisma.lookbook.create({
      data,
      include: { items: true },
    });
  }

  update(id: string, designerId: string, data: Prisma.LookbookUpdateInput) {
    return prisma.lookbook.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  delete(id: string, designerId: string) {
    return prisma.lookbook.deleteMany({
      where: { id, designerId },
    });
  }
}

export class AppointmentRepository {
  listByUser(userId: string) {
    return prisma.appointmentRequest.findMany({
      where: { userId },
      include: { designer: true },
      orderBy: { createdAt: "desc" },
    });
  }

  listByDesigner(designerId: string) {
    return prisma.appointmentRequest.findMany({
      where: { designerId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.appointmentRequest.findUnique({
      where: { id },
      include: { designer: true, user: true },
    });
  }

  create(data: Prisma.AppointmentRequestCreateInput) {
    return prisma.appointmentRequest.create({
      data,
      include: { designer: true },
    });
  }

  updateStatus(
    id: string,
    status: Prisma.AppointmentRequestUpdateInput["status"],
    statusNotes?: string | null
  ) {
    return prisma.appointmentRequest.update({
      where: { id },
      data: { status, statusNotes: statusNotes ?? undefined },
      include: { designer: true, user: true },
    });
  }
}

export class AppointmentSlotRepository {
  listAvailable(designerId: string, date?: string) {
    return prisma.appointmentSlot.findMany({
      where: {
        designerId,
        isAvailable: true,
        ...(date ? { date } : {}),
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  create(data: Prisma.AppointmentSlotCreateInput) {
    return prisma.appointmentSlot.create({ data });
  }

  markBooked(id: string) {
    return prisma.appointmentSlot.update({
      where: { id },
      data: { isAvailable: false },
    });
  }
}

export class BespokeRepository {
  listByUser(userId: string) {
    return prisma.customizationRequest.findMany({
      where: { userId },
      include: { designer: true, product: true, attachments: true, messages: true },
      orderBy: { createdAt: "desc" },
    });
  }

  listByDesigner(designerId: string) {
    return prisma.customizationRequest.findMany({
      where: { designerId },
      include: { user: true, product: true, attachments: true, messages: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.customizationRequest.findUnique({
      where: { id },
      include: { designer: true, product: true, user: true, attachments: true, messages: true },
    });
  }

  create(data: Prisma.CustomizationRequestCreateInput) {
    return prisma.customizationRequest.create({
      data,
      include: { designer: true, product: true, attachments: true, messages: true },
    });
  }

  update(
    id: string,
    data: Prisma.CustomizationRequestUpdateInput
  ) {
    return prisma.customizationRequest.update({
      where: { id },
      data,
      include: { designer: true, product: true, attachments: true, messages: true },
    });
  }
}

export class BespokeMessageRepository {
  listByRequest(requestId: string) {
    return prisma.bespokeMessage.findMany({
      where: { requestId },
      orderBy: { createdAt: "asc" },
    });
  }

  create(data: Prisma.BespokeMessageCreateInput) {
    return prisma.bespokeMessage.create({ data });
  }
}

export class BespokeAttachmentRepository {
  listByRequest(requestId: string) {
    return prisma.bespokeAttachment.findMany({
      where: { requestId },
      orderBy: { createdAt: "desc" },
    });
  }

  create(data: Prisma.BespokeAttachmentCreateInput) {
    return prisma.bespokeAttachment.create({ data });
  }
}
