import { NextRequest } from "next/server";
import { AppointmentService } from "@/server/services/luxury-service";
import { ok, fail } from "@/server/utils/api-response";
import { getAuthenticatedUser } from "@/server/auth/session";

const service = new AppointmentService();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || "usr-1";
    const body = await req.json();

    const updated = await service.updateStatus(
      userId,
      id,
      body.status,
      body.statusNotes
    );
    return ok(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update appointment";
    return fail(message, 400);
  }
}
