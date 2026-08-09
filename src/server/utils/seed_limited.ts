import { prisma } from '../db';

async function run() {
  const designer = await prisma.designerHouse.findFirst();
  if (!designer) {
    console.log("No designer found to attach product to.");
    return;
  }

  const product = await prisma.product.create({
    data: {
      id: "prod-limited-1",
      name: "Crimson Velvet - Limited Edition",
      description: "A highly exclusive piece limited to 10 copies worldwide. Reserve your piece now before it's gone.",
      price: 320000,
      designerId: designer.id,
      designerName: designer.name,
      images: ["https://images.unsplash.com/photo-1574291814206-363acdf2aa79?w=800&q=85&auto=format&fit=crop"],
      category: "Dresses",
      listingType: "LIMITED_EDITION",
      conceptCta: "PRE_ORDER_DEPOSIT",
      gender: "women"
    }
  });

  console.log(`New Limited Edition Post Created!`);
  console.log(`Product ID: ${product.id}`);
  console.log(`Product Link: http://localhost:3000/product/${product.id}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
