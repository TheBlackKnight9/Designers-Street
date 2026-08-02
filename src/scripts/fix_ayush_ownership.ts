import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const houseId = "dh_3399a08e8ca64d70";

  // 0. Change dh-1 handle first to release ayush-couture
  await prisma.designerHouse.update({
    where: { id: "dh-1" },
    data: { handle: "ayush-couture-sample" },
  });

  // 1. Update designer house name and handle for logged-in user house
  const house = await prisma.designerHouse.update({
    where: { id: houseId },
    data: {
      name: "Atelier Ayush Couture",
      handle: "ayush-couture",
      bio: "Mastering contemporary Indian bridal wear & royal Zardozi hand-embroidery from Jaipur.",
      foundingStory: "Founded in 2024, Atelier Ayush Couture blends centuries-old heritage handloom techniques with modern silhouettes.",
      signatureTechniques: ["Zardozi", "Gota Patti", "Handloom Silk", "Marodi Work"],
      designPhilosophy: "Timeless Indian grandeur handcrafted for the modern luxury bride.",
      location: "Jaipur, Rajasthan",
      website: "https://ayushcouture.com",
      verified: true,
    },
  });

  console.log("Updated logged in designer house:", house.id, house.name);

  // 2. Update products to belong to logged in designer house (dh_3399a08e8ca64d70)
  await prisma.product.updateMany({
    where: {
      id: { in: ["prod_2b4d7c8494f28ff7ee6d", "prod_test_image_upload"] },
    },
    data: {
      designerId: houseId,
      designerName: "Atelier Ayush Couture",
    },
  });

  console.log("Updated products ownership to Atelier Ayush Couture!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
