import { NextRequest } from "next/server";
import { BespokeService } from "@/server/services/luxury-service";
import { ok, fail } from "@/server/utils/api-response";
import { getAuthenticatedUser } from "@/server/auth/session";

const service = new BespokeService();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bespoke = await service.getById(id);
    return ok(bespoke);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bespoke request not found";
    return fail(message, 404);
  }
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
    const message = error instanceof Error ? error.message : "Failed to update bespoke request";
    return fail(message, 400);
  }
}
