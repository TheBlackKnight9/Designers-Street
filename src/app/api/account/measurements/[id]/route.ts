import { PrismaClient } from "@prisma/client";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";
import { NotFoundError } from "@/server/errors";

const prisma = new PrismaClient();
type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/account/measurements/[id] */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const user = await requireBuyerContext();
    const body = await request.json();

    const existing = await prisma.measurementProfile.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new NotFoundError("Measurement profile not found");

    if (body.isDefault) {
      await prisma.measurementProfile.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.measurementProfile.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        unit: body.unit !== undefined ? (body.unit === "cm" ? "cm" : "inches") : existing.unit,
        isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : existing.isDefault,
        height: body.height !== undefined ? (body.height ? parseFloat(body.height) : null) : existing.height,
        chest: body.chest !== undefined || body.bustChest !== undefined ? parseFloat(body.chest || body.bustChest || 0) : existing.chest,
        waist: body.waist !== undefined ? (body.waist ? parseFloat(body.waist) : null) : existing.waist,
        hip: body.hip !== undefined || body.hips !== undefined ? parseFloat(body.hip || body.hips || 0) : existing.hip,
        shoulder: body.shoulder !== undefined ? (body.shoulder ? parseFloat(body.shoulder) : null) : existing.shoulder,
        sleeve: body.sleeve !== undefined || body.armLength !== undefined ? parseFloat(body.sleeve || body.armLength || 0) : existing.sleeve,
        notes: body.notes !== undefined ? (body.notes ? String(body.notes) : null) : existing.notes,
      },
    });

    return ok({ profile: updated });
  } catch (error) {
    return fail(error);
  }
}

/** DELETE /api/account/measurements/[id] */
export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const user = await requireBuyerContext();

    const existing = await prisma.measurementProfile.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new NotFoundError("Measurement profile not found");

    await prisma.measurementProfile.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
