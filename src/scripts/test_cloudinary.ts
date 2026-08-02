import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function testUpload() {
  console.log("Testing Cloudinary credentials...");
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("API Key:", process.env.CLOUDINARY_API_KEY);

  // 1x1 red PNG base64 sample
  const sampleImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  try {
    const res = await cloudinary.uploader.upload(sampleImage, {
      folder: "designers_street/test",
    });

    console.log("SUCCESS: Cloudinary accepted the image upload!");
    console.log("Public ID:", res.public_id);
    console.log("Secure URL:", res.secure_url);
    console.log("Width:", res.width, "Height:", res.height);
  } catch (error) {
    console.error("FAILED: Cloudinary upload error:", error);
  }
}

testUpload();
