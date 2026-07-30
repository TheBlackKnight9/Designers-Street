import { PrismaClient, type PostType, type ProductGender } from "@prisma/client";
import {
  DESIGNERS,
  PRODUCTS,
  CATEGORIES,
  FEED_POSTS,
  STORIES,
} from "../src/lib/mock-data";
import type { Category } from "../src/lib/types";

const prisma = new PrismaClient();

function mapGender(g: "men" | "women" | "unisex"): ProductGender {
  return g;
}

function mapPostType(t: "category" | "designer-spotlight"): PostType {
  return t === "designer-spotlight" ? "designer_spotlight" : "category";
}

async function seedCategories(
  nodes: Category[],
  parentId: string | null = null,
  sortOrderBase = 0
) {
  let order = sortOrderBase;
  for (const node of nodes) {
    const id = `cat-${node.slug}`;
    await prisma.category.upsert({
      where: { slug: node.slug },
      create: {
        id,
        slug: node.slug,
        label: node.label,
        image: node.image,
        caption: node.caption,
        parentId,
        sortOrder: order,
      },
      update: {
        label: node.label,
        image: node.image,
        caption: node.caption,
        parentId,
        sortOrder: order,
      },
    });
    order += 1;
    if (node.children?.length) {
      await seedCategories(node.children, id, 0);
    }
  }
}

async function syncProductMedia(productId: string, images: string[], videos?: string[]) {
  await prisma.mediaAsset.deleteMany({ where: { productId } });
  let order = 0;
  for (const url of images) {
    await prisma.mediaAsset.create({
      data: {
        productId,
        ownerType: "product",
        kind: "image",
        publicId: `demo/${productId}/img-${order}`,
        url,
        displayOrder: order,
        altText: "Product image",
      },
    });
    order += 1;
  }
  for (const url of videos ?? []) {
    await prisma.mediaAsset.create({
      data: {
        productId,
        ownerType: "product",
        kind: "video",
        publicId: `demo/${productId}/vid-${order}`,
        url,
        thumbnailUrl: images[0] ?? null,
        displayOrder: order,
        altText: "Product lookbook video",
      },
    });
    order += 1;
  }
}

