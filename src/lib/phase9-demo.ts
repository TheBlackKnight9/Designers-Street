import type {
  EditorialCampaignData,
  EditorialCollectionData,
  EditorialArticleData,
  FeaturedSectionData,
} from "./types";

export const DEMO_CAMPAIGNS: EditorialCampaignData[] = [
  {
    id: "camp-1",
    title: "Atelier Residencies: The Spring '26 Prelude",
    slug: "spring-26-prelude",
    subtitle: "A Haute Couture Residency",
    heroImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
    heroVideoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    headline: "Architectural Lehengas & Fluid Silk Drapes",
    body: "Inside the Mumbai and Jaipur ateliers where silk yarn is hand-spun and zardozi needlework is executed with microscopic precision.",
    badge: "Cover Story",
    featuredDesignerId: "dh-1",
    featuredDesignerName: "MAISON RIVIÈRE",
    ctaLabel: "Explore Cover Story",
    ctaLink: "/editorial/spring-26-prelude",
    sortOrder: 1,
  },
];

export const DEMO_COLLECTIONS: EditorialCollectionData[] = [
  {
    id: "col-1",
    title: "Royal Heritage Lehengas",
    slug: "royal-heritage-lehengas",
    tagline: "Heirloom weight Kanchipuram & Banarasi weaves",
    coverImage:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
    description:
      "Curated bridal and ceremonial ensembles featuring 24k gold zari wire work.",
    curatorNotes:
      "Selected by Senior Fashion Director for heritage craft authenticity.",
    sortOrder: 1,
    items: [
      {
        id: "col-item-1",
        productId: "prod-1",
        displayOrder: 0,
        editorialNote: "Hand-worked zardozi velvet border",
      },
      {
        id: "col-item-2",
        productId: "prod-2",
        displayOrder: 1,
        editorialNote: "Sculptural corset silk blouse",
      },
    ],
  },
  {
    id: "col-2",
    title: "Cocktail Drapes & Modern Sari Edit",
    slug: "cocktail-drapes-modern-sari",
    tagline: "Fluid silhouettes for evening galas",
    coverImage:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&q=80",
    description: "Pre-stitched silk chiffon sarees and draped cocktail gowns.",
    curatorNotes: "Modern movement meets traditional drape aesthetics.",
    sortOrder: 2,
    items: [
      {
        id: "col-item-3",
        productId: "prod-3",
        displayOrder: 0,
        editorialNote: "Asymmetric organza trail",
      },
      {
        id: "col-item-4",
        productId: "prod-4",
        displayOrder: 1,
        editorialNote: "Metallic bugle bead fringe",
      },
    ],
  },
];

export const DEMO_ARTICLES: EditorialArticleData[] = [
  {
    id: "art-1",
    title: "Inside Kishangarh: The Lost Indigo Mastercraft",
    slug: "lost-indigo-mastercraft",
    category: "Craft & Origin",
    excerpt:
      "How master artisan Sunder Lal preserves 300-year-old natural dye baths in Rajasthan.",
    coverImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
    contentJson: [
      {
        type: "paragraph",
        text: "In a quiet atelier tucked inside Kishangarh, Rajasthan, natural indigo vats ferment under copper lids. Master weaver Sunder Lal has spent four decades refining lac dye techniques handed down across six generations.",
      },
      {
        type: "quote",
        text: "True luxury is not speed; it is patience woven into thread.",
        quoteAuthor: "Sunder Lal, Master Artisan",
      },
      {
        type: "heading",
        text: "The 14-Step Resist Printing Process",
      },
      {
        type: "paragraph",
        text: "Each yard of fabric undergoes hand-block mud printing before dipping into indigo vats up to eight times for deep cobalt tones.",
      },
      {
        type: "product_card",
        productId: "prod-5",
      },
    ],
    authorName: "Ananya Sharma",
    authorRole: "Fashion Director",
    designerId: "dh-2",
    designerName: "KISHANGARH",
    publishedAt: "2026-07-28T10:00:00.000Z",
  },
  {
    id: "art-2",
    title: "The Architecture of Cashmere Opera Coats",
    slug: "architecture-cashmere-opera-coats",
    category: "Atelier Visit",
    excerpt:
      "Sculptural evening coats engineered from 100% hand-loomed Kashmir pashmina.",
    coverImage:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80",
    contentJson: [
      {
        type: "paragraph",
        text: "When Pashmina Opera premiered in Paris, critics noted the seamless shoulder construction. Each opera coat takes 180 hours of hand needlework.",
      },
      {
        type: "product_card",
        productId: "prod-7",
      },
    ],
    authorName: "Marcus Vance",
    authorRole: "Senior Editor",
    designerId: "dh-3",
    designerName: "PASHMINA OPERA",
    publishedAt: "2026-07-25T10:00:00.000Z",
  },
];

export const DEMO_FEATURED_SECTIONS: FeaturedSectionData[] = [
  {
    id: "sec-1",
    title: "Spring '26 Cover Story",
    subtitle: "Haute Couture Residency",
    type: "hero_campaign",
    targetSlug: "spring-26-prelude",
    sortOrder: 1,
    active: true,
  },
  {
    id: "sec-2",
    title: "House Spotlight",
    subtitle: "Maison Rivière Atelier",
    type: "designer_spotlight",
    targetSlug: "maison-riviere",
    sortOrder: 2,
    active: true,
  },
  {
    id: "sec-3",
    title: "Curated Collections",
    subtitle: "Seasonal Curation",
    type: "editorial_collection",
    targetSlug: "royal-heritage-lehengas",
    sortOrder: 3,
    active: true,
  },
  {
    id: "sec-4",
    title: "Magazine Features",
    subtitle: "Craft & Atelier Residencies",
    type: "article_rail",
    sortOrder: 4,
    active: true,
  },
  {
    id: "sec-5",
    title: "Campaign Lookbooks",
    subtitle: "Runway & Lookbook Reels",
    type: "lookbook_rail",
    sortOrder: 5,
    active: true,
  },
  {
    id: "sec-6",
    title: "Limited Editions & Serialized Releases",
    subtitle: "Numbered Atelier Pieces",
    type: "limited_edition_shelf",
    sortOrder: 6,
    active: true,
  },
  {
    id: "sec-7",
    title: "Editor's Choice",
    subtitle: "Handpicked by Designers' Street Curation Team",
    type: "editors_pick_shelf",
    sortOrder: 7,
    active: true,
  },
];
