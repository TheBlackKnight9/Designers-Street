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

export function toDesignerHouse(row: DbDesigner): DesignerHouse {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    logo: row.logo,
    banner: row.banner,
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
    images: row.images,
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
    customizable: row.customizable,
    rating: row.rating ?? undefined,
    mrp: row.mrp ?? undefined,
    colors: row.colors.length ? row.colors : undefined,
    bestPrice: row.bestPrice ?? undefined,
    deliveryText: row.deliveryText ?? undefined,
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
    designerLogo: row.designerLogo,
    designerVerified: row.designerVerified,
    tag: row.tag ?? undefined,
    image: row.image,
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
    designerLogo: story.designer.logo,
    label: story.label,
    slides: story.slides
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        image: s.image,
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
      image: row.image,
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
