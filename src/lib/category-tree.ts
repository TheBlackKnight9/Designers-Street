/**
 * Gender-first category navigation + product taxonomy for Designer's Street.
 *
 * Navigation slugs (browse): women, men, women-sarees, men-latest-drop, …
 * Product fields: category = product type (sarees), subcategory = latest-drop | limited-design | bridal | …
 */
import type { Category } from "./types";
import { getCategoryHero } from "./fashion-images";

export type ProductGenderNav = "men" | "women" | "unisex";

export type ProductCategoryOption = {
  slug: string;
  label: string;
};

export const COLLECTION_SUBCATEGORIES: ProductCategoryOption[] = [
  { slug: "latest-drop", label: "Latest Drop" },
  { slug: "limited-design", label: "Limited Design" },
];

export const STYLE_SUBCATEGORIES: ProductCategoryOption[] = [
  { slug: "bridal", label: "Bridal" },
  { slug: "cocktail", label: "Cocktail" },
  { slug: "reception", label: "Reception" },
  { slug: "festive", label: "Festive" },
  { slug: "everyday", label: "Everyday" },
  { slug: "contemporary", label: "Contemporary" },
  { slug: "traditional", label: "Traditional" },
];

export const WOMEN_PRODUCT_CATEGORIES: ProductCategoryOption[] = [
  { slug: "sarees", label: "Sarees" },
  { slug: "lehengas", label: "Lehengas" },
  { slug: "kurtas", label: "Kurtas" },
  { slug: "dresses", label: "Dresses" },
  { slug: "gowns", label: "Gowns" },
  { slug: "indo-western", label: "Indo-Western" },
  { slug: "bridal", label: "Bridal" },
  { slug: "womens-wear", label: "Women's Wear" },
  { slug: "kids", label: "Kids" },
  { slug: "jewellery", label: "Jewellery" },
  { slug: "bags", label: "Bags" },
  { slug: "footwear", label: "Footwear" },
  { slug: "accessories", label: "Accessories" },
  { slug: "occasion-wear", label: "Occasion Wear" },
  { slug: "sustainable", label: "Sustainable" },
  { slug: "luxury-couture", label: "Luxury Couture" },
  { slug: "streetwear", label: "Streetwear" },
];

export const MEN_PRODUCT_CATEGORIES: ProductCategoryOption[] = [
  { slug: "sherwanis", label: "Sherwanis" },
  { slug: "kurtas", label: "Kurtas" },
  { slug: "indo-western", label: "Indo-Western" },
  { slug: "mens-wear", label: "Men's Wear" },
  { slug: "bridal", label: "Bridal / Groom" },
  { slug: "kids", label: "Kids" },
  { slug: "footwear", label: "Footwear" },
  { slug: "accessories", label: "Accessories" },
  { slug: "occasion-wear", label: "Occasion Wear" },
  { slug: "sustainable", label: "Sustainable" },
  { slug: "luxury-couture", label: "Luxury Couture" },
  { slug: "streetwear", label: "Streetwear" },
];

export const UNISEX_PRODUCT_CATEGORIES: ProductCategoryOption[] = [
  ...WOMEN_PRODUCT_CATEGORIES,
  ...MEN_PRODUCT_CATEGORIES.filter(
    (m) => !WOMEN_PRODUCT_CATEGORIES.some((w) => w.slug === m.slug)
  ),
];

export type ParsedNavigationSlug = {
  gender?: "men" | "women";
  productCategory?: string;
  collectionLine?: "latest-drop" | "limited-design";
  /** Legacy flat slug without gender prefix */
  legacyOnly?: boolean;
};

export function parseNavigationSlug(slug: string): ParsedNavigationSlug {
  const s = slug.toLowerCase().trim();
  if (s === "women" || s === "men") {
    return { gender: s };
  }

  if (s === "latest-drop") return { collectionLine: "latest-drop", legacyOnly: true };
  if (s === "limited-design" || s === "limited-edition") {
    return { collectionLine: "limited-design", legacyOnly: true };
  }

  const womenPrefix = s.startsWith("women-");
  const menPrefix = s.startsWith("men-");
  if (!womenPrefix && !menPrefix) {
    return { productCategory: s, legacyOnly: true };
  }

  const gender: "men" | "women" = womenPrefix ? "women" : "men";
  const rest = s.slice(womenPrefix ? 6 : 4);

  if (rest === "latest-drop") return { gender, collectionLine: "latest-drop" };
  if (rest === "limited-design") return { gender, collectionLine: "limited-design" };
  return { gender, productCategory: rest };
}

