import { MeasurementRepository } from "@/server/repositories/measurement-repository";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";
import { DEMO_MEASUREMENT_PROFILES } from "@/lib/phase10-demo";
import type { MeasurementProfileData } from "@/lib/types";

export class MeasurementService {
  constructor(private readonly repo = new MeasurementRepository()) {}

  async listByUser(userId: string): Promise<MeasurementProfileData[]> {
    if (!isDatabaseEnabled()) {
      return DEMO_MEASUREMENT_PROFILES.filter((p) => p.userId === userId || userId === "usr-1");
    }
    const rows = await this.repo.listByUser(userId);
    if (!rows.length) {
      return DEMO_MEASUREMENT_PROFILES;
    }
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      isDefault: r.isDefault,
      unit: (r.unit as "inches" | "cm") || "inches",
      height: r.height ?? undefined,
      chest: r.chest ?? undefined,
      waist: r.waist ?? undefined,
      hip: r.hip ?? undefined,
      shoulder: r.shoulder ?? undefined,
      sleeve: r.sleeve ?? undefined,
      inseam: r.inseam ?? undefined,
      neck: r.neck ?? undefined,
      notes: r.notes ?? undefined,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async create(userId: string, input: Partial<MeasurementProfileData>): Promise<MeasurementProfileData> {
    if (!isDatabaseEnabled()) {
      const newProf: MeasurementProfileData = {
        id: `mp-${Date.now()}`,
        userId,
        name: input.name || "Custom Fit",
        isDefault: !!input.isDefault,
        unit: input.unit || "inches",
        height: input.height,
        chest: input.chest,
        waist: input.waist,
        hip: input.hip,
        shoulder: input.shoulder,
        sleeve: input.sleeve,
        inseam: input.inseam,
        neck: input.neck,
        notes: input.notes,
        createdAt: new Date().toISOString(),
      };
      DEMO_MEASUREMENT_PROFILES.unshift(newProf);
      return newProf;
    }

    if (!input.name) throw new ValidationError("Measurement profile name is required");

    const row = await this.repo.create({
      user: { connect: { id: userId } },
      name: input.name,
      isDefault: !!input.isDefault,
      unit: input.unit || "inches",
      height: input.height,
      chest: input.chest,
      waist: input.waist,
      hip: input.hip,
      shoulder: input.shoulder,
      sleeve: input.sleeve,
      inseam: input.inseam,
      neck: input.neck,
      notes: input.notes,
    });

    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      isDefault: row.isDefault,
      unit: (row.unit as "inches" | "cm") || "inches",
      height: row.height ?? undefined,
      chest: row.chest ?? undefined,
      waist: row.waist ?? undefined,
      hip: row.hip ?? undefined,
      shoulder: row.shoulder ?? undefined,
      sleeve: row.sleeve ?? undefined,
      inseam: row.inseam ?? undefined,
      neck: row.neck ?? undefined,
      notes: row.notes ?? undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async delete(userId: string, id: string) {
    if (!isDatabaseEnabled()) {
      const idx = DEMO_MEASUREMENT_PROFILES.findIndex((p) => p.id === id);
      if (idx !== -1) DEMO_MEASUREMENT_PROFILES.splice(idx, 1);
      return { success: true };
    }
    await this.repo.delete(id, userId);
    return { success: true };
  }
}
