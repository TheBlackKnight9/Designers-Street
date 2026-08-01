import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";

export const runtime = "nodejs";

/** POST /api/notifications/welcome-designer */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const userId = String(body.userId || "").trim();
    const brandName = String(body.brandName || "").trim();

    if (!userId || !brandName) {
      throw new ValidationError("User ID and brand name are required");
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: "welcome_designer",
        title: `Welcome to Designer's Street, ${brandName}!`,
        body: "Your Designer House application has been approved. Complete your KYC & Bank Verification to activate automated payouts.",
      },
    });

    return ok({ notification }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
