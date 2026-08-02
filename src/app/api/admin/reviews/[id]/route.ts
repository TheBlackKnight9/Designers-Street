import { prisma } from "@/server/db";
import { requireAdminContext } from "@/server/auth/admin-guard";
import { ok, fail } from "@/server/utils/api-response";

export const runtime = "nodejs";

/** PATCH /api/admin/reviews/[id] - Moderate review or post brand response */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminContext();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const isApproved = typeof body.isApproved === "boolean" ? body.isApproved : undefined;
    const designerReply = typeof body.designerReply === "string" ? body.designerReply.trim() : undefined;

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(isApproved !== undefined ? { isApproved } : {}),
        ...(designerReply !== undefined ? { designerReply, repliedAt: new Date() } : {}),
      },
    });

    return ok({ review: updated });
  } catch (error) {
    return fail(error);
  }
}
