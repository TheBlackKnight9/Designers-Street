/**
 * Curated editorial fashion stills — category-tagged for Designer's Street.
 * All photo IDs verified against images.unsplash.com (404-safe).
 * Replace with Cloudinary / atelier uploads in production.
 */

export type CategoryMedia = {
  primary: string;
  alt: string;
  hero: string;
};

const u = (photoId: string, width: number) =>
  `https://images.unsplash.com/photo-${photoId}?w=${width}&q=85&auto=format&fit=crop`;

/** Category-keyed modern designer / editorial imagery */
export const CATEGORY_MEDIA: Record<string, CategoryMedia> = {
  sarees: {
    primary: u("1610030469983-98e550d6193c", 1200), // Banarasi / Kanjivaram silk saree in crimson & gold
    alt: u("1583391733956-3750e0ff4e8b", 800),
    hero: u("1610030469983-98e550d6193c", 1600),
  },
  lehengas: {
    primary: u("1583391733956-3750e0ff4e8b", 1200), // Royal bridal zardozi lehenga
    alt: u("1594938298603-c8148c4dae35", 800),
    hero: u("1583391733956-3750e0ff4e8b", 1600),
  },
  kurtas: {
    primary: u("1581044777550-4cfa60707c03", 1200), // Heritage silk kurta ensemble
    alt: u("1558769132-cb1aea458c5e", 800),
    hero: u("1581044777550-4cfa60707c03", 1600),
  },
  sherwanis: {
    primary: u("1507679799987-c73779587ccf", 1200), // Regal royal menswear / bandhgala
    alt: u("1602810318383-e386cc2a3ccf", 800),
    hero: u("1507679799987-c73779587ccf", 1600),
  },
  dresses: {
    primary: u("1595777457583-95e059d581b8", 1200), // Luxury evening dress
    alt: u("1539008835657-9e8e9680c956", 800),
    hero: u("1595777457583-95e059d581b8", 1600),
  },
  gowns: {
    primary: u("1539008835657-9e8e9680c956", 1200), // Haute couture gown
    alt: u("1496747611176-843222e1e57c", 800),
    hero: u("1539008835657-9e8e9680c956", 1600),
  },
  "indo-western": {
    primary: u("1483985988355-763728e1935b", 1200), // Indo-Western fusion couture
    alt: u("1469334031218-e382a71b716b", 800),
    hero: u("1483985988355-763728e1935b", 1600),
  },
  bridal: {
    primary: u("1583391733956-3750e0ff4e8b", 1200), // Grand bridal couture
    alt: u("1610030469983-98e550d6193c", 800),
    hero: u("1583391733956-3750e0ff4e8b", 1600),
  },
  "mens-wear": {
    primary: u("1507679799987-c73779587ccf", 1200), // Royal menswear
    alt: u("1558769132-cb1aea458c5e", 800),
    hero: u("1507679799987-c73779587ccf", 1600),
  },
  "womens-wear": {
    primary: u("1610030469983-98e550d6193c", 1200), // Designer womenswear
    alt: u("1583391733956-3750e0ff4e8b", 800),
    hero: u("1610030469983-98e550d6193c", 1600),
  },
  kids: {
    primary: u("1519238263530-99bdd11df2ea", 1200),
    alt: u("1519238263530-99bdd11df2ea", 800),
    hero: u("1519238263530-99bdd11df2ea", 1600),
  },
  jewellery: {
    primary: u("1515562141207-7a88fb7ce338", 1200), // Polki & Kundan fine jewellery
    alt: u("1599643478518-a784e5dc4c8f", 800),
    hero: u("1515562141207-7a88fb7ce338", 1600),
  },
  bags: {
    primary: u("1584917865442-de89df76afd3", 1200), // Designer evening clutch / minaudière
    alt: u("1566150905458-1bf1fc113f0d", 800),
    hero: u("1584917865442-de89df76afd3", 1600),
  },
  footwear: {
    primary: u("1552346154-21d32810aba3", 1200), // Luxury designer sneakers
    alt: u("1549298916-b41d501d3772", 800),
    hero: u("1552346154-21d32810aba3", 1600),
  },
  accessories: {
    primary: u("1611652022419-a9419f74343d", 1200),
    alt: u("1558171813-1c088753a7f8", 800),
    hero: u("1611652022419-a9419f74343d", 1600),
  },
  sustainable: {
    primary: u("1594938298603-c8148c4dae35", 1200),
    alt: u("1558171813-1c088753a7f8", 800),
    hero: u("1594938298603-c8148c4dae35", 1600),
  },
  "luxury-couture": {
    primary: u("1583391733956-3750e0ff4e8b", 1200),
    alt: u("1610030469983-98e550d6193c", 800),
    hero: u("1583391733956-3750e0ff4e8b", 1600),
  },
  streetwear: {
    primary: u("1552346154-21d32810aba3", 1200), // Luxury designer sneakers & streetwear
    alt: u("1549298916-b41d501d3772", 800),
    hero: u("1552346154-21d32810aba3", 1600),
  },
  "occasion-wear": {
    primary: u("1583391733956-3750e0ff4e8b", 1200),
    alt: u("1595777457583-95e059d581b8", 800),
    hero: u("1583391733956-3750e0ff4e8b", 1600),
  },
  "latest-drops": {
    primary: u("1552346154-21d32810aba3", 1200),
    alt: u("1610030469983-98e550d6193c", 800),
    hero: u("1552346154-21d32810aba3", 1600),
  },
  "jewellery-accessories": {
    primary: u("1515562141207-7a88fb7ce338", 1200),
    alt: u("1611652022419-a9419f74343d", 800),
    hero: u("1515562141207-7a88fb7ce338", 1600),
  },
};

