import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** PATCH /api/concept-interest/[id] - Update Concept Art Lead Status */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminContext();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const status = String(body.status || "DESIGNER_CONTACTED").trim();

    const lead = await prisma.conceptInterest.update({
      where: { id },
      data: { status: status as any },
    });

    return ok({ lead });
  } catch (error) {
    return fail(error);
  }
}
