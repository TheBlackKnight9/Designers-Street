import type {
  CategoryDTO,
  DesignerPreviewDTO,
  FeedPostDTO,
  MediaItemDTO,
  ProductCardDTO,
  ProductDetailDTO,
} from "@/server/dto/public";
import type {
  DesignerHouse as DbDesigner,
  MediaAsset,
  Product as DbProduct,
} from "@prisma/client";
import type { Category } from "@/lib/types";

type ProductWithDesigner = DbProduct & {
  designer: DbDesigner;
  mediaAssets?: MediaAsset[];
};

function sortMedia(media: MediaAsset[]): MediaAsset[] {
  return [...media].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export function buildMediaGallery(
  row: ProductWithDesigner
): {
  gallery: MediaItemDTO[];
  coverImage: string;
  videoPreview: string | null;
} {
  const assets = sortMedia(row.mediaAssets ?? []);
  const gallery: MediaItemDTO[] = assets.map((m) => ({
    id: m.id,
    type: m.kind === "video" ? "video" : "image",
    url: m.url,
    thumbnailUrl: m.thumbnailUrl,
    displayOrder: m.displayOrder,
    publicId: m.publicId ?? null,
  }));

  const firstImage =
    gallery.find((g) => g.type === "image")?.url ||
    row.images[0] ||
    "";

  const coverFromOrder =
    gallery[0]?.type === "image"
      ? gallery[0].url
      : gallery[0]?.thumbnailUrl || firstImage;

  const videoPreview =
    gallery.find((g) => g.type === "video")?.thumbnailUrl ||
    gallery.find((g) => g.type === "video")?.url ||
    null;

  // If no MediaAsset rows, synthesize gallery from Product.images
  if (gallery.length === 0 && row.images.length > 0) {
    const synthesized = row.images.map((url, i) => ({
      id: `${row.id}-img-${i}`,
      type: "image" as const,
      url,
      thumbnailUrl: null,
      displayOrder: i,
      publicId: null as string | null,
    }));
    return {
      gallery: synthesized,
      coverImage: row.images[0],
      videoPreview: null,
    };
  }

  return {
    gallery,
    coverImage: coverFromOrder || firstImage,
    videoPreview,
  };
}

export function toDesignerPreview(d: DbDesigner): DesignerPreviewDTO {
  return {
    id: d.id,
    name: d.name,
    handle: d.handle,
    logo: d.logo,
    verified: d.verified,
  };
}

export function toProductCardDTO(row: ProductWithDesigner): ProductCardDTO {
  const media = buildMediaGallery(row);
  return {
    id: row.id,
    name: row.name,
    designerName: row.designerName,
    designerId: row.designerId,
    price: row.price,
    mrp: row.mrp,
    bestPrice: row.bestPrice,
    category: row.category,
    subcategory: row.subcategory,
    gender: row.gender,
    coverImage: media.coverImage,
    gallery: media.gallery,
    videoPreview: media.videoPreview,
    sizes: row.sizes,
    colors: row.colors,
    tags: row.tags,
    customizable: row.customizable,
    limitedEdition: row.limitedEdition,
    piecesRemaining: row.piecesRemaining,
    editionTotal: row.editionTotal,
    editionSold: row.editionSold,
    recentPurchaseCount: row.recentPurchaseCount,
    editorsPick: row.editorsPick,
    handcrafted: row.handcrafted,
    madeToOrder: row.madeToOrder,
    sustainable: row.sustainable,
    badges: row.badges ?? [],
    rating: row.rating,
    verified: row.verified,
  };
}

export function toProductDetailDTO(row: ProductWithDesigner): ProductDetailDTO {
  return {
    ...toProductCardDTO(row),
    description: row.description,
    story: row.story,
    craftOrigin: row.craftOrigin,
    material: row.material,
    technique: row.technique,
    fit: row.fit,
    occasion: row.occasion,
    deliveryText: row.deliveryText,
    careInstructions: row.careInstructions,
    designerInspiration: row.designerInspiration,
    designer: toDesignerPreview(row.designer),
  };
}

export function toFeedPostDTO(row: ProductWithDesigner): FeedPostDTO {
  const card = toProductCardDTO(row);
  return {
    id: row.id,
    type: "designer-spotlight",
    designerId: row.designerId,
    designerName: row.designer.name,
    designerLogo: row.designer.logo,
    designerVerified: row.designer.verified,
    tag: row.limitedEdition ? "Limited Edition" : "New Drop",
    image: card.coverImage,
    videoUrl: card.videoPreview ?? undefined,
    videoOnly: Boolean(card.videoPreview),
    caption: row.name,
    link: `/product/${row.id}`,
    productTag: {
      productId: row.id,
      name: row.name,
      price: row.price,
    },
  };
}

export function toCategoryDTO(c: Category): CategoryDTO {
  return {
    slug: c.slug,
    label: c.label,
    image: c.image,
    caption: c.caption,
    children: c.children?.map(toCategoryDTO),
  };
}
