import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";
import { UserService } from "@/server/services/user-service";

export const runtime = "nodejs";
const users = new UserService();

/** GET /api/admin/applications */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const applications = await prisma.designerApplication.findMany({
      where: status === "all" ? {} : { status: status as any },
      orderBy: { createdAt: "desc" },
    });

    return ok({ applications });
  } catch (error) {
    return fail(error);
  }
}

/** POST /api/admin/applications - Approve / Reject / Request Info */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "admin:applications");
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const applicationId = String(body.applicationId || "").trim();
    const action = String(body.action || "").trim(); // "approve" | "reject" | "more_info"
    const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim() : null;

    if (!applicationId) throw new ValidationError("Application ID is required");
    if (!["approve", "reject", "more_info"].includes(action)) {
      throw new ValidationError("Valid action (approve, reject, or more_info) is required");
    }

    const application = await prisma.designerApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) throw new ValidationError("Application not found");

    if (action === "reject") {
      const updated = await prisma.designerApplication.update({
        where: { id: applicationId },
        data: {
          status: "rejected",
          adminNotes,
          reviewedAt: new Date(),
          reviewedBy: "Admin",
        },
      });
      return ok({ application: updated });
    }

    if (action === "more_info") {
      const updated = await prisma.designerApplication.update({
        where: { id: applicationId },
        data: {
          status: "more_info_needed",
          adminNotes,
          reviewedAt: new Date(),
          reviewedBy: "Admin",
        },
      });
      return ok({ application: updated });
    }

    // ACTION: APPROVE
    // 1. Create or resolve User in Prisma with role = "designer"
    let user = await users.findByEmail(application.applicantEmail);
    if (!user) {
      const authUserId = `usr_${applicationId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;
      user = await prisma.user.create({
        data: {
          id: authUserId,
          email: application.applicantEmail,
          name: application.applicantName,
          role: "designer",
        },
      });
    } else if (user.role !== "designer" && user.role !== "admin") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "designer" },
      });
    }

    // 2. Create or update DesignerHouse record
    const handle = application.brandName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 24) || "designerhouse";

    const houseId = `dh_${user.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;

    let house = await prisma.designerHouse.findFirst({
      where: { ownerUserId: user.id },
    });

    if (!house) {
      house = await prisma.designerHouse.create({
        data: {
          id: houseId,
          ownerUserId: user.id,
          name: application.brandName,
          handle,
          logo: application.portfolioImages[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
          banner: application.portfolioImages[1] || application.portfolioImages[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
          bio: application.brandStory.slice(0, 150),
          foundingStory: application.brandStory,
          location: application.applicantCity,
          signatureTechniques: application.categories,
          verified: true,
          accountStatus: "active",
          listingsApproved: false,
        },
      });
    }

    // 3. Mark application as approved
    const updated = await prisma.designerApplication.update({
      where: { id: applicationId },
      data: {
        status: "approved",
        adminNotes,
        reviewedAt: new Date(),
        reviewedBy: "Admin",
      },
    });

    return ok({ application: updated, houseId: house.id });
  } catch (error) {
    return fail(error);
  }
}
