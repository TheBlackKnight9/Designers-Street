import type { Product, FeedPostData } from "@/lib/types";
import { resolvePostProductId } from "@/lib/feed-product";
import type { MediaItemDTO } from "@/server/dto/public";
import type { ViewerMediaItem } from "@/lib/media/types";
import { getProductById, getDesignerById } from "@/lib/mock-data";

function enrichFromProduct(
  productId: string | undefined,
  base: Partial<ViewerMediaItem> = {}
): Partial<ViewerMediaItem> {
  if (!productId) return base;
  const product = getProductById(productId);
  if (!product) return base;
  const designer = getDesignerById(product.designerId);
  return {
    ...base,
    productId: product.id,
    productName: product.name,
    productDescription: product.description?.slice(0, 120),
    price: product.price,
    colors: product.colors,
    sizes: product.sizes,
    limitedEdition: product.limitedEdition,
    category: product.category,
    tags: product.tags,
    designerId: product.designerId,
    designerName: designer?.name ?? product.designerName,
    designerHandle: designer?.handle,
    designerLogo: designer?.logo,
    designerVerified: designer?.verified ?? product.verified,
  };
}

export function mediaItemsToViewerMedia(
  items: MediaItemDTO[],
  meta?: { productId?: string; alt?: string }
): ViewerMediaItem[] {
  const enriched = enrichFromProduct(meta?.productId);
  return items.map((item) => ({
    id: item.id,
    type: item.type,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
    publicId: item.publicId ?? null,
    alt: meta?.alt,
    productId: meta?.productId,
    ...enriched,
  }));
}

/** Fallback when only Product.images[] / videos[] is available */
export function productToViewerMedia(product: Product): ViewerMediaItem[] {
  const designer = getDesignerById(product.designerId);
  const meta: Partial<ViewerMediaItem> = {
    productId: product.id,
    productName: product.name,
    productDescription: product.description?.slice(0, 120),
    designerId: product.designerId,
    designerName: designer?.name ?? product.designerName,
    designerHandle: designer?.handle,
    designerLogo: designer?.logo,
    designerVerified: designer?.verified ?? product.verified,
    category: product.category,
    tags: product.tags,
    price: product.price,
    colors: product.colors,
    sizes: product.sizes,
    limitedEdition: product.limitedEdition,
  };

  const images = product.images?.length ? product.images : [];
  const items: ViewerMediaItem[] = images.map((url, i) => ({
    id: `${product.id}-img-${i}`,
    type: "image" as const,
    url,
    thumbnailUrl: url,
    alt: product.name,
    ...meta,
  }));

  const videos = product.videos?.filter(Boolean) ?? [];
  for (let i = 0; i < videos.length; i++) {
    const url = videos[i];
    items.push({
      id: `${product.id}-vid-${i}`,
      type: "video",
      url,
      thumbnailUrl: images[0] ?? null,
      alt: `${product.name} — lookbook`,
      ...meta,
    });
  }

  return items;
}

export function urlsToViewerMedia(
  urls: string[],
  options?: { idPrefix?: string; alt?: string; productId?: string }
): ViewerMediaItem[] {
  const prefix = options?.idPrefix ?? "media";
  const enriched = enrichFromProduct(options?.productId);
  return urls.filter(Boolean).map((url, i) => ({
    id: `${prefix}-${i}`,
    type: "image" as const,
    url,
    thumbnailUrl: url,
    alt: options?.alt,
    productId: options?.productId,
    ...enriched,
  }));
}

export function feedPostToViewerMedia(post: FeedPostData): ViewerMediaItem[] {
  const productId = resolvePostProductId(post);
  const fromProduct = enrichFromProduct(productId);
  const designer = post.designerId ? getDesignerById(post.designerId) : undefined;

  const social: Partial<ViewerMediaItem> = {
    postId: post.id,
    designerId: post.designerId ?? fromProduct.designerId,
    designerName: post.designerName ?? fromProduct.designerName,
    designerHandle: designer?.handle ?? fromProduct.designerHandle,
    designerLogo: post.designerLogo ?? designer?.logo ?? fromProduct.designerLogo,
    designerVerified:
      post.designerVerified ?? fromProduct.designerVerified ?? false,
    caption: post.caption,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    likedByMe: post.likedByMe,
    followingDesigner: post.followingDesigner,
    productName: post.productTag?.name ?? fromProduct.productName,
    price: post.productTag?.price ?? fromProduct.price,
    tags: post.tag
      ? [post.tag.toLowerCase(), ...(fromProduct.tags ?? [])]
      : fromProduct.tags,
    ...fromProduct,
    productId,
  };

  if (post.videoOnly && post.videoUrl) {
    return [
      {
        id: `${post.id}-video`,
        type: "video",
        url: post.videoUrl,
        thumbnailUrl: post.image || null,
        alt: post.caption,
        ...social,
      },
    ];
  }

  const items: ViewerMediaItem[] = [
    {
      id: `${post.id}-cover`,
      type: "image",
      url: post.image,
      thumbnailUrl: post.image,
      alt: post.caption,
      ...social,
    },
  ];
  if (post.videoUrl) {
    items.push({
      id: `${post.id}-video`,
      type: "video",
      url: post.videoUrl,
      thumbnailUrl: post.image,
      alt: post.caption,
      ...social,
    });
  }
  return items;
}
