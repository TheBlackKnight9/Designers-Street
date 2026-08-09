import { prisma } from '../db';

async function run() {
  const designer = await prisma.designerHouse.findFirst();
  if (!designer) {
    console.log("No designer found to attach product to.");
    return;
  }

  const product = await prisma.product.create({
    data: {
      id: "prod-concept-1",
      name: "Avant-Garde Concept Art - Project X",
      description: "An experimental concept piece exploring future luxury aesthetics. This is not a ready-to-buy product, but rather an exploratory art piece. Express interest to request a custom design inspired by this.",
      price: 250000,
      designerId: designer.id,
      designerName: designer.name,
      images: [
        "https://images.unsplash.com/photo-1558171813-1c088753a7f8?w=800&q=85&auto=format&fit=crop"
      ],
      category: "Concept",
      listingType: "CONCEPT_ART",
      conceptCta: "EXPRESS_INTEREST",
      gender: "unisex"
    }
  });

  console.log(`New Concept Post Created! It should now appear in the feed: http://localhost:3000`);
  console.log(`Product ID: ${product.id}`);
  console.log(`Product Link: http://localhost:3000/product/${product.id}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
