import { NextResponse } from "next/server";
import { DesignerService } from "@/server/services";
import { ok, fail } from "@/server/utils/api-response";
import { DESIGNERS } from "@/lib/mock-data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const city = searchParams.get("city")?.toLowerCase().trim();

    let items: any[] = [];
    try {
      const data = await new DesignerService().listDesigners();
      items = Array.isArray(data) ? data : ((data as any)?.items || []);
    } catch {
      items = DESIGNERS;
    }

    if (!items || items.length === 0) {
      items = DESIGNERS;
    }

    if (search) {
      items = items.filter((d: any) => {
        const nameMatch = d.name?.toLowerCase().includes(search);
        const handleMatch = d.handle?.toLowerCase().includes(search);
        const locMatch = d.location?.toLowerCase().includes(search);
        const techMatch = d.signatureTechniques?.some((t: string) => t.toLowerCase().includes(search));
        return nameMatch || handleMatch || locMatch || techMatch;
      });
    }

    if (city && city !== "all") {
      items = items.filter((d: any) => d.location?.toLowerCase().includes(city));
    }

    return ok({ designers: items, items });
  } catch (error) {
    return ok({ designers: DESIGNERS, items: DESIGNERS });
  }
}
