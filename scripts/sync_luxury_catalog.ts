import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

// Curated high-res verified luxury photography sets
const LUXURY_COLLECTIONS = {
  lehengas: [
    {
      title: "Rivière Royal Crimson Zardozi Lehenga",
      images: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Hand-embroidered pure raw silk lehenga featuring 24K dabka, zardozi work, and floral jaal borders.",
    },
    {
      title: "Kishangarh Rose Dust Celebration Lehenga",
      images: [
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Natural lac-dyed lehenga in muted blush rose with hand-block printed gota patti borders.",
    },
    {
      title: "Ivory Pavilion Pearl Trousseau Lehenga",
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Monochromatic ivory silk bridal ensemble encrusted with seed pearls and fine silver wirework.",
    },
    {
      title: "Goldthread Couture Emerald Reception Lehenga",
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Rich forest emerald velvet lehenga with handcrafted antique gold tilla and sequin embroidery.",
    },
  ],

  sarees: [
    {
      title: "Temple Border Kanjivaram — Crimson & Gold",
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Nine-yard pure mulberry silk Kanjivaram with pure gold zari temple borders woven on a pit loom.",
    },
    {
      title: "Lumina Banarasi Kadwa Saree — Royal Amber",
      images: [
        "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Varanasi handwoven kadwa weave saree featuring floral meenakari motifs across opulent silk brocade.",
    },
    {
      title: "Drape Theory Pre-Pleated Cocktail Saree — Obsidian",
      images: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Modern engineered pleated silk saree designed for fluid movement with structured pallu accents.",
    },
  ],

  sherwanis: [
    {
      title: "Mehrab Royal Court Sherwani — Ivory Raw Silk",
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Full canvas-construction royal sherwani cut from handspun raw silk with antique brass buttons.",
    },
    {
      title: "Obsidian Canvas Bandhgala — Midnight Black",
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Architectural bandhgala jacket crafted in high-twist Italian tropical wool with subtle silk facing.",
    },
  ],

  streetwear: [
    {
      title: "Aether Minimalist Leather Runner — Alabaster",
      images: [
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Handcrafted low-top luxury sneaker in full-grain Italian nappa leather with sculpted rubber sole.",
    },
    {
      title: "Grid & Thread Modular Technical Parka",
      images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Weatherproof 3-layer laminated nylon parka with detachable storm hood and internal carry straps.",
    },
  ],

  gowns: [
    {
      title: "Form Studio Contour Evening Gown — Ivory Silk",
      images: [
        "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Bias-cut silk crepe column gown featuring internal corsetry and an architectural train.",
    },
    {
      title: "Velvet Lineage Gala Gown — Merlot Velvet",
      images: [
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Plush silk velvet evening gown with hand-draped portrait neckline and deep rear slit.",
    },
  ],

  jewellery: [
    {
      title: "Aurum Royal Polki & Emerald Bridal Choker",
      images: [
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "22K hallmarked gold necklace set with uncut polki diamonds, Zambian emeralds, and south sea pearls.",
    },
  ],

  accessories: [
    {
      title: "Raah Heritage Zari Jutti — Antique Gold",
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Handcrafted pure leather mojari jutti with genuine silver-gold zari embroidery and cushioned sole.",
    },
    {
      title: "Clutch & Key Hand-Beaded Velvet Minaudière",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1200&q=85&auto=format&fit=crop",
      ],
      desc: "Archival velvet hard-case clutch adorned with hand-strung Japanese seed beads and satin interior.",
    },
  ],
};

async function main() {
  console.log("=== STARTING LUXURY CATALOG SYNCHRONIZATION ===");

  // 1. Delete test/unrelated dummy items
  const testIds = ["prod_2de7230491a8cc107b45", "prod_c96461b22991fce4ecd2"];
  console.log("Deleting dummy/unrelated products:", testIds);
  
  for (const id of testIds) {
    try {
      await prisma.mediaAsset.deleteMany({ where: { productId: id } });
      await prisma.cartItem.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
      console.log(`Deleted dummy product: ${id}`);
    } catch (e) {
      console.warn(`Product ${id} delete note:`, (e as Error).message);
    }
  }

  // Also delete any other product whose name is generic "Black Shirt"
  const genericItems = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: "Black shirt", mode: "insensitive" } },
        { category: "Uncategorized" },
      ],
    },
  });

  for (const item of genericItems) {
    try {
      await prisma.mediaAsset.deleteMany({ where: { productId: item.id } });
      await prisma.cartItem.deleteMany({ where: { productId: item.id } });
      await prisma.product.delete({ where: { id: item.id } });
      console.log(`Deleted generic item: ${item.id} (${item.name})`);
    } catch (e) {
      console.warn(`Failed to delete generic item ${item.id}:`, e);
    }
  }

  // 2. Fetch all remaining products in DB
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`Updating ${products.length} products with authentic luxury photography...`);

  let lehengaIdx = 0;
  let sareeIdx = 0;
  let sherwaniIdx = 0;
  let gownIdx = 0;
  let streetIdx = 0;
  let jewelIdx = 0;
  let accIdx = 0;

  for (const prod of products) {
    const cat = prod.category.toLowerCase();
    let newImages: string[] = [];

    if (cat.includes("lehenga") || cat.includes("bridal") || cat.includes("wedding")) {
      const template = LUXURY_COLLECTIONS.lehengas[lehengaIdx % LUXURY_COLLECTIONS.lehengas.length];
      newImages = template.images;
      lehengaIdx++;
    } else if (cat.includes("saree")) {
      const template = LUXURY_COLLECTIONS.sarees[sareeIdx % LUXURY_COLLECTIONS.sarees.length];
      newImages = template.images;
      sareeIdx++;
    } else if (cat.includes("sherwani") || cat.includes("mens") || cat.includes("kurta")) {
      const template = LUXURY_COLLECTIONS.sherwanis[sherwaniIdx % LUXURY_COLLECTIONS.sherwanis.length];
      newImages = template.images;
      sherwaniIdx++;
    } else if (cat.includes("gown") || cat.includes("dress") || cat.includes("indo-western")) {
      const template = LUXURY_COLLECTIONS.gowns[gownIdx % LUXURY_COLLECTIONS.gowns.length];
      newImages = template.images;
      gownIdx++;
    } else if (cat.includes("street") || cat.includes("coat") || cat.includes("jacket")) {
      const template = LUXURY_COLLECTIONS.streetwear[streetIdx % LUXURY_COLLECTIONS.streetwear.length];
      newImages = template.images;
      streetIdx++;
    } else if (cat.includes("jewel")) {
      const template = LUXURY_COLLECTIONS.jewellery[jewelIdx % LUXURY_COLLECTIONS.jewellery.length];
      newImages = template.images;
      jewelIdx++;
    } else {
      const template = LUXURY_COLLECTIONS.accessories[accIdx % LUXURY_COLLECTIONS.accessories.length];
      newImages = template.images;
      accIdx++;
    }

    // Update Product images
    await prisma.product.update({
      where: { id: prod.id },
      data: {
        images: newImages,
        status: "published",
      },
    });

    // Sync mediaAsset rows
    await prisma.mediaAsset.deleteMany({ where: { productId: prod.id } });
    for (let i = 0; i < newImages.length; i++) {
      await prisma.mediaAsset.create({
        data: {
          productId: prod.id,
          ownerType: "product",
          kind: "image",
          publicId: `luxury/${prod.id}/img-${i}`,
          url: newImages[i],
          displayOrder: i,
          altText: `${prod.name} - View ${i + 1}`,
        },
      });
    }
  }

  // 3. Ensure a dedicated luxury sneaker product exists
  const sneakerCheck = await prisma.product.findUnique({ where: { id: "prod-sneaker-1" } });
  if (!sneakerCheck) {
    const designer = await prisma.designerHouse.findFirst({
      where: { OR: [{ id: "dh-30" }, { handle: "aether-line" }] },
    });
    const designerId = designer?.id || "dh-30";
    const designerName = designer?.name || "AETHER LINE";

    await prisma.product.create({
      data: {
        id: "prod-sneaker-1",
        name: "Aether Minimalist Leather Runner",
        designerId,
        designerName,
        category: "footwear",
        subcategory: "sneakers",
        price: 34500,
        mrp: 38000,
        gender: "unisex",
        sizes: ["38", "39", "40", "41", "42", "43"],
        colors: ["Alabaster White", "Obsidian Black"],
        piecesRemaining: 5,
        rating: 4.8,
        description: "Handcrafted luxury runner in full-grain Italian nappa leather with sculpted ergonomic rubber cupsole and tonal stitching.",
        story: "Designed in Seoul and crafted in a family-owned atelier in Civitanova Marche, Italy.",
        craftOrigin: "Civitanova Marche, Italy",
        material: "Full-Grain Italian Calfskin, Vibram Rubber Sole",
        technique: "Hand-Lasted Construction",
        fit: "True to Size",
        tags: ["sneakers", "streetwear", "luxury", "footwear", "handcrafted"],
        images: [
          "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=85&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=85&auto=format&fit=crop",
        ],
        status: "published",
      },
    });

    for (let i = 0; i < 3; i++) {
      const urls = [
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=85&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=85&auto=format&fit=crop",
      ];
      await prisma.mediaAsset.create({
        data: {
          productId: "prod-sneaker-1",
          ownerType: "product",
          kind: "image",
          publicId: `luxury/prod-sneaker-1/img-${i}`,
          url: urls[i],
          displayOrder: i,
          altText: `Aether Minimalist Leather Runner - Angle ${i + 1}`,
        },
      });
    }
    console.log("Created luxury sneaker product: prod-sneaker-1");
  }

  console.log("=== SYNCHRONIZATION COMPLETE ===");
}

main().finally(() => prisma.$disconnect());
