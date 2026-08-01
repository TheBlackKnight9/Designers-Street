import { prisma } from "@/server/db";
import { ValidationError, NotFoundError } from "@/server/errors";

export class ProductPublishingGuard {
  /**
   * Validates product fields before allowing status transition to `published`.
   * Enforces rules for COMMERCIAL vs CONCEPT_ART listing types.
   */
  async validatePublishingRequirements(productId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true, mediaAssets: true },
    });

    if (!product) {
      throw new NotFoundError(`Product ${productId} not found`);
    }

    const missing: string[] = [];

    // Common Requirements
    if (!product.name?.trim()) missing.push("Title");
    if (!product.description?.trim()) missing.push("Description");
    if (!product.category?.trim()) missing.push("Category");
    if (product.images.length === 0 && product.mediaAssets.length === 0) {
      missing.push("At least 1 product image or video media asset");
    }

    const isCommercial = (product as any).listingType !== "CONCEPT_ART";

    if (isCommercial) {
      // Commercial Garment Validation Rules
      if (!product.price || product.price <= 0) missing.push("Valid Retail Price");
      if (product.mrp && product.mrp < product.price) {
        missing.push("MRP must be greater than or equal to Retail Price");
      }
      if (!product.sizes || product.sizes.length === 0) missing.push("Available Sizes");

      const hasStock =
        (product as any).variants?.some((v: any) => v.stock > 0) ||
        (product.piecesRemaining != null && product.piecesRemaining > 0) ||
        product.madeToOrder;

      if (!hasStock) {
        missing.push("Variant Stock quantity > 0 or Made-to-Order flag");
      }

      const weight = (product as any).weightGrams;
      if (!weight || weight <= 0) {
        missing.push("Item Shipping Weight (in grams)");
      }

      const manufacturer = (product as any).manufacturerName;
      if (!manufacturer?.trim()) {
        missing.push("Legal Metrology: Manufacturer Name");
      }
    }

    if (missing.length > 0) {
      throw new ValidationError(
        `Cannot publish. Please complete required ${
          isCommercial ? "Commercial Item" : "Concept Art"
        } fields: ${missing.join(", ")}`
      );
    }
  }
}