export const DEFAULT_CATEGORY = "luxury-couture";

export const ATELIER_PLACEHOLDER = CATEGORY_MEDIA[DEFAULT_CATEGORY].primary;

export const DESIGNER_LOGOS = [
  u("1618220179428-22790b461013", 200),
  u("1490481651871-ab68de25d43d", 200),
  u("1583391733956-3750e0ff4e8b", 200),
  u("1558171813-1c088753a7f8", 200),
  u("1560472354-b33ff0c44a43", 200),
];

/** Maps browse slugs (men, women-sarees, latest-drop) → CATEGORY_MEDIA keys */
const IMAGE_KEY_ALIASES: Record<string, string> = {
  men: "mens-wear",
  women: "womens-wear",
  "latest-drop": "occasion-wear",
  "limited-design": "luxury-couture",
  "limited-edition": "luxury-couture",
};

/** Default primary category when a house has no product yet */
export const DESIGNER_DEFAULT_CATEGORY: Record<string, string> = {
  "dh-1": "lehengas",
  "dh-2": "kurtas",
  "dh-3": "luxury-couture",
  "dh-4": "sherwanis",
  "dh-5": "sarees",
  "dh-6": "dresses",
  "dh-7": "streetwear",
  "dh-8": "sarees",
  "dh-9": "dresses",
  "dh-10": "sherwanis",
  "dh-11": "kurtas",
  "dh-12": "lehengas",
  "dh-13": "mens-wear",
  "dh-14": "jewellery",
  "dh-15": "sarees",
  "dh-16": "kids",
  "dh-17": "gowns",
  "dh-18": "kurtas",
  "dh-19": "gowns",
  "dh-20": "footwear",
  "dh-21": "bags",
  "dh-22": "bridal",
  "dh-23": "streetwear",
  "dh-24": "womens-wear",
  "dh-25": "bridal",
  "dh-26": "indo-western",
  "dh-27": "occasion-wear",
  "dh-28": "sherwanis",
  "dh-29": "kids",
  "dh-30": "streetwear",
};

export function resolveCategoryImageKey(slug?: string | null): string {
  if (!slug) return DEFAULT_CATEGORY;

  let key = slug.toLowerCase().trim().replace(/\s+/g, "-");
  if (IMAGE_KEY_ALIASES[key]) return IMAGE_KEY_ALIASES[key];
  if (CATEGORY_MEDIA[key]) return key;

  key = key.replace(/^(women|men)-/, "");
  if (IMAGE_KEY_ALIASES[key]) return IMAGE_KEY_ALIASES[key];
  if (CATEGORY_MEDIA[key]) return key;

  return DEFAULT_CATEGORY;
}

export function normalizeCategorySlug(slug?: string | null): string {
  return resolveCategoryImageKey(slug);
}

export function getCategoryMedia(slug?: string | null): CategoryMedia {
  return CATEGORY_MEDIA[resolveCategoryImageKey(slug)];
}

export function getCategoryHero(slug?: string | null): string {
  return getCategoryMedia(slug).hero;
}

export function getCategoryPrimary(slug?: string | null): string {
  return getCategoryMedia(slug).primary;
}

export function getProductImagesForCategory(slug?: string | null): [string, string] {
  const media = getCategoryMedia(slug);
  return [media.primary, media.alt];
}

export function getDesignerLogo(index: number): string {
  return DESIGNER_LOGOS[index % DESIGNER_LOGOS.length];
}

/** Resolve a stored category image URL, falling back to slug-based hero. */
export function resolveCategoryImageUrl(
  slug: string,
  storedUrl?: string | null
): string {
  const fallback = getCategoryHero(slug);
  if (!storedUrl || storedUrl.trim() === "" || storedUrl === "na") return fallback;

  const clean = storedUrl.trim();
  if (
    clean.startsWith("/") ||
    clean.startsWith("http://") ||
    clean.startsWith("https://")
  ) {
    return clean;
  }
  return fallback;
}
