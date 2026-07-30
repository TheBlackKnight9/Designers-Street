import { v2 as cloudinary } from "cloudinary";

let configured = false;

/**
 * Configure the official Cloudinary SDK from env.
 * Safe to call multiple times — configures once.
 */
export function getCloudinary() {
  if (!configured) {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
      throw new Error(
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
      );
    }

    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Build a signed upload params payload for client-side uploads (Phase 3+).
 * Does not perform the upload — configuration helper only.
 */
export function createSignedUploadParams(options?: {
  folder?: string;
  resourceType?: "image" | "video" | "auto";
  timestamp?: number;
}) {
  const cld = getCloudinary();
  const timestamp = options?.timestamp ?? Math.floor(Date.now() / 1000);
  const folder = options?.folder ?? "designers-street";
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };

  const signature = cld.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    timestamp,
    folder,
    signature,
    resourceType: options?.resourceType ?? "auto",
  };
}
