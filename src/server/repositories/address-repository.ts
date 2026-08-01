import { prisma } from "@/server/db";
import type { Address } from "@prisma/client";

export class AddressRepository {
  async listByUser(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });
  }

  async findById(id: string, userId: string): Promise<Address | null> {
    return prisma.address.findFirst({ where: { id, userId } });
  }

  async create(
    userId: string,
    data: {
      label?: string | null;
      fullName: string;
      phone?: string | null;
      line1: string;
      line2?: string | null;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
      isDefault?: boolean;
    }
  ): Promise<Address> {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const count = await prisma.address.count({ where: { userId } });
    return prisma.address.create({
      data: {
        userId,
        label: data.label ?? null,
        fullName: data.fullName,
        phone: data.phone ?? null,
        line1: data.line1,
        line2: data.line2 ?? null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country ?? "IN",
        isDefault: data.isDefault ?? count === 0,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{
      label: string | null;
      fullName: string;
      phone: string | null;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
    }>
  ): Promise<Address> {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    await prisma.address.updateMany({
      where: { id, userId },
      data,
    });
    const addr = await prisma.address.findFirst({ where: { id, userId } });
    if (!addr) throw new Error("Address not found");
    return addr;
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.address.deleteMany({ where: { id, userId } });
  }
}
