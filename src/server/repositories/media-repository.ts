import { prisma } from "@/server/db";
import {
  toMediaRecord,
  resolveOwnerType,
  typeToKind,
  type CreateMediaInput,
  type MediaRecord,
} from "@/server/types/media";
import type { MediaOwnerType } from "@prisma/client";

const galleryOrder = [
  { displayOrder: "asc" as const },
  { createdAt: "asc" as const },
];

export class MediaRepository {
  async create(input: CreateMediaInput): Promise<MediaRecord> {
    const ownerType = resolveOwnerType(input);
    const row = await prisma.mediaAsset.create({
      data: {
        productId: input.productId ?? null,
        postId: input.postId ?? null,
        designerId: input.designerId ?? null,
        storyId: input.storyId ?? null,
        ownerType,
        kind: typeToKind(input.type),
        publicId: input.cloudinaryPublicId,
        url: input.secureUrl,
        width: input.width ?? null,
        height: input.height ?? null,
        durationMs: input.duration ?? null,
        format: input.format ?? null,
        bytes: input.bytes ?? null,
        folder: input.folder ?? null,
        altText: input.altText ?? null,
        thumbnailUrl: input.thumbnailUrl ?? null,
        displayOrder: input.displayOrder ?? 0,
        uploadedById: input.uploadedById ?? null,
      },
    });
    return toMediaRecord(row);
  }

  async findById(id: string): Promise<MediaRecord | null> {
    const row = await prisma.mediaAsset.findUnique({ where: { id } });
    return row ? toMediaRecord(row) : null;
  }

  async findByProductId(productId: string): Promise<MediaRecord[]> {
    const rows = await prisma.mediaAsset.findMany({
      where: { productId },
      orderBy: galleryOrder,
    });
    return rows.map(toMediaRecord);
  }

  async findByOwner(options: {
    ownerType: MediaOwnerType;
    productId?: string;
    postId?: string;
    designerId?: string;
    storyId?: string;
  }): Promise<MediaRecord[]> {
    const rows = await prisma.mediaAsset.findMany({
      where: {
        ownerType: options.ownerType,
        ...(options.productId ? { productId: options.productId } : {}),
        ...(options.postId ? { postId: options.postId } : {}),
        ...(options.designerId ? { designerId: options.designerId } : {}),
        ...(options.storyId ? { storyId: options.storyId } : {}),
      },
      orderBy: galleryOrder,
    });
    return rows.map(toMediaRecord);
  }

  async deleteById(id: string): Promise<MediaRecord | null> {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) return null;
    const row = await prisma.mediaAsset.delete({ where: { id } });
    return toMediaRecord(row);
  }

  async countByProduct(productId: string) {
    const [images, videos] = await Promise.all([
      prisma.mediaAsset.count({
        where: { productId, kind: "image" },
      }),
      prisma.mediaAsset.count({
        where: { productId, kind: "video" },
      }),
    ]);
    return { images, videos, total: images + videos };
  }

  async setDisplayOrders(
    items: { id: string; displayOrder: number }[]
  ): Promise<void> {
    await prisma.$transaction(
      items.map((item) =>
        prisma.mediaAsset.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );
  }

  async nextDisplayOrder(productId: string): Promise<number> {
    const last = await prisma.mediaAsset.findFirst({
      where: { productId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });
    return (last?.displayOrder ?? -1) + 1;
  }
}
