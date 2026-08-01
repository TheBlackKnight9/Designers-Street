import { NextRequest } from "next/server";
import { MeasurementService } from "@/server/services/measurement-service";
import { ok, fail } from "@/server/utils/api-response";
import { getAuthenticatedUser } from "@/server/auth/session";

const service = new MeasurementService();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || "usr-1";
    const res = await service.delete(userId, id);
    return ok(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete measurement profile";
    return fail(message, 400);
  }
}
