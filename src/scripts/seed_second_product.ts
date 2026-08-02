import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let designer = await prisma.designerHouse.findFirst();
  const designerId = designer?.id || "dh-1";
  const designerName = designer?.name || "Atelier Ayush Couture";

  const productId = "prod_test_image_upload";

  const product = await prisma.product.upsert({
    where: { id: productId },
    update: {
      name: "Jaipur Marodi Silk Anarkali Suit Set",
      description: "Hand-crafted emerald green raw silk Anarkali featuring traditional Jaipur Marodi embroidery, gota patti highlights, and organza hand-tinted dupatta with antique gold border.",
      category: "anarkalis",
      subcategory: "Suits & Sets",
      price: 95000,
      mrp: 110000,
      bestPrice: 90000,
      gender: "women",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Emerald Green", "Antique Gold"],
      tags: ["Anarkali", "Silk", "Marodi", "Festive", "Handmade"],
      story: "Handcrafted over 140 Karigar hours in Jaipur atelier.",
      craftOrigin: "Jaipur, Rajasthan",
      material: "Pure Raw Silk & Organza",
      technique: "Marodi Work & Gota Patti",
      fit: "Tailored Fitted Bodice with Flared Skirt",
      piecesRemaining: 8,
      limitedEdition: true,
      customizable: true,
      deliveryText: "Ships in 7–10 business days",
      weightGrams: 1400,
      netQuantity: "1 Anarkali + 1 Churidar + 1 Dupatta",
      manufacturerName: "Atelier Ayush Couture Pvt Ltd",
      manufacturerAddress: "42 MI Road, Jaipur, Rajasthan 302001",
      countryOfOrigin: "India",
      status: "draft",
    },
    create: {
      id: productId,
      designerId: designerId,
      designerName: designerName,
      name: "Jaipur Marodi Silk Anarkali Suit Set",
      description: "Hand-crafted emerald green raw silk Anarkali featuring traditional Jaipur Marodi embroidery, gota patti highlights, and organza hand-tinted dupatta with antique gold border.",
      category: "anarkalis",
      subcategory: "Suits & Sets",
      price: 95000,
      mrp: 110000,
      bestPrice: 90000,
      gender: "women",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Emerald Green", "Antique Gold"],
      tags: ["Anarkali", "Silk", "Marodi", "Festive", "Handmade"],
      story: "Handcrafted over 140 Karigar hours in Jaipur atelier.",
      craftOrigin: "Jaipur, Rajasthan",
      material: "Pure Raw Silk & Organza",
      technique: "Marodi Work & Gota Patti",
      fit: "Tailored Fitted Bodice with Flared Skirt",
      piecesRemaining: 8,
      limitedEdition: true,
      customizable: true,
      deliveryText: "Ships in 7–10 business days",
      weightGrams: 1400,
      netQuantity: "1 Anarkali + 1 Churidar + 1 Dupatta",
      manufacturerName: "Atelier Ayush Couture Pvt Ltd",
      manufacturerAddress: "42 MI Road, Jaipur, Rajasthan 302001",
      countryOfOrigin: "India",
      status: "draft",
    },
  });

  console.log("Seeded second product successfully:", product.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
