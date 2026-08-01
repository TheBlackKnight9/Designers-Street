import { NextRequest } from "next/server";
import { EditorialService } from "@/server/services/editorial-service";
import { ok, fail } from "@/server/utils/api-response";

const service = new EditorialService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await service.createArticle(body);
    return ok(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create article";
    return fail(message, 400);
  }
}
