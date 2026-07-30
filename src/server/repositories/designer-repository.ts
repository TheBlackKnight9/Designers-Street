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

  async findByHandle(handle: string): Promise<DesignerHouse | null> {
    const row = await prisma.designerHouse.findFirst({
      where: { handle: { equals: handle, mode: "insensitive" } },
    });
    return row ? toDesignerHouse(row) : null;
  }

  async findByOwnerUserId(ownerUserId: string) {
    return prisma.designerHouse.findUnique({ where: { ownerUserId } });
  }

  async update(id: string, data: Prisma.DesignerHouseUpdateInput) {
    const row = await prisma.designerHouse.update({ where: { id }, data });
    return toDesignerHouse(row);
  }
}
