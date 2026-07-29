/* ──────────────────────────────────────
   Designer's Street — TypeScript Types
   Mobile-First Luxury App
   ────────────────────────────────────── */

// ── Designer House (replaces Brand) ──────
export interface DesignerHouse {
  id: string;
  name: string;
  handle: string;             // URL-safe slug
  logo: string;
  banner: string;
  bio: string;                // One-line tagline
  foundingStory: string;      // 3–5 sentence narrative
  founded?: string;
  location: string;
  signatureTechniques: string[];
  verified: boolean;
  exclusive?: boolean;        // "Exclusive to Designer's Street"
  offersBespoke?: boolean;
  followersCount?: string;    // e.g. "42.8K"
  followingCount?: string;    // e.g. "18"
  postsCount?: number;        // e.g. 24
  website?: string;           // e.g. "www.antigravity.design"
}

// ── Product ──────────────────────────────
export interface Product {
  id: string;
  name: string;
  designerName: string;       // Display name
  designerId: string;         // Links to DesignerHouse.id
  price: number;
  category: string;           // Freeform: "lehengas", "kurtas", "sarees", etc.
  subcategory?: string;       // e.g. "bridal", "cocktail"
  gender: "men" | "women" | "unisex";
  images: string[];
  sizes: string[];
  description: string;
  story?: string;
  craftOrigin?: string;
  material?: string;
  technique?: string;
  fit?: string;
  occasion?: string;          // "Bridal", "Cocktail", "Festive", "Everyday"
  tags?: string[];
  verified?: boolean;
  piecesRemaining?: number;   // For "Limited to N pieces" badge
  limitedEdition?: boolean;
  customizable?: boolean;     // Shows "Customize This Piece" button
  rating?: number;            // e.g. 4.8
  mrp?: number;               // original price for strikeout
  colors?: string[];          // color hex/name strings
  bestPrice?: number;         // e.g. best price value
  deliveryText?: string;      // e.g. "Delivery within 48 hours"
}

// ── Category Tree ────────────────────────
export interface Category {
  slug: string;
  label: string;
  image: string;              // Editorial poster image
  caption?: string;           // Feed caption text
  children?: Category[];
}

// ── Story (Instagram-style) ──────────────
export interface StoryItem {
  id: string;
  designerId: string;
  designerName: string;
  designerLogo: string;
  label: string;              // "Just Landed", "Bridal '26", etc.
  slides: StorySlide[];
  seen?: boolean;
}

export interface StorySlide {
  image: string;
  caption?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

// ── Feed Post ────────────────────────────
export interface FeedPostData {
  id: string;
  type: "category" | "designer-spotlight";
  // Category post fields
  categorySlug?: string;
  // Designer spotlight fields
  designerId?: string;
  // Shared
  designerName: string;
  designerLogo: string;
  designerVerified: boolean;
  tag?: string;               // "New Drop", "Exclusive Edit", "Private Sale"
  image: string;
  caption: string;
  link: string;
  likesCount?: number;
  productTag?: {
    name: string;
    price: number;
    productId?: string;
  };
}

// ── Cart ─────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}

// ── Bespoke Config ───────────────────────
export interface BespokeConfig {
  baseDesign?: string;
  fabric?: string;
  color?: string;
  embellishment?: string;
  size?: string;
  measurementSessionBooked?: boolean;
  notes?: string;
}

// ── Filter State ─────────────────────────
export interface FilterState {
  category?: string;
  subcategory?: string;
  designer?: string;
  occasion?: string;
  fabric?: string;
  size?: string;
  priceRange?: [number, number];
}
