import type {
  Category,
  DesignerHouse,
  FeedPostData,
  Product,
  StoryItem,
} from "./types";
import {
  DEFAULT_CATEGORY,
  DESIGNER_DEFAULT_CATEGORY,
  getCategoryHero,
  getCategoryMedia,
  getCategoryPrimary,
  getDesignerLogo,
  getProductImagesForCategory,
  normalizeCategorySlug,
} from "./fashion-images";
import { pickFashionVideo, pickFashionVideos } from "./fashion-videos";

function walkCategories(nodes: Category[], visit: (cat: Category) => void) {
  for (const cat of nodes) {
    visit(cat);
    if (cat.children?.length) walkCategories(cat.children, visit);
  }
}

function productIdFromLink(link?: string): string | undefined {
  if (!link) return undefined;
  const match = link.match(/\/product\/([^/?#]+)/);
  return match?.[1];
}

function resolvePostCategory(
  post: FeedPostData,
  products: Product[]
): string {
  if (post.categorySlug) return normalizeCategorySlug(post.categorySlug);
  const productId = productIdFromLink(post.link);
  if (productId) {
    const product = products.find((p) => p.id === productId);
    if (product) return normalizeCategorySlug(product.category);
  }
  const designerProduct = products.find((p) => p.designerId === post.designerId);
  if (designerProduct) return normalizeCategorySlug(designerProduct.category);
  return normalizeCategorySlug(
    DESIGNER_DEFAULT_CATEGORY[post.designerId ?? ""] ?? DEFAULT_CATEGORY
  );
}

/**
 * Replaces legacy / mismatched demo media with category-tagged editorial stills
 * and real fashion video clips across the mock catalog (and DB seed source).
 */
export function applyFashionMedia(catalog: {
  products: Product[];
  categories: Category[];
  designers: DesignerHouse[];
  feedPosts: FeedPostData[];
  stories: StoryItem[];
}) {
  walkCategories(catalog.categories, (cat) => {
    cat.image = getCategoryHero(cat.slug);
  });

  const designerPrimaryCategory = new Map<string, string>();
  for (const p of catalog.products) {
    if (!designerPrimaryCategory.has(p.designerId)) {
      designerPrimaryCategory.set(p.designerId, normalizeCategorySlug(p.category));
    }
  }

  let videoCursor = 0;
  for (const p of catalog.products) {
    const category = normalizeCategorySlug(p.category);
    p.images = [...getProductImagesForCategory(category)];
    p.videos = pickFashionVideos(3, videoCursor);
    videoCursor += 3;
    designerPrimaryCategory.set(p.designerId, category);

    // Demo collection lines for browse sub-categories
    if (videoCursor % 11 === 0) {
      p.subcategory = "latest-drop";
    } else if (p.limitedEdition && p.subcategory !== "latest-drop") {
      p.subcategory = "limited-design";
    }
  }

  catalog.designers.forEach((d, i) => {
    const category =
      designerPrimaryCategory.get(d.id) ??
      normalizeCategorySlug(DESIGNER_DEFAULT_CATEGORY[d.id]);
    const media = getCategoryMedia(category);
    d.banner = media.hero;
    d.logo = getDesignerLogo(i);
    d.editorialGallery = [d.banner, d.logo].filter(Boolean) as string[];
    designerPrimaryCategory.set(d.id, category);
  });

  catalog.feedPosts.forEach((post, i) => {
    const category = resolvePostCategory(post, catalog.products);
    post.image = getCategoryPrimary(category);
    post.designerLogo =
      catalog.designers.find((d) => d.id === post.designerId)?.logo ?? post.designerLogo;
    if (post.videoUrl || post.videoOnly) {
      post.videoUrl = pickFashionVideo(i);
    }
  });

  catalog.stories.forEach((story, i) => {
    const category =
      designerPrimaryCategory.get(story.designerId) ??
      normalizeCategorySlug(DESIGNER_DEFAULT_CATEGORY[story.designerId]);
    const media = getCategoryMedia(category);
    const designer = catalog.designers.find((d) => d.id === story.designerId);
    story.designerLogo = designer?.logo ?? story.designerLogo;
    story.slides.forEach((slide, slideIdx) => {
      slide.image = slideIdx % 2 === 0 ? media.primary : media.alt;
    });
    if (!story.label) story.label = i % 2 === 0 ? "Just Landed" : "Atelier";
  });
}
