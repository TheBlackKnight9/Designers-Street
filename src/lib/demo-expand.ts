/**
 * Demo marketplace expansion — designers, products, reels, stories.
 * Merged into mock-data exports; seeded via prisma/seed.ts.
 * Reuses local FASHION_VIDEOS + Unsplash editorial stills.
 */
import type {
  DesignerHouse,
  Product,
  Category,
  StoryItem,
  FeedPostData,
} from "./types";
import { ALL_FASHION_VIDEO_URLS, pickFashionVideos } from "./fashion-videos";
import { buildBrowseCategoryTree } from "./category-tree";
import { getCategoryHero, getCategoryPrimary, getDesignerLogo, getProductImagesForCategory } from "./fashion-images";
import { getDesignerUrl } from "./routes";

const IMG = {
  bridal: getCategoryPrimary("bridal"),
  gown: getCategoryPrimary("gowns"),
  saree: getCategoryPrimary("sarees"),
  textile: getCategoryPrimary("kurtas"),
  mens: getCategoryPrimary("mens-wear"),
  jacket: getCategoryPrimary("indo-western"),
  street: getCategoryPrimary("streetwear"),
  coat: getCategoryPrimary("mens-wear"),
  minimal: getCategoryPrimary("indo-western"),
  atelier: getCategoryHero("luxury-couture"),
  jewelry: getCategoryPrimary("jewellery"),
  bag: getCategoryPrimary("bags"),
  shoes: getCategoryPrimary("footwear"),
  kids: getCategoryPrimary("kids"),
  logo: getDesignerLogo(0),
  logo2: getDesignerLogo(1),
  logo3: getDesignerLogo(2),
  logo4: getDesignerLogo(3),
  logo5: getDesignerLogo(4),
};

const VIDEO_CYCLE = ALL_FASHION_VIDEO_URLS;

function vid(i: number) {
  return VIDEO_CYCLE[i % VIDEO_CYCLE.length];
}

function vids(i: number): string[] {
  return pickFashionVideos(3, i);
}

/** Flat browse categories — unique slugs, no empty product states after seed. */
/** Flat browse categories — gender roots with sub-edits (Men / Women). */
export const BROWSE_CATEGORIES: Category[] = buildBrowseCategoryTree();

type HouseDef = {
  id: string;
  name: string;
  handle: string;
  location: string;
  bio: string;
  founded: string;
  techniques: string[];
  verified: boolean;
  exclusive?: boolean;
  followers: string;
  following: string;
  logo: string;
  banner: string;
};

