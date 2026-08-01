import { NextRequest } from "next/server";
import { AppointmentService } from "@/server/services/luxury-service";
import { ok, fail } from "@/server/utils/api-response";
import { getAuthenticatedUser } from "@/server/auth/session";

const service = new AppointmentService();

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || "usr-1";
    const designerId = req.nextUrl.searchParams.get("designerId");

    if (designerId) {
      const rows = await service.listForDesigner(designerId);
      return ok(rows);
    }
    const rows = await service.listMine(userId);
    return ok(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch appointments";
    return fail(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || "usr-1";
    const body = await req.json();

    const created = await service.create(userId, body);
    return ok(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to book appointment";
    return fail(message, 400);
  }
}
