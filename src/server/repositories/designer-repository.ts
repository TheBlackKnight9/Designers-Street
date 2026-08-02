import { prisma } from "@/server/db";
import { toDesignerHouse } from "@/server/utils/mappers";
import type { DesignerHouse } from "@/lib/types";
import type { Prisma } from "@prisma/client";

export class DesignerRepository {
  async findAllActive(): Promise<DesignerHouse[]> {
    const rows = await prisma.designerHouse.findMany({
      where: { accountStatus: "active" },
      orderBy: { name: "asc" },
    });
    return rows.map(toDesignerHouse);
  }

  async findById(id: string): Promise<DesignerHouse | null> {
    const row = await prisma.designerHouse.findUnique({ where: { id } });
    return row ? toDesignerHouse(row) : null;
  }

  /**
   * Resolve a designer by URL segment. Canonical priority:
   *  1. handle (exact, case-insensitive)
   *  2. slugified variant of the same string
   *  3. database `id` as a direct fallback
   * Name is intentionally excluded — it is not unique and must not be a URL key.
   */
  async findByHandle(handle: string): Promise<DesignerHouse | null> {
    const decoded = decodeURIComponent(handle).trim();
    const slugified = decoded.toLowerCase().replace(/\s+/g, "-");
    const row = await prisma.designerHouse.findFirst({
      where: {
        OR: [
          { handle: { equals: handle, mode: "insensitive" } },
          { handle: { equals: decoded, mode: "insensitive" } },
          { handle: { equals: slugified, mode: "insensitive" } },
          { id: { equals: handle } },
          { id: { equals: decoded } },
        ],
      },
    });
    return row ? toDesignerHouse(row) : null;
  }

  async findByOwnerUserId(ownerUserId: string) {
    return prisma.designerHouse.findUnique({ where: { ownerUserId } });
  }

  async findRecordById(id: string) {
    return prisma.designerHouse.findUnique({ where: { id } });
  }

  async findRecordByHandle(handle: string) {
    return prisma.designerHouse.findFirst({
      where: { handle: { equals: handle, mode: "insensitive" } },
    });
  }

  async create(input: Prisma.DesignerHouseUncheckedCreateInput) {
    return prisma.designerHouse.create({ data: input });
  }

  async update(id: string, data: Prisma.DesignerHouseUpdateInput) {
    const row = await prisma.designerHouse.update({ where: { id }, data });
    return toDesignerHouse(row);
  }
}