async function main() {
  console.log("Seeding Designer's Street from mock-data…");

  for (const d of DESIGNERS) {
    await prisma.designerHouse.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        name: d.name,
        handle: d.handle,
        logo: d.logo,
        banner: d.banner,
        bio: d.bio,
        foundingStory: d.foundingStory,
        founded: d.founded,
        location: d.location,
        signatureTechniques: d.signatureTechniques,
        verified: d.verified,
        exclusive: d.exclusive ?? false,
        offersBespoke: d.offersBespoke ?? false,
        followersCount: d.followersCount,
        followingCount: d.followingCount,
        postsCount: d.postsCount,
        website: d.website,
        accountStatus: "active",
      },
      update: {
        name: d.name,
        handle: d.handle,
        logo: d.logo,
        banner: d.banner,
        bio: d.bio,
        foundingStory: d.foundingStory,
        founded: d.founded,
        location: d.location,
        signatureTechniques: d.signatureTechniques,
        verified: d.verified,
        exclusive: d.exclusive ?? false,
        offersBespoke: d.offersBespoke ?? false,
        followersCount: d.followersCount,
        followingCount: d.followingCount,
        postsCount: d.postsCount,
        website: d.website,
      },
    });
  }
  console.log(`  designers: ${DESIGNERS.length}`);

  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        designerId: p.designerId,
        name: p.name,
        designerName: p.designerName,
        price: p.price,
        mrp: p.mrp,
        bestPrice: p.bestPrice,
        category: p.category,
        subcategory: p.subcategory,
        gender: mapGender(p.gender),
        images: p.images,
        sizes: p.sizes,
        colors: p.colors ?? [],
        tags: p.tags ?? [],
        description: p.description,
        story: p.story,
        craftOrigin: p.craftOrigin,
        material: p.material,
        technique: p.technique,
        fit: p.fit,
        occasion: p.occasion,
        verified: p.verified ?? false,
        piecesRemaining: p.piecesRemaining,
        limitedEdition: p.limitedEdition ?? false,
        customizable: p.customizable ?? false,
        rating: p.rating,
        deliveryText: p.deliveryText,
        likesCount: 120 + (p.price % 900),
        status: "published",
      },
      update: {
        designerId: p.designerId,
        name: p.name,
        designerName: p.designerName,
        price: p.price,
        mrp: p.mrp,
        bestPrice: p.bestPrice,
        category: p.category,
        subcategory: p.subcategory,
        gender: mapGender(p.gender),
        images: p.images,
        sizes: p.sizes,
        colors: p.colors ?? [],
        tags: p.tags ?? [],
        description: p.description,
        story: p.story,
        craftOrigin: p.craftOrigin,
        material: p.material,
        technique: p.technique,
        fit: p.fit,
        occasion: p.occasion,
        verified: p.verified ?? false,
        piecesRemaining: p.piecesRemaining,
        limitedEdition: p.limitedEdition ?? false,
        customizable: p.customizable ?? false,
        rating: p.rating,
        deliveryText: p.deliveryText,
        likesCount: 120 + (p.price % 900),
        status: "published",
      },
    });
    await syncProductMedia(p.id, p.images, p.videos);
  }
  console.log(`  products: ${PRODUCTS.length}`);

  // Replace category tree so stale nested/duplicate slugs do not linger
  await prisma.category.deleteMany({});
  await seedCategories(CATEGORIES);
  console.log(`  categories: ${CATEGORIES.length} browse roots`);

  for (const post of FEED_POSTS) {
    const hasVideo = Boolean(post.videoUrl);
    await prisma.post.upsert({
      where: { id: post.id },
      create: {
        id: post.id,
        type: mapPostType(post.type),
        designerId: post.designerId ?? null,
        designerName: post.designerName,
        designerLogo: post.designerLogo,
        designerVerified: post.designerVerified,
        categorySlug: post.categorySlug,
        tag: post.tag,
        image: post.image,
        videoUrl: post.videoUrl ?? null,
        mediaType: hasVideo ? "video" : "image",
        caption: post.caption,
        link: post.link,
        likesCount: post.likesCount ?? 0,
        commentsCount: post.commentsCount ?? 0,
        productTag: post.productTag ?? undefined,
      },
      update: {
        type: mapPostType(post.type),
        designerId: post.designerId ?? null,
        designerName: post.designerName,
        designerLogo: post.designerLogo,
        designerVerified: post.designerVerified,
        categorySlug: post.categorySlug,
        tag: post.tag,
        image: post.image,
        videoUrl: post.videoUrl ?? null,
        mediaType: hasVideo ? "video" : "image",
        caption: post.caption,
        link: post.link,
        likesCount: post.likesCount ?? 0,
        commentsCount: post.commentsCount ?? 0,
        productTag: post.productTag ?? undefined,
      },
    });
  }
  console.log(`  posts: ${FEED_POSTS.length}`);

  for (const story of STORIES) {
    await prisma.story.upsert({
      where: { id: story.id },
      create: {
        id: story.id,
        designerId: story.designerId,
        label: story.label,
        slides: {
          create: story.slides.map((s, index) => ({
            position: index,
            image: s.image,
            caption: s.caption,
            ctaLabel: s.ctaLabel,
            ctaLink: s.ctaLink,
          })),
        },
      },
      update: {
        designerId: story.designerId,
        label: story.label,
        slides: {
          deleteMany: {},
          create: story.slides.map((s, index) => ({
            position: index,
            image: s.image,
            caption: s.caption,
            ctaLabel: s.ctaLabel,
            ctaLink: s.ctaLink,
          })),
        },
      },
    });
  }
  console.log(`  stories: ${STORIES.length}`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
