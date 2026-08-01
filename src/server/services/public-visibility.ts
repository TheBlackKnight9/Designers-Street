import type { Prisma } from "@prisma/client";

/**
 * Central public visibility: published products from active designer houses only.
 * Used by all public product/feed queries.
 */
export function publicProductWhere(
  extra?: Prisma.ProductWhereInput
): Prisma.ProductWhereInput {
  return {
    status: "published",
    designer: { accountStatus: "active" },
    ...extra,
  };
}

export function isPubliclyVisible(row: {
  status: string;
  designer?: { accountStatus: string } | null;
}): boolean {
  return (
    row.status === "published" &&
    row.designer?.accountStatus === "active"
  );
}
