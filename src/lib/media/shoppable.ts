import type { ViewerMediaItem } from "@/lib/media/types";
import { getDesignerById, getProductById } from "@/lib/mock-data";

/**
 * Enrich a viewer item with product/designer metadata for shoppable chrome.
 * Never invents a productId or postId — only fills fields for IDs already present
 * so likes/comments/bag always target the correct entity.
 */
export function resolveShoppableReel(item: ViewerMediaItem): ViewerMediaItem {
  const productId = item.productId;
  const product = productId ? getProductById(productId) : undefined;

  const designerId = item.designerId || product?.designerId;
  const designer = designerId ? getDesignerById(designerId) : undefined;

  const postId = item.postId;

  return {
    ...item,
    productId: product?.id ?? productId,
    productName: item.productName || product?.name,
    productDescription:
      item.productDescription || product?.description?.slice(0, 140),
    productImage:
      item.productImage ||
      product?.images?.[0] ||
      item.thumbnailUrl ||
      null,
    price: item.price ?? product?.price,
    colors: item.colors?.length ? item.colors : product?.colors,
    sizes: item.sizes?.length ? item.sizes : product?.sizes,
    limitedEdition: item.limitedEdition ?? product?.limitedEdition,
    rating: item.rating ?? product?.rating,
    piecesRemaining: item.piecesRemaining ?? product?.piecesRemaining,
    deliveryText: item.deliveryText || product?.deliveryText,
    category: item.category || product?.category,
    tags: item.tags?.length ? item.tags : product?.tags,
    designerId: designer?.id ?? designerId,
    designerName:
      item.designerName || designer?.name || product?.designerName,
    designerHandle: item.designerHandle || designer?.handle,
    designerLogo: item.designerLogo || designer?.logo,
    designerVerified:
      item.designerVerified ?? designer?.verified ?? product?.verified,
    designerFollowers: item.designerFollowers || designer?.followersCount,
    designerBio: item.designerBio || designer?.bio,
    postId,
    commentsCount: item.commentsCount,
    likesCount: item.likesCount,
    likedByMe: item.likedByMe,
    caption: item.caption,
    followingDesigner: item.followingDesigner,
  };
}

/** Product reels that support in-viewer commerce CTAs */
export function isShoppableReel(item: ViewerMediaItem): boolean {
  return Boolean(item.productId);
}

export function hasInReelCommerce(item: ViewerMediaItem): boolean {
  return Boolean(item.productId);
}

export function hasInReelComments(item: ViewerMediaItem): boolean {
  return Boolean(item.postId);
}
