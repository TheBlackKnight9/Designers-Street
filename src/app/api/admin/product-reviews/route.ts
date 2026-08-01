import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

/** GET /api/admin/product-reviews */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "pending_review" as any },
      include: {
        designer: {
          select: { name: true, handle: true, listingsApproved: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ products });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/admin/product-reviews - Approve or Reject product listing */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "admin:product-reviews");
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const productId = String(body.productId || "").trim();
    const action = String(body.action || "").trim(); // "approve" | "reject"

    if (!productId) throw new ValidationError("Product ID is required");
    if (action !== "approve" && action !== "reject") {
      throw new ValidationError("Valid action (approve or reject) is required");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new ValidationError("Product not found");

    if (action === "approve") {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { status: "published" },
      });

      // Mark designer's listings as approved
      await prisma.designerHouse.update({
        where: { id: product.designerId },
        data: { listingsApproved: true },
      });

      return ok({ product: updated });
    } else {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { status: "draft" },
      });
      return ok({ product: updated });
    }
  } catch (error) {
    return fail(error);
  }
}
