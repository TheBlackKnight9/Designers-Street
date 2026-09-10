import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      images: true,
      designerId: true,
      designerName: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${products.length} products in DB.`);
  products.forEach((p, idx) => {
    console.log(`[${idx + 1}] ID: ${p.id} | Name: ${p.name} | Cat: ${p.category} | Designer: ${p.designerName || p.designerId} | Images: ${p.images.length}`);
    if (p.images.length > 0) {
      console.log(`     Image 1: ${p.images[0]}`);
    }
  });

  const designers = await prisma.designerHouse.findMany({
    select: { id: true, name: true, handle: true, logo: true, banner: true },
  });
  console.log(`\nFound ${designers.length} designers in DB.`);
  designers.forEach((d) => {
    console.log(`- ${d.id}: ${d.name} (${d.handle})`);
  });
}

main().finally(() => prisma.$disconnect());
