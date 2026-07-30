import { randomBytes } from "crypto";

/** Short prefixed id for products (cuid-like, no dependency). */
export function createId(prefix = "id"): string {
  return `${prefix}_${randomBytes(10).toString("hex")}`;
}
