import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { ok, fail } from "@/server/utils/api-response";
import { ValidationError } from "@/server/errors";
import { enforcePublicRateLimit } from "@/server/utils/rate-limit";

export const runtime = "nodejs";

/** POST /api/designer/apply */
export async function POST(request: Request) {
  try {
    enforcePublicRateLimit(request, "designer:apply");
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const applicantName = String(body.applicantName || "").trim();
    const applicantEmail = String(body.applicantEmail || "").trim().toLowerCase();
    const applicantPhone = String(body.applicantPhone || "").trim();
    const applicantCity = String(body.applicantCity || "").trim();
    const brandName = String(body.brandName || "").trim();
    const brandStory = String(body.brandStory || "").trim();
    const designPhilosophy = typeof body.designPhilosophy === "string" ? body.designPhilosophy.trim() : null;
    const instagramHandle = typeof body.instagramHandle === "string" ? body.instagramHandle.trim() : null;
    const websiteUrl = typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : null;
    const priceRange = String(body.priceRange || "₹10K–50K").trim();

    const portfolioImages = Array.isArray(body.portfolioImages)
      ? body.portfolioImages.map((x) => String(x).trim()).filter(Boolean)
      : [];

    const categories = Array.isArray(body.categories)
      ? body.categories.map((x) => String(x).trim()).filter(Boolean)
      : [];

    if (!applicantName) throw new ValidationError("Applicant name is required");
    if (!applicantEmail || !applicantEmail.includes("@")) throw new ValidationError("Valid email is required");
    if (!applicantPhone) throw new ValidationError("Phone number is required");
    if (!applicantCity) throw new ValidationError("City is required");
    if (!brandName) throw new ValidationError("Brand name is required");
    if (!brandStory) throw new ValidationError("Founding story is required");
    if (portfolioImages.length === 0) throw new ValidationError("At least 1 portfolio image is required");

    const application = await prisma.designerApplication.create({
      data: {
        applicantName,
        applicantEmail,
        applicantPhone,
        applicantCity,
        brandName,
        brandStory,
        designPhilosophy,
        portfolioImages,
        instagramHandle,
        websiteUrl,
        categories: categories.length > 0 ? categories : ["Couture"],
        priceRange,
        status: "pending",
      },
    });

    return ok({ application }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}

/** GET /api/designer/apply - check status by email */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return ok({ applications: [] });
    }

    const applications = await prisma.designerApplication.findMany({
      where: { applicantEmail: email },
      orderBy: { createdAt: "desc" },
    });

    return ok({ applications });
  } catch (error) {
    return fail(error);
  }
}
