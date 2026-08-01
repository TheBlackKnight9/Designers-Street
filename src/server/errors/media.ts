import { AppError } from "./base";

export class MediaError extends AppError {
  constructor(
    message: string,
    options?: { statusCode?: number; code?: string; details?: unknown }
  ) {
    super(message, {
      statusCode: options?.statusCode ?? 500,
      code: options?.code ?? "MEDIA_ERROR",
      details: options?.details,
    });
    this.name = "MediaError";
  }
}

export class InvalidMediaFileError extends MediaError {
  constructor(message = "Invalid media file", details?: unknown) {
    super(message, {
      statusCode: 400,
      code: "INVALID_MEDIA_FILE",
      details,
    });
    this.name = "InvalidMediaFileError";
  }
}

export class MediaUploadError extends MediaError {
  constructor(message = "Media upload failed", details?: unknown) {
    super(message, {
      statusCode: 502,
      code: "MEDIA_UPLOAD_FAILED",
      details,
    });
    this.name = "MediaUploadError";
  }
}

export class CloudinaryError extends MediaError {
  constructor(message = "Cloudinary request failed", details?: unknown) {
    super(message, {
      statusCode: 502,
      code: "CLOUDINARY_ERROR",
      details,
    });
    this.name = "CloudinaryError";
  }
}

export class MediaPersistError extends MediaError {
  constructor(message = "Failed to persist media metadata", details?: unknown) {
    super(message, {
      statusCode: 500,
      code: "MEDIA_PERSIST_FAILED",
      details,
    });
    this.name = "MediaPersistError";
  }
}
