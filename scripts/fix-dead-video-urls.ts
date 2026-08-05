import { PrismaClient } from "@prisma/client";
import {
  ALL_FASHION_VIDEO_URLS,
  pickFashionVideo,
  toPlayableVideoUrl,
} from "../src/lib/fashion-videos";

const prisma = new PrismaClient();

function shouldReplace(url: string | null | undefined): boolean {
  if (!url) return false;
  if (/pexels\.com/i.test(url)) return true;
  // Uncompressed Cloudinary demo masters (slow / endless buffer on reel)
  if (
    /res\.cloudinary\.com\/demo\/video\/upload\/(?![^/]+,)/i.test(url) &&
    !/w_\d+|q_auto|f_mp4|br_/i.test(url)
  ) {
    return true;
  }
  return false;
}

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, videoUrl: true, image: true },
  });
  let postUpdates = 0;
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    let nextVideo = p.videoUrl;
    if (shouldReplace(p.videoUrl)) {
      nextVideo = pickFashionVideo(i);
    } else if (p.videoUrl && /res\.cloudinary\.com/i.test(p.videoUrl)) {
      nextVideo = toPlayableVideoUrl(p.videoUrl);
    }

    let nextImage = p.image;
    if (nextImage && shouldReplace(nextImage) && /\.mp4/i.test(nextImage)) {
      nextImage = nextVideo || pickFashionVideo(i);
    } else if (
      nextImage &&
      /res\.cloudinary\.com/i.test(nextImage) &&
      /\.mp4|\/video\/upload\//i.test(nextImage)
    ) {
      nextImage = toPlayableVideoUrl(nextImage);
    }

    if (nextVideo !== p.videoUrl || nextImage !== p.image) {
      await prisma.post.update({
        where: { id: p.id },
        data: {
          videoUrl: nextVideo,
          image: nextImage,
          ...(nextVideo ? { mediaType: "video" as const } : {}),
        },
      });
      postUpdates++;
    }
  }

  const assets = await prisma.mediaAsset.findMany({
    where: { kind: "video" },
    select: { id: true, url: true },
  });
  let assetUpdates = 0;
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    if (!a.url) continue;
    let next = a.url;
    if (shouldReplace(a.url)) {
      next = pickFashionVideo(i + 7);
    } else if (/res\.cloudinary\.com/i.test(a.url)) {
      next = toPlayableVideoUrl(a.url);
    }
    if (next !== a.url) {
      await prisma.mediaAsset.update({
        where: { id: a.id },
        data: { url: next },
      });
      assetUpdates++;
    }
  }

  console.log(
    JSON.stringify(
      {
        posts: posts.length,
        postUpdates,
        assets: assets.length,
        assetUpdates,
        sample: ALL_FASHION_VIDEO_URLS[0],
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
