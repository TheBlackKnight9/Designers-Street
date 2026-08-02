import { MediaRepository } from "@/server/repositories/media-repository";
import { CloudinaryService } from "@/server/media/cloudinary";
import { resolveMediaFolder } from "@/server/media/folders";
import { isDatabaseEnabled } from "@/server/utils/env";
import {
  assertCloudinaryResult,
  assertValidMediaFile,
} from "@/server/utils/media-validation";
import {
  MediaPersistError,
  NotFoundError,
  ValidationError,
} from "@/server/errors";
import {
  resolveOwnerType,
  type CreateMediaInput,
  type MediaRecord,
  type MediaType,
} from "@/server/types/media";
import type { CloudinaryUploadResult, SignedUploadParams } from "@/server/media/cloudinary";
import type { MediaOwnerType } from "@prisma/client";
import { logger } from "@/server/utils/logger";

function assertCanPersist() {
  if (!isDatabaseEnabled()) {
    throw new ValidationError(
      "Media persistence requires USE_DATABASE=true and a valid DATABASE_URL (Supabase)."
    );
  }
}

export class MediaService {
  private repo = new MediaRepository();
  private cloudinary = new CloudinaryService();

  getSignedUploadParams(options?: {
    folder?: string;
    ownerType?: MediaOwnerType;
    resourceType?: "image" | "video" | "auto";
  }): SignedUploadParams {
    return this.cloudinary.createSignedUploadParams(options);
  }

  getOptimizedUrl(
    publicId: string,
    options?: Parameters<CloudinaryService["getOptimizedUrl"]>[1]
  ) {
    return this.cloudinary.getOptimizedUrl(publicId, options);
  }

  async getById(id: string): Promise<MediaRecord> {
    assertCanPersist();
    const media = await this.repo.findById(id);
    if (!media) throw new NotFoundError(`Media ${id} not found`);
    return media;
  }

  async listByProduct(productId: string): Promise<MediaRecord[]> {
    assertCanPersist();
    return this.repo.findByProductId(productId);
  }

  /**
   * Register Cloudinary upload result in Supabase (after signed client upload
   * or server-side upload). Stores only secure URL + public ID (+ metadata).
   */
  async registerUpload(input: CreateMediaInput): Promise<MediaRecord> {
    assertCanPersist();
    assertCloudinaryResult({
      publicId: input.cloudinaryPublicId,
      secureUrl: input.secureUrl,
      type: input.type,
    });

    const ownerType = resolveOwnerType(input);
    const folder =
      input.folder ?? resolveMediaFolder(ownerType, null);
    const thumbnailUrl =
      input.thumbnailUrl ??
      (input.type === "video"
        ? this.cloudinary.getThumbnailUrl(input.cloudinaryPublicId, "video")
        : null);

    try {
      return await this.repo.create({
        ...input,
        ownerType,
        folder,
        thumbnailUrl,
        displayOrder: input.displayOrder ?? 0,
      });
    } catch (error) {
      logger.error("media_persist_failed", {
        publicId: input.cloudinaryPublicId,
        message: error instanceof Error ? error.message : String(error),
      });
      throw new MediaPersistError(
        error instanceof Error ? error.message : "Database write failed",
        { publicId: input.cloudinaryPublicId }
      );
    }
  }

  /**
   * Server-side upload to Cloudinary, then persist metadata.
   * On DB failure, attempts Cloudinary rollback (delete).
   */
  async uploadAndPersist(options: {
    buffer: Buffer;
    mimeType: string;
    filename?: string;
    expectedType?: MediaType;
    productId?: string | null;
    postId?: string | null;
    designerId?: string | null;
    storyId?: string | null;
    ownerType?: MediaOwnerType;
    folder?: string;
    altText?: string | null;
    displayOrder?: number | null;
    uploadedById?: string | null;
  }): Promise<MediaRecord> {
    assertCanPersist();
    const type = assertValidMediaFile({
      mimeType: options.mimeType,
      size: options.buffer.byteLength,
      filename: options.filename,
      expectedType: options.expectedType,
    });

    const ownerType = resolveOwnerType(options);
    const folder = resolveMediaFolder(ownerType, options.folder);

    let uploaded: CloudinaryUploadResult | null = null;
    try {
      uploaded = await this.cloudinary.upload(options.buffer, type, {
        folder,
        ownerType,
      });
    } catch (cloudinaryErr) {
      logger.warn("cloudinary_upload_failed_falling_back_to_base64", {
        message:
          cloudinaryErr instanceof Error
            ? cloudinaryErr.message
            : String(cloudinaryErr),
      });

      // Automatic Fallback: Convert file buffer to Base64 Data URL
      const base64Str = options.buffer.toString("base64");
      const mime =
        options.mimeType || (type === "video" ? "video/mp4" : "image/jpeg");
      const dataUrl = `data:${mime};base64,${base64Str}`;
      const fallbackPublicId = `fallback_b64_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      uploaded = {
        type,
        cloudinaryPublicId: fallbackPublicId,
        secureUrl: dataUrl,
        width: 800,
        height: 1000,
        bytes: options.buffer.byteLength,
        format: mime.split("/")[1] || "jpeg",
        folder,
        duration: null,
        thumbnailUrl: null,
      };
    }

    if (!uploaded) {
      throw new Error("Upload failed to produce a valid media result");
    }

    const finalUploaded = uploaded;

    try {
      return await this.registerUpload({
        type: finalUploaded.type,
        cloudinaryPublicId: finalUploaded.cloudinaryPublicId,
        secureUrl: finalUploaded.secureUrl,
        width: finalUploaded.width,
        height: finalUploaded.height,
        duration: finalUploaded.duration,
        format: finalUploaded.format,
        bytes: finalUploaded.bytes,
        folder: finalUploaded.folder ?? folder,
        thumbnailUrl: finalUploaded.thumbnailUrl,
        altText: options.altText,
        displayOrder: options.displayOrder,
        productId: options.productId,
        postId: options.postId,
        designerId: options.designerId,
        storyId: options.storyId,
        ownerType,
        uploadedById: options.uploadedById,
      });
    } catch (error) {
      if (uploaded?.cloudinaryPublicId && !uploaded.cloudinaryPublicId.startsWith("fallback_b64_")) {
        try {
          await this.cloudinary.deleteMedia(
            uploaded.cloudinaryPublicId,
            uploaded.type
          );
        } catch (rollbackError) {
          logger.error("media_cloudinary_rollback_failed", {
            publicId: uploaded.cloudinaryPublicId,
            message:
              rollbackError instanceof Error
                ? rollbackError.message
                : String(rollbackError),
          });
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<{ id: string; deleted: true }> {
    assertCanPersist();
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError(`Media ${id} not found`);

    // Delete DB first so we don't orphan DB rows if Cloudinary succeeds and local fails mid-way;
    // if Cloudinary fails after DB delete, log — asset is removable via Cloudinary console.
    await this.repo.deleteById(id);

    try {
      await this.cloudinary.deleteMedia(
        existing.cloudinaryPublicId,
        existing.type
      );
    } catch (error) {
      logger.error("media_cloudinary_delete_failed", {
        id,
        publicId: existing.cloudinaryPublicId,
        message: error instanceof Error ? error.message : String(error),
      });
      // DB row already removed; surface warning via details but treat as success for API
    }

    return { id, deleted: true };
  }
}
