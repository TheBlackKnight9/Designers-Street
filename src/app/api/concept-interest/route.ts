import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

/** POST /api/concept-interest - Express interest / request custom order for Concept Art */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "concept:interest");
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const productId = String(body.productId || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;

    if (!productId) throw new ValidationError("Product ID is required");
    if (!name) throw new ValidationError("Name is required");
    if (!email || !email.includes("@")) throw new ValidationError("Valid email is required");

    const interest = await prisma.conceptInterest.create({
      data: {
        productId,
        name,
        email,
        phone,
        notes,
        status: "new",
      },
    });

    return ok({ interest }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
