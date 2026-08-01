import { NextRequest } from "next/server";
import { EditorialService } from "@/server/services/editorial-service";
import { ok, fail } from "@/server/utils/api-response";

const service = new EditorialService();

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const collection = await service.getCollectionBySlug(slug);
    return ok(collection);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Collection not found";
    return fail(message, 404);
  }
}
