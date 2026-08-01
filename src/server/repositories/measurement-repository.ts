import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

export class MeasurementRepository {
  async listByUser(userId: string) {
    return prisma.measurementProfile.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async findById(id: string) {
    return prisma.measurementProfile.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.MeasurementProfileCreateInput) {
    if (data.isDefault) {
      await prisma.measurementProfile.updateMany({
        where: { userId: data.user.connect?.id },
        data: { isDefault: false },
      });
    }
    return prisma.measurementProfile.create({ data });
  }

  async update(id: string, userId: string, data: Prisma.MeasurementProfileUpdateInput) {
    if (data.isDefault === true) {
      await prisma.measurementProfile.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.measurementProfile.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    return prisma.measurementProfile.deleteMany({
      where: { id, userId },
    });
  }
}