export function productCategoriesForGender(
  gender: ProductGenderNav
): ProductCategoryOption[] {
  if (gender === "women") return WOMEN_PRODUCT_CATEGORIES;
  if (gender === "men") return MEN_PRODUCT_CATEGORIES;
  return UNISEX_PRODUCT_CATEGORIES;
}

export function subcategoryOptionsForProduct(): ProductCategoryOption[] {
  return [...COLLECTION_SUBCATEGORIES, ...STYLE_SUBCATEGORIES];
}

type ProductLike = {
  category: string;
  subcategory?: string | null;
  gender: ProductGenderNav;
  limitedEdition?: boolean;
  tags?: string[];
  craftOrigin?: string;
  technique?: string;
  occasion?: string;
};

export function productMatchesNavigationSlug(
  product: ProductLike,
  slug: string
): boolean {
  const parsed = parseNavigationSlug(slug);

  if (parsed.gender) {
    const g = product.gender;
    if (g !== parsed.gender && g !== "unisex") return false;
  }

  if (parsed.productCategory) {
    const pc = parsed.productCategory.toLowerCase();
    const cat = product.category.toLowerCase();
    const sub = product.subcategory?.toLowerCase();
    if (cat !== pc && sub !== pc && !product.tags?.some((t) => t.toLowerCase() === pc)) {
      return false;
    }
  }

  if (parsed.collectionLine === "latest-drop") {
    if (product.subcategory?.toLowerCase() !== "latest-drop") return false;
  }

  if (parsed.collectionLine === "limited-design") {
    const sub = product.subcategory?.toLowerCase();
    if (
      sub !== "limited-design" &&
      !product.limitedEdition &&
      !product.tags?.includes("limited-design")
    ) {
      return false;
    }
  }

  // Legacy flat slug matching (no gender prefix on navigation slug)
  if (parsed.legacyOnly && !parsed.gender && !parsed.collectionLine && parsed.productCategory) {
    const c = parsed.productCategory;
    return (
      product.category.toLowerCase() === c ||
      product.subcategory?.toLowerCase() === c ||
      product.tags?.some((t) => t.toLowerCase() === c) ||
      false
    );
  }

  return true;
}

function branchForGender(
  gender: "women" | "men",
  label: string,
  productCats: ProductCategoryOption[]
): Category {
  const heroKey =
    gender === "women" ? "womens-wear" : "mens-wear";

  const children: Category[] = [
  ...COLLECTION_SUBCATEGORIES.map((c) => ({
    slug: `${gender}-${c.slug}`,
    label: c.label,
    image: getCategoryHero(
      c.slug === "latest-drop" ? "occasion-wear" : "luxury-couture"
    ),
    caption:
      c.slug === "latest-drop"
        ? "New arrivals from the atelier"
        : "Small-batch limited runs",
  })),
  ...productCats.map((c) => ({
    slug: `${gender}-${c.slug}`,
    label: c.label,
    image: getCategoryHero(c.slug),
    caption: `${label} — ${c.label}`,
  })),
  ];

  return {
    slug: gender,
    label,
    image: getCategoryHero(heroKey),
    caption: `${label}'s designer edits and ceremony wear`,
    children,
  };
}

/** Top-level Men / Women browse tree for storefront + seed. */
export function buildBrowseCategoryTree(): Category[] {
  return [
    branchForGender("women", "Women", WOMEN_PRODUCT_CATEGORIES),
    branchForGender("men", "Men", MEN_PRODUCT_CATEGORIES),
  ];
}

export function findCategoryInTree(
  slug: string,
  nodes: Category[]
): Category | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    if (node.children?.length) {
      const nested = findCategoryInTree(slug, node.children);
      if (nested) return nested;
    }
  }
  return undefined;
}

/** Flatten navigable leaves (for homepage rails, quick links). */
export function flattenBrowseCategories(
  nodes: Category[],
  maxDepth = 2
): Category[] {
  const out: Category[] = [];
  const walk = (list: Category[], depth: number) => {
    for (const node of list) {
      if (depth > 0) out.push(node);
      if (node.children?.length && depth < maxDepth) {
        walk(node.children, depth + 1);
      }
    }
  };
  walk(nodes, 0);
  return out;
}
