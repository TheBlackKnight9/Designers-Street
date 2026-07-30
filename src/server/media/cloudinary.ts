import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { CloudinaryError, MediaUploadError } from "@/server/errors";
import type { MediaType } from "@/server/types/media";
import { resolveMediaFolder } from "@/server/media/folders";
import type { MediaOwnerType } from "@prisma/client";

let configured = false;

/**
 * Official Cloudinary SDK singleton (API secret never leaves the server).
 */
export function getCloudinary() {
  if (!configured) {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
      throw new CloudinaryError(
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

export type SignedUploadParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  resourceType: "image" | "video" | "auto";
};

export type CloudinaryUploadResult = {
  type: MediaType;
  cloudinaryPublicId: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  format: string | null;
  bytes: number | null;
  folder: string | null;
  thumbnailUrl: string | null;
};

function mapUploadResult(
  result: UploadApiResponse,
  fallbackType: MediaType,
  service: CloudinaryService
): CloudinaryUploadResult {
  const resource =
    result.resource_type === "video" || fallbackType === "video"
      ? "video"
      : "image";
  const durationMs =
    typeof result.duration === "number"
      ? Math.round(result.duration * 1000)
      : null;

  const mapped: CloudinaryUploadResult = {
    type: resource,
    cloudinaryPublicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width ?? null,
    height: result.height ?? null,
    duration: durationMs,
    format: result.format ?? null,
    bytes: result.bytes ?? null,
    folder: result.folder ?? null,
    thumbnailUrl: null,
  };

  if (resource === "video") {
    mapped.thumbnailUrl = service.getThumbnailUrl(result.public_id, "video");
  }

  return mapped;
}

/**
 * Reusable Cloudinary service — images, videos, signed uploads, delete, delivery URLs.
 */
export class CloudinaryService {
  createSignedUploadParams(options?: {
    folder?: string;
    ownerType?: MediaOwnerType;
    resourceType?: "image" | "video" | "auto";
    timestamp?: number;
  }): SignedUploadParams {
    const cld = getCloudinary();
    const timestamp = options?.timestamp ?? Math.floor(Date.now() / 1000);
    const folder = resolveMediaFolder(options?.ownerType, options?.folder);
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

  async uploadImage(
    file: string | Buffer,
    options?: { folder?: string; ownerType?: MediaOwnerType; publicId?: string }
  ): Promise<CloudinaryUploadResult> {
    return this.upload(file, "image", options);
  }

  async uploadVideo(
    file: string | Buffer,
    options?: { folder?: string; ownerType?: MediaOwnerType; publicId?: string }
  ): Promise<CloudinaryUploadResult> {
    return this.upload(file, "video", options);
  }

  async upload(
    file: string | Buffer,
    type: MediaType,
    options?: { folder?: string; ownerType?: MediaOwnerType; publicId?: string }
  ): Promise<CloudinaryUploadResult> {
    try {
      const cld = getCloudinary();
      const folder = resolveMediaFolder(options?.ownerType, options?.folder);
      const baseOpts = {
        folder,
        resource_type: type as "image" | "video",
        public_id: options?.publicId,
        overwrite: false as const,
      };

      let result: UploadApiResponse;

      if (Buffer.isBuffer(file)) {
        result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cld.uploader.upload_stream(baseOpts, (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(error ?? new Error("Empty Cloudinary response"));
              return;
            }
            resolve(uploadResult);
          });
          stream.end(file);
        });
      } else {
        result = await cld.uploader.upload(file, baseOpts);
      }

      return mapUploadResult(result, type, this);
    } catch (error) {
      throw new MediaUploadError(
        error instanceof Error ? error.message : "Cloudinary upload failed",
        { type }
      );
    }
  }

  async deleteMedia(
    publicId: string,
    type: MediaType = "image"
  ): Promise<void> {
    try {
      const cld = getCloudinary();
      const result = await cld.uploader.destroy(publicId, {
        resource_type: type,
      });
      if (result.result !== "ok" && result.result !== "not found") {
        throw new CloudinaryError(`Delete failed: ${result.result}`, {
          publicId,
          result,
        });
      }
    } catch (error) {
      if (error instanceof CloudinaryError) throw error;
      throw new CloudinaryError(
        error instanceof Error ? error.message : "Cloudinary delete failed",
        { publicId }
      );
    }
  }

  /**
   * Optimized delivery URL (transformations applied at CDN edge).
   */
  getOptimizedUrl(
    publicId: string,
    options?: {
      type?: MediaType;
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    }
  ): string {
    const cld = getCloudinary();
    return cld.url(publicId, {
      secure: true,
      resource_type: options?.type === "video" ? "video" : "image",
      width: options?.width,
      height: options?.height,
      crop: options?.crop ?? "limit",
      quality: options?.quality ?? "auto",
      fetch_format: options?.format ?? "auto",
    });
  }

  /**
   * Still-frame URL for videos (jpg at start). Returns null for images.
   */
  getThumbnailUrl(
    publicId: string,
    type: MediaType = "video"
  ): string | null {
    if (type !== "video") return null;
    const cld = getCloudinary();
    return cld.url(publicId, {
      secure: true,
      resource_type: "video",
      format: "jpg",
      start_offset: 0,
      quality: "auto",
    });
  }
}

/** @deprecated Prefer CloudinaryService — kept for Phase 1.1 import compatibility */
export function createSignedUploadParams(options?: {
  folder?: string;
  ownerType?: MediaOwnerType;
  resourceType?: "image" | "video" | "auto";
  timestamp?: number;
}) {
  return new CloudinaryService().createSignedUploadParams(options);
}
