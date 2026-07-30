import { prisma } from "@/server/db";
import { toDesignerHouse } from "@/server/utils/mappers";
import type { DesignerHouse } from "@/lib/types";

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
}
