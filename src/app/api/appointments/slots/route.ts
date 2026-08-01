import { NextRequest } from "next/server";
import { AppointmentService } from "@/server/services/luxury-service";
import { ok, fail } from "@/server/utils/api-response";

const service = new AppointmentService();

export async function GET(req: NextRequest) {
  try {
    const designerId = req.nextUrl.searchParams.get("designerId") || "dh-1";
    const date = req.nextUrl.searchParams.get("date") || undefined;
    const slots = await service.listSlots(designerId, date);
    return ok(slots);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch slots";
    return fail(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const designerId = body.designerId || "dh-1";
    const created = await service.createSlot(designerId, body);
    return ok(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create slot";
    return fail(message, 400);
  }
}
