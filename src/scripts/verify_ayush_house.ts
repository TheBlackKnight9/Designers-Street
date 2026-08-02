import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const houses = await prisma.designerHouse.findMany();
  console.log("Found designer houses:", houses.map((h) => ({ id: h.id, name: h.name, handle: h.handle })));

  let ayushHouse = houses.find(
    (h) => h.name.toLowerCase().includes("ayush") || h.handle.toLowerCase().includes("ayush")
  );

  if (!ayushHouse && houses.length > 0) {
    ayushHouse = houses[0];
    await prisma.designerHouse.update({
      where: { id: ayushHouse.id },
      data: {
        name: "Atelier Ayush Couture",
        handle: "ayush-couture",
        bio: "Mastering contemporary Indian bridal wear & royal Zardozi hand-embroidery from Jaipur.",
        location: "Jaipur, Rajasthan",
      },
    });
  }

  if (ayushHouse) {
    const updatedProd = await prisma.product.update({
      where: { id: "prod_test_image_upload" },
      data: {
        designerId: ayushHouse.id,
        designerName: ayushHouse.name,
      },
    });
    console.log("Updated prod_test_image_upload for house:", ayushHouse.name, "(ID:", ayushHouse.id, ")");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
