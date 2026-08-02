import { PrismaClient } from "@prisma/client";
import { requireBuyerContext } from "@/server/auth/buyer-session";
import { ok, fail } from "@/server/utils/api-response";

const prisma = new PrismaClient();

/** GET /api/account/measurements */
export async function GET() {
  try {
    const user = await requireBuyerContext();
    const profiles = await prisma.measurementProfile.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return ok({ profiles });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/account/measurements */
export async function POST(request: Request) {
  try {
    const user = await requireBuyerContext();
    const body = await request.json();

    const name = String(body.name || "My Standard Fit").trim();
    const unit = body.unit === "cm" ? "cm" : "inches";
    const isDefault = Boolean(body.isDefault);

    if (isDefault) {
      await prisma.measurementProfile.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const profile = await prisma.measurementProfile.create({
      data: {
        userId: user.id,
        name,
        unit,
        isDefault,
        height: body.height ? parseFloat(body.height) : null,
        chest: body.chest || body.bustChest ? parseFloat(body.chest || body.bustChest) : null,
        waist: body.waist ? parseFloat(body.waist) : null,
        hip: body.hip || body.hips ? parseFloat(body.hip || body.hips) : null,
        shoulder: body.shoulder ? parseFloat(body.shoulder) : null,
        sleeve: body.sleeve || body.armLength ? parseFloat(body.sleeve || body.armLength) : null,
        notes: body.notes ? String(body.notes) : null,
      },
    });

    return ok({ profile }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
