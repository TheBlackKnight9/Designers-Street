import type { Product, FeedPostData } from "@/lib/types";
import type { MediaItemDTO } from "@/server/dto/public";
import type { ViewerMediaItem } from "@/lib/media/types";

export function mediaItemsToViewerMedia(
  items: MediaItemDTO[],
  meta?: { productId?: string; alt?: string }
): ViewerMediaItem[] {
  return items.map((item) => ({
    id: item.id,
    type: item.type,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
    publicId: item.publicId ?? null,
    alt: meta?.alt,
    productId: meta?.productId,
  }));
}

/** Fallback when only Product.images[] / videos[] is available */
export function productToViewerMedia(product: Product): ViewerMediaItem[] {
  const images = product.images?.length ? product.images : [];
  const items: ViewerMediaItem[] = images.map((url, i) => ({
    id: `${product.id}-img-${i}`,
    type: "image" as const,
    url,
    thumbnailUrl: url,
    alt: product.name,
    productId: product.id,
    designerId: product.designerId,
    category: product.category,
    tags: product.tags,
    price: product.price,
    colors: product.colors,
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
      productId: product.id,
      designerId: product.designerId,
      category: product.category,
      tags: product.tags,
      price: product.price,
      colors: product.colors,
    });
  }

  return items;
}

export function urlsToViewerMedia(
  urls: string[],
  options?: { idPrefix?: string; alt?: string; productId?: string }
): ViewerMediaItem[] {
  const prefix = options?.idPrefix ?? "media";
  return urls.filter(Boolean).map((url, i) => ({
    id: `${prefix}-${i}`,
    type: "image" as const,
    url,
    thumbnailUrl: url,
    alt: options?.alt,
    productId: options?.productId,
  }));
}

export function feedPostToViewerMedia(post: FeedPostData): ViewerMediaItem[] {
  if (post.videoOnly && post.videoUrl) {
    return [
      {
        id: `${post.id}-video`,
        type: "video",
        url: post.videoUrl,
        thumbnailUrl: post.image || null,
        alt: post.caption,
        productId: post.productTag?.productId,
        postId: post.id,
        designerId: post.designerId,
        tags: post.tag ? [post.tag.toLowerCase()] : undefined,
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
      productId: post.productTag?.productId,
      postId: post.id,
      designerId: post.designerId,
      tags: post.tag ? [post.tag.toLowerCase()] : undefined,
    },
  ];
  if (post.videoUrl) {
    items.push({
      id: `${post.id}-video`,
      type: "video",
      url: post.videoUrl,
      thumbnailUrl: post.image,
      alt: post.caption,
      productId: post.productTag?.productId,
      postId: post.id,
      designerId: post.designerId,
      tags: post.tag ? [post.tag.toLowerCase()] : undefined,
    });
  }
  return items;
}
