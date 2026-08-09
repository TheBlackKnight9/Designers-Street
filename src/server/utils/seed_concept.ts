import { prisma } from '../db';

async function run() {
  const p = await prisma.product.findFirst();
  if (p) {
    const updated = await prisma.product.update({
      where: { id: p.id },
      data: { listingType: 'BESPOKE_ONLY' }
    });
    console.log(`Product updated: http://localhost:3000/product/${p.id}`);
    
    const lead = await prisma.conceptInterest.create({
      data: {
        productId: p.id,
        name: "Test Customer",
        email: "test@example.com",
        phone: "555-0100",
        budgetRange: "₹50,000 - ₹1,50,000",
        notes: "I want a custom color.",
        intent: "CUSTOMIZE",
        status: "NEW"
      }
    });
    console.log(`Lead Created! Admin URL: http://localhost:3000/admin/concept-leads`);
  } else {
    console.log("No products found in DB");
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
