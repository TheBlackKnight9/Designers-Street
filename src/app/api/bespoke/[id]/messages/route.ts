import { NextRequest } from "next/server";
import { BespokeService } from "@/server/services/luxury-service";
import { ok, fail } from "@/server/utils/api-response";
import { getAuthenticatedUser } from "@/server/auth/session";

const service = new BespokeService();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);
    const userId = user?.id || "usr-1";
    const body = await req.json();

    const created = await service.addMessage(
      id,
      userId,
      body.senderRole || "buyer",
      body.message
    );
    return ok(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return fail(message, 400);
  }
}
