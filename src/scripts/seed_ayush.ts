import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Find or update Ayush designer house
  let designer = await prisma.designerHouse.findFirst();
  if (designer) {
    await prisma.designerHouse.update({
      where: { id: designer.id },
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
    console.log("Designer house updated:", designer.id);
  }

  // 2. Target product prod_2b4d7c8494f28ff7ee6d
  const productId = "prod_2b4d7c8494f28ff7ee6d";

  const updatedProduct = await prisma.product.upsert({
    where: { id: productId },
    update: {
      name: "Royal Heritage Velvet Zardozi Bridal Lehenga",
      description: "Handcrafted crimson velvet bridal lehenga featuring intricate gold Zardozi embroidery, semi-precious stone embellishments, and custom silk lining. Paired with a matching embroidered blouse and handcrafted organza dupatta.",
      category: "lehengas",
      subcategory: "Bridal Wear",
      price: 185000,
      mrp: 220000,
      bestPrice: 175000,
      gender: "women",
      sizes: ["S", "M", "L", "XL", "Free Size"],
      colors: ["Royal Crimson", "Antique Gold"],
      tags: ["Bridal", "Zardozi", "Festive", "Luxury", "Handcrafted"],
      story: "Crafted over 320 artisan hours by master karigars in Jaipur, Rajasthan.",
      craftOrigin: "Jaipur, Rajasthan",
      material: "Pure Micro-Velvet & Organza",
      technique: "Hand Zardozi & Gota Patti",
      fit: "Custom Fitted / Tailored",
      piecesRemaining: 5,
      limitedEdition: true,
      customizable: true,
      deliveryText: "Ships in 14–21 business days with luxury wooden atelier packaging",
      weightGrams: 2800,
      netQuantity: "1 Lehenga + 1 Blouse + 1 Dupatta",
      manufacturerName: "Atelier Ayush Couture Pvt Ltd",
      manufacturerAddress: "42 MI Road, Pink City, Jaipur, Rajasthan 302001",
      countryOfOrigin: "India",
      status: "draft",
    },
    create: {
      id: productId,
      designerId: designer?.id || "dh_ayush",
      designerName: "Atelier Ayush Couture",
      name: "Royal Heritage Velvet Zardozi Bridal Lehenga",
      description: "Handcrafted crimson velvet bridal lehenga featuring intricate gold Zardozi embroidery, semi-precious stone embellishments, and custom silk lining. Paired with a matching embroidered blouse and handcrafted organza dupatta.",
      category: "lehengas",
      subcategory: "Bridal Wear",
      price: 185000,
      mrp: 220000,
      bestPrice: 175000,
      gender: "women",
      sizes: ["S", "M", "L", "XL", "Free Size"],
      colors: ["Royal Crimson", "Antique Gold"],
      tags: ["Bridal", "Zardozi", "Festive", "Luxury", "Handcrafted"],
      story: "Crafted over 320 artisan hours by master karigars in Jaipur, Rajasthan.",
      craftOrigin: "Jaipur, Rajasthan",
      material: "Pure Micro-Velvet & Organza",
      technique: "Hand Zardozi & Gota Patti",
      fit: "Custom Fitted / Tailored",
      piecesRemaining: 5,
      limitedEdition: true,
      customizable: true,
      deliveryText: "Ships in 14–21 business days with luxury wooden atelier packaging",
      weightGrams: 2800,
      netQuantity: "1 Lehenga + 1 Blouse + 1 Dupatta",
      manufacturerName: "Atelier Ayush Couture Pvt Ltd",
      manufacturerAddress: "42 MI Road, Pink City, Jaipur, Rajasthan 302001",
      countryOfOrigin: "India",
      status: "draft",
    },
  });

  console.log("Product seeded successfully:", updatedProduct.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