const HOUSE_DEFS: HouseDef[] = [
  { id: "dh-8", name: "LUMINA BANARAS", handle: "lumina-banaras", location: "Varanasi, India", bio: "Banarasi weaves lit for evening ceremonies.", founded: "2011", techniques: ["Banarasi Brocade", "Kadwa Weave"], verified: true, exclusive: true, followers: "28.4K", following: "42", logo: IMG.logo, banner: IMG.saree },
  { id: "dh-9", name: "SABLE & CO.", handle: "sable-and-co", location: "London / Delhi", bio: "Indo-British eveningwear in charcoal and ivory.", founded: "2016", techniques: ["Bias Cut", "Hand Beading"], verified: true, followers: "19.2K", following: "61", logo: IMG.logo2, banner: IMG.minimal },
  { id: "dh-10", name: "MEHRAB TAILORS", handle: "mehrab-tailors", location: "Hyderabad, India", bio: "Sherwanis drafted like suits.", founded: "2009", techniques: ["Canvas Construction", "Hand Pad Stitching"], verified: true, exclusive: true, followers: "33.1K", following: "27", logo: IMG.logo3, banner: IMG.mens },
  { id: "dh-11", name: "PETAL & REED", handle: "petal-and-reed", location: "Kochi, India", bio: "Sustainable festivewear from natural fibres.", founded: "2019", techniques: ["Natural Dye", "Zero-Waste Pattern"], verified: true, followers: "14.7K", following: "88", logo: IMG.logo4, banner: IMG.textile },
  { id: "dh-12", name: "GOLDTHREAD ATELIER", handle: "goldthread-atelier", location: "Lucknow, India", bio: "Chikankari elevated to couture scale.", founded: "2005", techniques: ["Chikankari", "Mukaish"], verified: true, exclusive: true, followers: "41.0K", following: "19", logo: IMG.logo5, banner: IMG.bridal },
  { id: "dh-13", name: "NORTHLINE", handle: "northline", location: "Chandigarh, India", bio: "Minimal menswear for north winters.", founded: "2017", techniques: ["Wool Tailoring", "Soft Structure"], verified: true, followers: "11.5K", following: "54", logo: IMG.logo, banner: IMG.coat },
  { id: "dh-14", name: "AURUM HOUSE", handle: "aurum-house", location: "Ahmedabad, India", bio: "Bridal jewellery and metal embroidery.", founded: "2014", techniques: ["Kundan", "Polki Setting"], verified: true, exclusive: true, followers: "52.3K", following: "33", logo: IMG.logo2, banner: IMG.jewelry },
  { id: "dh-15", name: "DRAPE THEORY", handle: "drape-theory", location: "Pune, India", bio: "Saree drapes engineered for movement.", founded: "2018", techniques: ["Pleat Engineering", "Pre-Drape Sets"], verified: true, followers: "22.8K", following: "70", logo: IMG.logo3, banner: IMG.saree },
  { id: "dh-16", name: "LITTLE HAVELI", handle: "little-haveli", location: "Udaipur, India", bio: "Kids festivewear with adult craft standards.", founded: "2020", techniques: ["Soft Embroidery", "Breathable Linings"], verified: true, followers: "9.4K", following: "45", logo: IMG.logo4, banner: IMG.kids },
  { id: "dh-17", name: "FORM STUDIO", handle: "form-studio", location: "Singapore", bio: "Architectural evening dresses.", founded: "2015", techniques: ["Bonded Seams", "Contour Panels"], verified: true, exclusive: true, followers: "31.6K", following: "22", logo: IMG.logo5, banner: IMG.gown },
  { id: "dh-18", name: "INDIGO FIELD", handle: "indigo-field", location: "Bagru, India", bio: "Handloom indigo for city wardrobes.", founded: "2013", techniques: ["Vat Indigo", "Handloom"], verified: true, followers: "17.9K", following: "96", logo: IMG.logo, banner: IMG.textile },
  { id: "dh-19", name: "VELVET LINEAGE", handle: "velvet-lineage", location: "Kolkata, India", bio: "Evening velvet and silk columns.", founded: "2010", techniques: ["Velvet Cutting", "Silk Lining"], verified: true, exclusive: true, followers: "26.2K", following: "38", logo: IMG.logo2, banner: IMG.gown },
  { id: "dh-20", name: "RAAH FOOTWEAR", handle: "raah-footwear", location: "Agra, India", bio: "Handcrafted juttis and evening flats.", founded: "2007", techniques: ["Hand Lasting", "Zari Upper"], verified: true, followers: "13.3K", following: "51", logo: IMG.logo3, banner: IMG.shoes },
  { id: "dh-21", name: "CLUTCH & KEY", handle: "clutch-and-key", location: "Mumbai, India", bio: "Evening bags for couture houses.", founded: "2016", techniques: ["Beaded Frame", "Silk Finish"], verified: false, followers: "8.1K", following: "120", logo: IMG.logo4, banner: IMG.bag },
  { id: "dh-22", name: "MONSOON COUTURE", handle: "monsoon-couture", location: "Goa, India", bio: "Resort bridal and destination wear.", founded: "2019", techniques: ["Light Embroidery", "Breathable Silks"], verified: true, followers: "20.5K", following: "64", logo: IMG.logo5, banner: IMG.bridal },
  { id: "dh-23", name: "GRID & THREAD", handle: "grid-and-thread", location: "Berlin / Mumbai", bio: "Genderless street-luxury hybrids.", founded: "2021", techniques: ["Technical Jersey", "Laser Cut"], verified: true, exclusive: true, followers: "36.7K", following: "29", logo: IMG.logo, banner: IMG.street },
  { id: "dh-24", name: "SAFFRON ARCHIVE", handle: "saffron-archive", location: "Amritsar, India", bio: "Phulkari reimagined as outerwear.", founded: "2012", techniques: ["Phulkari", "Wool Base"], verified: true, followers: "15.8K", following: "77", logo: IMG.logo2, banner: IMG.coat },
  { id: "dh-25", name: "IVORY PAVILION", handle: "ivory-pavilion", location: "Jaipur, India", bio: "Ivory bridal ensembles with soft structure.", founded: "2008", techniques: ["Ivory Silk", "Pearl Work"], verified: true, exclusive: true, followers: "48.9K", following: "16", logo: IMG.logo3, banner: IMG.bridal },
  { id: "dh-26", name: "CUTTING ROOM", handle: "cutting-room", location: "Milan / Delhi", bio: "Indo-western tailoring for receptions.", founded: "2014", techniques: ["Italian Wool", "Fusion Draft"], verified: true, followers: "24.0K", following: "58", logo: IMG.logo4, banner: IMG.jacket },
  { id: "dh-27", name: "LOTUS & LAMP", handle: "lotus-and-lamp", location: "Pondicherry, India", bio: "Occasion wear dyed in botanical baths.", founded: "2020", techniques: ["Botanical Dye", "Hand Finish"], verified: true, followers: "10.2K", following: "83", logo: IMG.logo5, banner: IMG.textile },
  { id: "dh-28", name: "OBSIDIAN MENS", handle: "obsidian-mens", location: "Gurugram, India", bio: "Black-tie and bandhgala essentials.", founded: "2017", techniques: ["Midnight Wool", "Mother-of-Pearl"], verified: true, followers: "18.6K", following: "41", logo: IMG.logo, banner: IMG.mens },
  { id: "dh-29", name: "SILK ROAD KIDS", handle: "silk-road-kids", location: "Surat, India", bio: "Miniature sherwanis and lehenga sets.", founded: "2018", techniques: ["Soft Zari", "Child Fit Blocks"], verified: true, followers: "7.8K", following: "55", logo: IMG.logo2, banner: IMG.kids },
  { id: "dh-30", name: "AETHER LINE", handle: "aether-line", location: "Seoul / Bangalore", bio: "Ultra-light street couture.", founded: "2022", techniques: ["Ripstop Silk", "Modular Layering"], verified: true, exclusive: true, followers: "29.4K", following: "34", logo: IMG.logo3, banner: IMG.street },
];

