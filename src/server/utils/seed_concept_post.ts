import { prisma } from '../db';

async function run() {
  const designer = await prisma.designerHouse.findFirst();
  if (!designer) {
    console.log("No designer found to attach post to.");
    return;
  }

  const postId = `post_${Date.now()}_seed`;
  const post = await prisma.post.create({
    data: {
      id: postId,
      type: "category",
      designerId: designer.id,
      designerName: designer.name,
      designerLogo: designer.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      designerVerified: designer.verified,
      tag: "Concept Design ✨",
      image: "https://images.unsplash.com/photo-1558171813-1c088753a7f8?w=800&q=85&auto=format&fit=crop",
      caption: "A bold new sketch exploring brutalist architecture in couture. Would you wear this?",
      link: `/designer/${designer.handle}`,
      allowLeads: true,
      mediaType: "image",
    }
  });

  console.log(`New Social Concept Post Created! ID: ${post.id}`);

  // Create a lead to test the UI
  const lead = await prisma.conceptInterest.create({
    data: {
      sourceType: "POST",
      postId: post.id,
      name: "Social Tester",
      email: "tester@example.com",
      phone: "555-0999",
      notes: "I want this exact design!",
      status: "NEW"
    }
  });

  console.log(`Mock lead created from Post! Lead ID: ${lead.id}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
