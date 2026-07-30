import type { Product } from "@/lib/types";
import type {
  ProductCardDTO,
  ProductDetailDTO,
} from "@/server/dto/public";

/** Map ProductCardDTO → UI Product shape for ProductCard / existing pages */
export function productCardToUiProduct(card: ProductCardDTO): Product {
  const imageUrls = card.gallery
    .filter((g) => g.type === "image")
    .map((g) => g.url);
  const images =
    imageUrls.length > 0
      ? imageUrls
      : card.coverImage
        ? [card.coverImage]
        : [];

  return {
    id: card.id,
    name: card.name,
    designerName: card.designerName,
    designerId: card.designerId,
    price: card.price,
    mrp: card.mrp ?? undefined,
    bestPrice: card.bestPrice ?? undefined,
    category: card.category,
    subcategory: card.subcategory ?? undefined,
    gender: card.gender,
    images,
    sizes: card.sizes,
    colors: card.colors,
    tags: card.tags,
    description: "",
    customizable: card.customizable,
    limitedEdition: card.limitedEdition,
    piecesRemaining: card.piecesRemaining ?? undefined,
    rating: card.rating ?? undefined,
    verified: card.verified,
  };
}

export function productDetailToUiProduct(detail: ProductDetailDTO): Product {
  return {
    ...productCardToUiProduct(detail),
    description: detail.description,
    story: detail.story ?? undefined,
    craftOrigin: detail.craftOrigin ?? undefined,
    material: detail.material ?? undefined,
    technique: detail.technique ?? undefined,
    fit: detail.fit ?? undefined,
    occasion: detail.occasion ?? undefined,
    deliveryText: detail.deliveryText ?? undefined,
  };
}
