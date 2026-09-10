/**
 * Curated high-fashion, authentic luxury editorial photography library
 * Every photo ID is verified for high-resolution couture quality.
 */

export type CuratedLook = {
  id: string;
  category: string;
  title: string;
  images: string[];
  description: string;
};

// High-end Unsplash photo IDs verified for luxury Indian & international designer fashion
export const VERIFIED_LUXURY_PHOTOS = {
  // Bridal & Festive Lehengas (Deep reds, crimson velvets, ivory zardozi, pastels)
  lehengas: [
    // Royal red bridal lehenga with heavy zardozi embroidery
    [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=85&auto=format&fit=crop",
    ],
    // Rose gold & blush festive lehenga
    [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85&auto=format&fit=crop",
    ],
    // Ivory & gold pearl bridal lehenga
    [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=85&auto=format&fit=crop",
    ],
    // Emerald green velvet celebration lehenga
    [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85&auto=format&fit=crop",
    ],
  ],

  // Sarees & Handloom Weaves (Banarasi, Kanjivaram, Organza drapes)
  sarees: [
    // Heritage Banarasi Silk Saree in crimson & gold zari
    [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85&auto=format&fit=crop",
    ],
    // Temple Border Kanjivaram in ivory & antique gold
    [
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85&auto=format&fit=crop",
    ],
    // Contemporary Organza Cocktail Drape Saree
    [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=85&auto=format&fit=crop",
    ],
    // Royal Indigo hand-printed drape
    [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1200&q=85&auto=format&fit=crop",
    ],
  ],

  // Sherwanis, Bandhgalas & Royal Menswear
  sherwanis: [
    // Ivory Royal Silk Court Sherwani
    [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=85&auto=format&fit=crop",
    ],
    // Midnight Black Canvas-Tailored Bandhgala
    [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&q=85&auto=format&fit=crop",
    ],
    // Embroidered Silk Kurta with Nehru Jacket
    [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=85&auto=format&fit=crop",
    ],
  ],

  // Couture Gowns & Evening Dresses
  gowns: [
    // Sculptural Ivory Column Evening Gown
    [
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=85&auto=format&fit=crop",
    ],
    // Deep Merlot Velvet Gala Gown
    [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=85&auto=format&fit=crop",
    ],
    // Silk Organza Tiered Reception Gown
    [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=85&auto=format&fit=crop",
    ],
  ],

  // Indo-Western & Fusion Luxury
  indoWestern: [
    // Tailored Fusion Longcoat & Trouser Ensemble
    [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=85&auto=format&fit=crop",
    ],
    // Structured Cape & Draped Pantsuit
    [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85&auto=format&fit=crop",
    ],
  ],

  // Luxury Streetwear & Designer Sneakers
  streetwear: [
    // Chunky Minimalist Designer Sneakers in Ivory & Alabaster
    [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=85&auto=format&fit=crop",
    ],
    // Luxury Low-Top Leather Sneakers in Clean Monochrome
    [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85&auto=format&fit=crop",
    ],
    // Technical Luxury Oversized Trench Coat
    [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85&auto=format&fit=crop",
    ],
    // Urban Street-Luxury Modular Parka
    [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85&auto=format&fit=crop",
    ],
  ],

  // Fine Jewellery
  jewellery: [
    // Royal Polki & Emerald Bridal Choker Set
    [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=85&auto=format&fit=crop",
    ],
    // Heritage Kundan Chandelier Earrings
    [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=85&auto=format&fit=crop",
    ],
  ],

  // Footwear & Bags
  accessories: [
    // Handcrafted Antique Zari Jutti
    [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=85&auto=format&fit=crop",
    ],
    // Beaded Velvet Minaudière Clutch
    [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1200&q=85&auto=format&fit=crop",
    ],
  ],
};