export const EXPANDED_DESIGNERS: DesignerHouse[] = HOUSE_DEFS.map((h) => ({
  id: h.id,
  name: h.name,
  handle: h.handle,
  location: h.location,
  bio: h.bio,
  foundingStory: `${h.name} was founded in ${h.founded} in ${h.location}. ${h.bio} The atelier works in small batches with signature techniques: ${h.techniques.join(", ")}.`,
  founded: h.founded,
  signatureTechniques: h.techniques,
  verified: h.verified,
  exclusive: h.exclusive ?? false,
  offersBespoke: true,
  followersCount: h.followers,
  followingCount: h.following,
  postsCount: 8 + (Number(h.id.replace("dh-", "")) % 12),
  logo: h.logo,
  banner: h.banner,
}));

type ProdSpec = {
  n: number;
  name: string;
  designerId: string;
  designerName: string;
  category: string;
  subcategory?: string;
  gender: "men" | "women" | "unisex";
  price: number;
  image: string;
  occasion: string;
  tags: string[];
};

const PROD_SPECS: ProdSpec[] = [
  // Ensure every browse category has ≥2 products
  { n: 16, name: "Lumina Banarasi Saree — Ember Border", designerId: "dh-8", designerName: "LUMINA BANARAS", category: "sarees", subcategory: "banarasi", gender: "women", price: 98000, image: IMG.saree, occasion: "Festive", tags: ["sarees", "banarasi"] },
  { n: 17, name: "Drape Theory Pre-Pleat Saree — Mist", designerId: "dh-15", designerName: "DRAPE THEORY", category: "sarees", gender: "women", price: 72000, image: IMG.saree, occasion: "Cocktail", tags: ["sarees", "contemporary"] },
  { n: 18, name: "Ivory Pavilion Bridal Lehenga — Pearl Tide", designerId: "dh-25", designerName: "IVORY PAVILION", category: "lehengas", subcategory: "bridal", gender: "women", price: 310000, image: IMG.bridal, occasion: "Bridal", tags: ["lehengas", "bridal"] },
  { n: 19, name: "Goldthread Reception Lehenga — Soft Ivory", designerId: "dh-12", designerName: "GOLDTHREAD ATELIER", category: "lehengas", subcategory: "cocktail", gender: "women", price: 188000, image: IMG.bridal, occasion: "Reception", tags: ["lehengas", "chikankari"] },
  { n: 20, name: "Indigo Field Kurta Set — Night Vine", designerId: "dh-18", designerName: "INDIGO FIELD", category: "kurtas", gender: "unisex", price: 28000, image: IMG.textile, occasion: "Everyday", tags: ["kurtas", "sustainable"] },
  { n: 21, name: "Petal & Reed Linen Kurta — Clay", designerId: "dh-11", designerName: "PETAL & REED", category: "kurtas", gender: "women", price: 22000, image: IMG.textile, occasion: "Festive", tags: ["kurtas", "sustainable"] },
  { n: 22, name: "Mehrab Sherwani — Graphite Canvas", designerId: "dh-10", designerName: "MEHRAB TAILORS", category: "sherwanis", subcategory: "bridal", gender: "men", price: 145000, image: IMG.mens, occasion: "Bridal", tags: ["sherwanis", "mens-wear"] },
  { n: 23, name: "Obsidian Bandhgala — Absolute Black", designerId: "dh-28", designerName: "OBSIDIAN MENS", category: "sherwanis", gender: "men", price: 92000, image: IMG.mens, occasion: "Cocktail", tags: ["sherwanis", "mens-wear"] },
  { n: 24, name: "Form Studio Column Dress — Smoke", designerId: "dh-17", designerName: "FORM STUDIO", category: "dresses", gender: "women", price: 86000, image: IMG.gown, occasion: "Cocktail", tags: ["dresses", "womens-wear"] },
  { n: 25, name: "Sable Day Dress — Ivory Seam", designerId: "dh-9", designerName: "SABLE & CO.", category: "dresses", gender: "women", price: 64000, image: IMG.minimal, occasion: "Everyday", tags: ["dresses"] },
  { n: 26, name: "Velvet Lineage Evening Gown — Merlot", designerId: "dh-19", designerName: "VELVET LINEAGE", category: "gowns", gender: "women", price: 210000, image: IMG.gown, occasion: "Cocktail", tags: ["gowns", "luxury-couture"] },
  { n: 27, name: "Form Studio Gown — Contour Ivory", designerId: "dh-17", designerName: "FORM STUDIO", category: "gowns", gender: "women", price: 175000, image: IMG.gown, occasion: "Reception", tags: ["gowns"] },
  { n: 28, name: "Cutting Room Reception Suit — Sand", designerId: "dh-26", designerName: "CUTTING ROOM", category: "indo-western", gender: "men", price: 78000, image: IMG.jacket, occasion: "Reception", tags: ["indo-western", "mens-wear"] },
  { n: 29, name: "Sable Co-ord — Charcoal Drape", designerId: "dh-9", designerName: "SABLE & CO.", category: "indo-western", gender: "women", price: 69000, image: IMG.minimal, occasion: "Cocktail", tags: ["indo-western", "womens-wear"] },
  { n: 30, name: "Monsoon Destination Bridal Set", designerId: "dh-22", designerName: "MONSOON COUTURE", category: "bridal", gender: "women", price: 265000, image: IMG.bridal, occasion: "Bridal", tags: ["bridal", "lehengas"] },
  { n: 31, name: "Ivory Pavilion Trousseau Cape", designerId: "dh-25", designerName: "IVORY PAVILION", category: "bridal", gender: "women", price: 98000, image: IMG.bridal, occasion: "Bridal", tags: ["bridal"] },
  { n: 32, name: "Northline Winter Coat — Ash", designerId: "dh-13", designerName: "NORTHLINE", category: "mens-wear", gender: "men", price: 54000, image: IMG.coat, occasion: "Everyday", tags: ["mens-wear", "coats"] },
  { n: 33, name: "Obsidian Dinner Jacket", designerId: "dh-28", designerName: "OBSIDIAN MENS", category: "mens-wear", gender: "men", price: 68000, image: IMG.mens, occasion: "Cocktail", tags: ["mens-wear"] },
  { n: 34, name: "Lotus & Lamp Festive Set — Saffron Mist", designerId: "dh-27", designerName: "LOTUS & LAMP", category: "womens-wear", gender: "women", price: 42000, image: IMG.textile, occasion: "Festive", tags: ["womens-wear", "occasion-wear"] },
  { n: 35, name: "Velvet Lineage Day Coat", designerId: "dh-19", designerName: "VELVET LINEAGE", category: "womens-wear", gender: "women", price: 88000, image: IMG.coat, occasion: "Everyday", tags: ["womens-wear"] },
  { n: 36, name: "Little Haveli Festive Kurta — Coral", designerId: "dh-16", designerName: "LITTLE HAVELI", category: "kids", gender: "unisex", price: 12000, image: IMG.kids, occasion: "Festive", tags: ["kids"] },
  { n: 37, name: "Silk Road Kids Mini Lehenga", designerId: "dh-29", designerName: "SILK ROAD KIDS", category: "kids", gender: "women", price: 18000, image: IMG.kids, occasion: "Bridal", tags: ["kids", "bridal"] },
  { n: 38, name: "Aurum Polki Necklace — Moon Cascade", designerId: "dh-14", designerName: "AURUM HOUSE", category: "jewellery", gender: "women", price: 240000, image: IMG.jewelry, occasion: "Bridal", tags: ["jewellery", "bridal"] },
  { n: 39, name: "Aurum Statement Earrings — Lotus", designerId: "dh-14", designerName: "AURUM HOUSE", category: "jewellery", gender: "women", price: 86000, image: IMG.jewelry, occasion: "Cocktail", tags: ["jewellery"] },
  { n: 40, name: "Clutch & Key Frame Bag — Midnight", designerId: "dh-21", designerName: "CLUTCH & KEY", category: "bags", gender: "unisex", price: 32000, image: IMG.bag, occasion: "Cocktail", tags: ["bags", "accessories"] },
  { n: 41, name: "Clutch & Key Beaded Minaudière", designerId: "dh-21", designerName: "CLUTCH & KEY", category: "bags", gender: "women", price: 41000, image: IMG.bag, occasion: "Bridal", tags: ["bags"] },
  { n: 42, name: "Raah Zari Jutti — Antique Gold", designerId: "dh-20", designerName: "RAAH FOOTWEAR", category: "footwear", gender: "unisex", price: 14000, image: IMG.shoes, occasion: "Festive", tags: ["footwear"] },
  { n: 43, name: "Raah Evening Flat — Ivory Silk", designerId: "dh-20", designerName: "RAAH FOOTWEAR", category: "footwear", gender: "women", price: 16000, image: IMG.shoes, occasion: "Bridal", tags: ["footwear", "bridal"] },
  { n: 44, name: "Saffron Archive Embroidered Dupatta", designerId: "dh-24", designerName: "SAFFRON ARCHIVE", category: "accessories", gender: "women", price: 24000, image: IMG.textile, occasion: "Festive", tags: ["accessories"] },
  { n: 45, name: "Aurum Waist Belt — Soft Gold", designerId: "dh-14", designerName: "AURUM HOUSE", category: "accessories", gender: "women", price: 38000, image: IMG.jewelry, occasion: "Bridal", tags: ["accessories", "jewellery"] },
  { n: 46, name: "Petal & Reed Zero-Waste Jacket", designerId: "dh-11", designerName: "PETAL & REED", category: "sustainable", gender: "unisex", price: 36000, image: IMG.textile, occasion: "Everyday", tags: ["sustainable"] },
  { n: 47, name: "Indigo Field Wrap — Plant Dye", designerId: "dh-18", designerName: "INDIGO FIELD", category: "sustainable", gender: "unisex", price: 19000, image: IMG.textile, occasion: "Everyday", tags: ["sustainable"] },
  { n: 48, name: "Goldthread Couture Anarkali — Cloud", designerId: "dh-12", designerName: "GOLDTHREAD ATELIER", category: "luxury-couture", gender: "women", price: 295000, image: IMG.bridal, occasion: "Bridal", tags: ["luxury-couture", "bridal"] },
  { n: 49, name: "Lumina Limited Brocade Cape", designerId: "dh-8", designerName: "LUMINA BANARAS", category: "luxury-couture", gender: "women", price: 168000, image: IMG.saree, occasion: "Reception", tags: ["luxury-couture"] },
  { n: 50, name: "Grid & Thread Modular Parka", designerId: "dh-23", designerName: "GRID & THREAD", category: "streetwear", gender: "unisex", price: 48000, image: IMG.street, occasion: "Everyday", tags: ["streetwear"] },
  { n: 51, name: "Aether Line Shell Top — Mist", designerId: "dh-30", designerName: "AETHER LINE", category: "streetwear", gender: "unisex", price: 26000, image: IMG.street, occasion: "Everyday", tags: ["streetwear"] },
  { n: 52, name: "Monsoon Reception Sharara", designerId: "dh-22", designerName: "MONSOON COUTURE", category: "occasion-wear", gender: "women", price: 112000, image: IMG.gown, occasion: "Reception", tags: ["occasion-wear"] },
  { n: 53, name: "Lotus Cocktail Kurta Set", designerId: "dh-27", designerName: "LOTUS & LAMP", category: "occasion-wear", gender: "women", price: 52000, image: IMG.textile, occasion: "Cocktail", tags: ["occasion-wear", "kurtas"] },
  { n: 54, name: "Cutting Room Fusion Jacket", designerId: "dh-26", designerName: "CUTTING ROOM", category: "indo-western", gender: "women", price: 71000, image: IMG.jacket, occasion: "Reception", tags: ["indo-western"] },
  { n: 55, name: "Northline Nehru Jacket — Stone", designerId: "dh-13", designerName: "NORTHLINE", category: "mens-wear", gender: "men", price: 34000, image: IMG.jacket, occasion: "Festive", tags: ["mens-wear"] },
  { n: 56, name: "Silk Road Mini Sherwani", designerId: "dh-29", designerName: "SILK ROAD KIDS", category: "kids", gender: "men", price: 21000, image: IMG.kids, occasion: "Bridal", tags: ["kids", "sherwanis"] },
  { n: 57, name: "Aether Technical Trouser", designerId: "dh-30", designerName: "AETHER LINE", category: "streetwear", gender: "unisex", price: 22000, image: IMG.street, occasion: "Everyday", tags: ["streetwear"] },
  { n: 58, name: "Saffron Phulkari Coat", designerId: "dh-24", designerName: "SAFFRON ARCHIVE", category: "womens-wear", gender: "women", price: 76000, image: IMG.coat, occasion: "Festive", tags: ["womens-wear", "coats"] },
  { n: 59, name: "Mehrab Reception Sherwani — Ivory", designerId: "dh-10", designerName: "MEHRAB TAILORS", category: "sherwanis", subcategory: "reception", gender: "men", price: 128000, image: IMG.mens, occasion: "Reception", tags: ["sherwanis", "occasion-wear"] },
  { n: 60, name: "Drape Theory Cocktail Saree — Ink", designerId: "dh-15", designerName: "DRAPE THEORY", category: "sarees", gender: "women", price: 84000, image: IMG.saree, occasion: "Cocktail", tags: ["sarees", "occasion-wear"] },
];

