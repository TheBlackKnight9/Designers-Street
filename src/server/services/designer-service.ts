import { DesignerRepository } from "@/server/repositories";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError } from "@/server/errors";
import {
  DESIGNERS,
  getDesignerById,
} from "@/lib/mock-data";
import type { DesignerHouse } from "@/lib/types";

const repo = new DesignerRepository();

export class DesignerService {
  async getNameByOwnerUserId(ownerUserId: string): Promise<string | null> {
    if (!isDatabaseEnabled()) return null;
    const designer = await repo.findByOwnerUserId(ownerUserId);
    return designer?.name ?? null;
  }

  async listDesigners(): Promise<DesignerHouse[]> {
    if (!isDatabaseEnabled()) return DESIGNERS;
    return repo.findAllActive();
  }

  async getById(id: string): Promise<DesignerHouse> {
    if (!isDatabaseEnabled()) {
      const designer = getDesignerById(id);
      if (!designer) throw new NotFoundError(`Designer ${id} not found`);
      return designer;
    }
    const designer = await repo.findById(id);
    if (!designer) throw new NotFoundError(`Designer ${id} not found`);
    return designer;
  }

  async getByHandle(handle: string): Promise<DesignerHouse> {
    if (!isDatabaseEnabled()) {
      const decoded = decodeURIComponent(handle).trim().toLowerCase();
      const slugified = decoded.replace(/\s+/g, "-");
      // Canonical lookup order: handle → slugified handle → id.
      // Name is intentionally excluded — it is not unique and must not be a URL key.
      const designer = DESIGNERS.find(
        (d) =>
          d.handle.toLowerCase() === decoded ||
          d.handle.toLowerCase() === slugified ||
          d.id.toLowerCase() === decoded
      );
      if (!designer) throw new NotFoundError(`Designer ${handle} not found`);
      return designer;
    }
    const designer = await repo.findByHandle(handle);
    if (!designer) throw new NotFoundError(`Designer ${handle} not found`);
    return designer;
  }
}
