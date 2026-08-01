import { NextRequest } from "next/server";
import { MeasurementService } from "@/server/services/measurement-service";
import { ok, fail } from "@/server/utils/api-response";
import { getAuthenticatedUser } from "@/server/auth/session";

const service = new MeasurementService();

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || "usr-1";
    const profiles = await service.listByUser(userId);
    return ok(profiles);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch measurement profiles";
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
    const message = error instanceof Error ? error.message : "Failed to create measurement profile";
    return fail(message, 400);
  }
}