export const EXPANDED_PRODUCTS: Product[] = PROD_SPECS.map((p, idx) => ({
  id: `prod-${p.n}`,
  name: p.name,
  designerName: p.designerName,
  designerId: p.designerId,
  price: p.price,
  mrp: Math.round(p.price * 1.12),
  bestPrice: Math.round(p.price * 0.96),
  category: p.category,
  subcategory: p.subcategory,
  gender: p.gender,
  images: getProductImagesForCategory(p.category),
  videos: vids(idx),
  sizes:
    p.category === "jewellery" || p.category === "bags" || p.category === "footwear"
      ? ["OS"]
      : p.category === "kids"
        ? ["2-3Y", "4-5Y", "6-7Y", "8-9Y"]
        : ["XS", "S", "M", "L", "XL"],
  colors: ["#101010", "#E3DBCC", "#A38F7A"],
  description: `${p.name} from ${p.designerName}. Crafted for ${p.occasion.toLowerCase()} wear with atelier finishing.`,
  story: `Part of the ${p.designerName} seasonal edit — limited atelier production.`,
  craftOrigin: "India",
  material: "Silk blend / atelier finish",
  technique: "Hand finish",
  fit: "Tailored",
  occasion: p.occasion,
  tags: p.tags,
  verified: true,
  piecesRemaining: 4 + (idx % 9),
  limitedEdition: idx % 3 === 0,
  customizable: idx % 2 === 0,
  rating: 4.5 + (idx % 5) * 0.1,
  deliveryText: idx % 2 === 0 ? "Delivery within 48 hours" : "Delivery within 5 days",
}));

