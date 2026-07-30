import { DesignerRepository } from "@/server/repositories";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError } from "@/server/errors";
import {
  DESIGNERS,
  getDesignerById,
  getDesignerByHandle,
} from "@/lib/mock-data";
import type { DesignerHouse } from "@/lib/types";

const repo = new DesignerRepository();

export class DesignerService {
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
      const designer = getDesignerByHandle(handle);
      if (!designer) {
        const fallback = DESIGNERS.find(
          (d) => d.handle.toLowerCase() === handle.toLowerCase()
        );
        if (!fallback) throw new NotFoundError(`Designer ${handle} not found`);
        return fallback;
      }
      return designer;
    }
    const designer = await repo.findByHandle(handle);
    if (!designer) throw new NotFoundError(`Designer ${handle} not found`);
    return designer;
  }
}
