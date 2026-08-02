import type {
  Category,
  DesignerHouse,
  FeedPostData,
  Product,
  StoryItem,
} from "@/lib/types";
import type {
  Category as DbCategory,
  DesignerHouse as DbDesigner,
  Post as DbPost,
  Product as DbProduct,
  Story as DbStory,
  StorySlide as DbSlide,
  ProductGender,
  PostType,
} from "@prisma/client";
import { sanitizeImageUrl } from "@/lib/utils/image-url";

export function toDesignerHouse(row: DbDesigner): DesignerHouse {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    logo: sanitizeImageUrl(row.logo, "https://images.unsplash.com/photo-1618220179428-22790b461013?w=200&q=80"),
    banner: sanitizeImageUrl(row.banner, "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"),
    bio: row.bio,
    foundingStory: row.foundingStory,
    founded: row.founded ?? undefined,
    location: row.location,
    signatureTechniques: row.signatureTechniques,
    verified: row.verified,
    exclusive: row.exclusive,
    offersBespoke: row.offersBespoke,
    followersCount: row.followersCount ?? undefined,
    followingCount: row.followingCount ?? undefined,
    postsCount: row.postsCount ?? undefined,
    website: row.website ?? undefined,
    designPhilosophy: row.designPhilosophy ?? undefined,
    yearsExperience: row.yearsExperience ?? undefined,
    studioLocation: row.studioLocation ?? undefined,
    awards: row.awards?.length ? row.awards : undefined,
    pressMentions: Array.isArray(row.pressMentions)
      ? (row.pressMentions as DesignerHouse["pressMentions"])
      : undefined,
    editorialGallery: row.editorialGallery?.length
      ? row.editorialGallery.map((img) => sanitizeImageUrl(img))
      : undefined,
  };
}

function toGender(g: ProductGender): Product["gender"] {
  return g;
}

export function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    designerName: row.designerName,
    designerId: row.designerId,
    price: row.price,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    gender: toGender(row.gender),
    images: row.images.map((img) => sanitizeImageUrl(img)),
    sizes: row.sizes,
    description: row.description,
    story: row.story ?? undefined,
    craftOrigin: row.craftOrigin ?? undefined,
    material: row.material ?? undefined,
    technique: row.technique ?? undefined,
    fit: row.fit ?? undefined,
    occasion: row.occasion ?? undefined,
    tags: row.tags.length ? row.tags : undefined,
    verified: row.verified,
    piecesRemaining: row.piecesRemaining ?? undefined,
    limitedEdition: row.limitedEdition,
    editionTotal: row.editionTotal ?? undefined,
    editionSold: row.editionSold,
    customizable: row.customizable,
    rating: row.rating ?? undefined,
    mrp: row.mrp ?? undefined,
    colors: row.colors.length ? row.colors : undefined,
    bestPrice: row.bestPrice ?? undefined,
    deliveryText: row.deliveryText ?? undefined,
    careInstructions: row.careInstructions ?? undefined,
    designerInspiration: row.designerInspiration ?? undefined,
    badges: row.badges?.length ? row.badges : undefined,
    editorsPick: row.editorsPick,
    madeToOrder: row.madeToOrder,
    sustainable: row.sustainable,
    handcrafted: row.handcrafted,
    recentPurchaseCount: row.recentPurchaseCount,
  };
}

function mapPostType(type: PostType): FeedPostData["type"] {
  return type === "designer_spotlight" ? "designer-spotlight" : "category";
}

export function toFeedPost(row: DbPost): FeedPostData {
  const productTag = row.productTag as FeedPostData["productTag"] | null;
  return {
    id: row.id,
    type: mapPostType(row.type),
    categorySlug: row.categorySlug ?? undefined,
    designerId: row.designerId ?? undefined,
    designerName: row.designerName,
    designerLogo: sanitizeImageUrl(row.designerLogo, "https://images.unsplash.com/photo-1618220179428-22790b461013?w=200&q=80"),
    designerVerified: row.designerVerified,
    tag: row.tag ?? undefined,
    image: sanitizeImageUrl(row.image, "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"),
    videoUrl: row.videoUrl ?? undefined,
    videoOnly: row.mediaType === "video" && Boolean(row.videoUrl),
    caption: row.caption,
    link: row.link,
    likesCount: row.likesCount,
    commentsCount: row.commentsCount,
    productTag: productTag ?? undefined,
  };
}

export function toStoryItem(
  story: DbStory & { slides: DbSlide[]; designer: DbDesigner }
): StoryItem {
  return {
    id: story.id,
    designerId: story.designerId,
    designerName: story.designer.name,
    designerLogo: sanitizeImageUrl(story.designer.logo, "https://images.unsplash.com/photo-1618220179428-22790b461013?w=200&q=80"),
    label: story.label,
    slides: story.slides
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        image: sanitizeImageUrl(s.image, "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"),
        caption: s.caption ?? undefined,
        ctaLabel: s.ctaLabel ?? undefined,
        ctaLink: s.ctaLink ?? undefined,
      })),
  };
}

export function buildCategoryTree(rows: DbCategory[]): Category[] {
  const byId = new Map<string, Category & { _id: string; _parentId: string | null }>();
  for (const row of rows) {
    byId.set(row.id, {
      _id: row.id,
      _parentId: row.parentId,
      slug: row.slug,
      label: row.label,
      image: sanitizeImageUrl(row.image, "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"),
      caption: row.caption ?? undefined,
      children: [],
    });
  }

  const roots: Category[] = [];
  for (const node of byId.values()) {
    if (node._parentId && byId.has(node._parentId)) {
      const parent = byId.get(node._parentId)!;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const strip = (nodes: Array<Category & { _id?: string; _parentId?: string | null }>): Category[] =>
    nodes.map((n) => ({
      slug: n.slug,
      label: n.label,
      image: n.image,
      caption: n.caption,
      children: n.children?.length
        ? strip(n.children as Array<Category & { _id?: string; _parentId?: string | null }>)
        : undefined,
    }));

  return strip(roots as Array<Category & { _id?: string; _parentId?: string | null }>);
}