const REEL_TAGS = [
  "Runway",
  "Lookbook",
  "Fabric Study",
  "Bridal Reel",
  "Styling",
  "Couture Motion",
  "Street Drop",
  "Heritage",
  "Groom Edit",
  "Festive",
];

const REEL_CAPTIONS = [
  "Runway walk — scored lookbook reel.",
  "Outfit showcase in continuous motion.",
  "Close-up fabric study from the atelier.",
  "Styling reel for the season edit.",
  "Bridal fittings — vertical reel.",
  "Ethnic wear in evening light.",
  "Luxury couture silhouette study.",
  "Men's ceremony edit in motion.",
  "Women's occasion drape reel.",
  "Accessories finishing layer.",
];

/** ~45 additional fashion reels (total with base mock ≈ 60+). */
export const EXPANDED_FEED_POSTS: FeedPostData[] = Array.from({ length: 45 }, (_, i) => {
  const house = HOUSE_DEFS[i % HOUSE_DEFS.length];
  const product = EXPANDED_PRODUCTS[i % EXPANDED_PRODUCTS.length];
  const videoOnly = i % 3 !== 2;
  return {
    id: `feed-reel-${i + 1}`,
    type: "designer-spotlight" as const,
    designerId: house.id,
    designerName: house.name,
    designerLogo: house.logo,
    designerVerified: house.verified,
    tag: REEL_TAGS[i % REEL_TAGS.length],
    image: product.images[0],
    videoUrl: vid(i),
    videoOnly,
    caption: `${house.name} — ${REEL_CAPTIONS[i % REEL_CAPTIONS.length]}`,
    link: `/product/${product.id}`,
    likesCount: 400 + i * 37,
    commentsCount: 12 + (i % 20),
    productTag: {
      name: product.name,
      price: product.price,
      productId: product.id,
    },
  };
});

export const EXPANDED_STORIES: StoryItem[] = HOUSE_DEFS.slice(0, 16).map((h, i) => ({
  id: `story-exp-${i + 1}`,
  designerId: h.id,
  designerName: h.name,
  designerLogo: h.logo,
  label: i % 2 === 0 ? "Just Landed" : "Atelier",
  slides: [
    {
      image: h.banner,
      caption: `${h.name} — new drop`,
      ctaLabel: "Shop house",
      ctaLink: getDesignerUrl(h.handle) ?? "/",
    },
    ...(i % 3 === 0
      ? [
          {
            image: getCategoryPrimary("bridal"),
            caption: "Behind the fittings",
          },
        ]
      : []),
  ],
}));

/** Enrich baseline designers with social counts if missing. */
export function withSocialCounts(d: DesignerHouse, index: number): DesignerHouse {
  if (d.followersCount) return d;
  const base = [38.2, 24.1, 19.8, 15.4, 27.6, 21.0, 42.8][index] ?? 12 + index;
  return {
    ...d,
    followersCount: `${base}K`,
    followingCount: String(20 + index * 3),
    postsCount: d.postsCount ?? 12 + index,
  };
}
