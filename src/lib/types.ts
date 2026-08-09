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
  /** Phase 8 profile enrichment */
  designPhilosophy?: string;
  yearsExperience?: number;
  studioLocation?: string;
  awards?: string[];
  pressMentions?: { title: string; outlet: string; year?: string }[];
  editorialGallery?: string[];
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
  /** Optional lookbook / runway clips for the Universal Media Viewer */
  videos?: string[];
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
  /** Phase 8 numbered editions — e.g. total 100, sold 21 → #022 / 100 */
  editionTotal?: number;
  editionSold?: number;
  customizable?: boolean;     // Shows "Customize This Piece" button
  rating?: number;            // e.g. 4.8
  mrp?: number;               // original price for strikeout
  colors?: string[];          // color hex/name strings
  bestPrice?: number;         // e.g. best price value
  deliveryText?: string;      // e.g. "Delivery within 48 hours"
  careInstructions?: string;
  designerInspiration?: string;
  badges?: string[];
  editorsPick?: boolean;
  madeToOrder?: boolean;
  sustainable?: boolean;
  handcrafted?: boolean;
  recentPurchaseCount?: number;
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
  /** Optional lookbook video — opens in Universal Media Viewer */
  videoUrl?: string;
  /** When true, post is video-only (viewer has no image slides; card uses 9:16) */
  videoOnly?: boolean;
  caption: string;
  link: string;
  likesCount?: number;
  commentsCount?: number;
  likedByMe?: boolean;
  followingDesigner?: boolean;
  productTag?: {
    name: string;
    price: number;
    productId?: string;
  };
  allowLeads?: boolean;
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
  measurements?: Record<string, string>;
  referenceImages?: string[];
  budget?: number;
  occasion?: string;
  designerId?: string;
  productId?: string;
}

/** Phase 8 lookbook (seasonal / campaign / editorial) */
export interface LookbookData {
  id: string;
  designerId: string;
  title: string;
  slug: string;
  kind: "seasonal" | "collection" | "campaign" | "editorial";
  season?: string;
  coverImage: string;
  description?: string;
  items: {
    id: string;
    mediaUrl: string;
    mediaKind: "image" | "video";
    caption?: string;
    productId?: string;
  }[];
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

// ── Phase 9 Editorial & Discovery ────────
export interface EditorialCampaignData {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  heroImage: string;
  heroVideoUrl?: string;
  headline: string;
  body: string;
  badge?: string;
  featuredDesignerId?: string;
  featuredDesignerName?: string;
  ctaLabel?: string;
  ctaLink?: string;
  sortOrder?: number;
}

export interface EditorialCollectionData {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  coverImage: string;
  description?: string;
  curatorNotes?: string;
  sortOrder?: number;
  items: {
    id: string;
    productId: string;
    displayOrder: number;
    editorialNote?: string;
    product?: Product;
  }[];
}

export interface ArticleBlock {
  type: "heading" | "paragraph" | "image" | "quote" | "product_card";
  text?: string;
  imageUrl?: string;
  caption?: string;
  quoteAuthor?: string;
  productId?: string;
}

export interface EditorialArticleData {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage: string;
  contentJson: ArticleBlock[];
  authorName?: string;
  authorRole?: string;
  designerId?: string;
  designerName?: string;
  publishedAt?: string;
}

export type SectionTypeId =
  | "hero_campaign"
  | "designer_spotlight"
  | "editorial_collection"
  | "article_rail"
  | "lookbook_rail"
  | "limited_edition_shelf"
  | "editors_pick_shelf";

export interface FeaturedSectionData {
  id: string;
  title: string;
  subtitle?: string;
  type: SectionTypeId;
  targetSlug?: string;
  sortOrder: number;
  active: boolean;
}

// ── Phase 10 Atelier & Bespoke ──────────
export interface MeasurementProfileData {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  unit: "inches" | "cm";
  height?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  sleeve?: number;
  inseam?: number;
  neck?: number;
  notes?: string;
  createdAt?: string;
}

export interface AppointmentSlotData {
  id: string;
  designerId: string;
  designerName?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "virtual" | "studio_visit" | "phone";
  isAvailable: boolean;
}

export interface AppointmentRequestData {
  id: string;
  userId: string;
  userName?: string;
  designerId: string;
  designerName?: string;
  slotId?: string;
  preferredDate: string;
  preferredTime: string;
  appointmentType: "virtual" | "studio_visit" | "phone";
  purpose: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  statusNotes?: string;
  createdAt: string;
}

export interface BespokeAttachmentData {
  id: string;
  requestId: string;
  url: string;
  title?: string;
  type: "inspiration_image" | "sketch" | "fabric_reference" | "measurement_document";
  createdAt: string;
}

export interface BespokeMessageData {
  id: string;
  requestId: string;
  senderId: string;
  senderRole: "buyer" | "designer" | "system";
  senderName?: string;
  message: string;
  createdAt: string;
}

export interface BespokeRequestData {
  id: string;
  userId: string;
  userName?: string;
  designerId?: string;
  designerName?: string;
  productId?: string;
  productName?: string;
  category?: string;
  occasion?: string;
  budget?: number;
  deadline?: string;
  notes?: string;
  statusNotes?: string;
  measurementProfileId?: string;
  measurements?: Record<string, string | number>;
  referenceImages?: string[];
  attachments?: BespokeAttachmentData[];
  messages?: BespokeMessageData[];
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "accepted"
    | "in_production"
    | "ready"
    | "delivered"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
}

