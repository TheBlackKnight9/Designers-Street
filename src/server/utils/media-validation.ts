import { InvalidMediaFileError } from "@/server/errors";
import type { MediaType } from "@/server/types/media";

const DEFAULT_IMAGE_MB = 10;
const DEFAULT_VIDEO_MB = 100;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Bytes limits — prefer MEDIA_MAX_*_MB; optional *_BYTES override. */
export function getMediaMaxBytes(type: MediaType): number {
  if (type === "image") {
    if (process.env.MEDIA_MAX_IMAGE_BYTES?.trim()) {
      return parsePositiveInt(
        process.env.MEDIA_MAX_IMAGE_BYTES,
        DEFAULT_IMAGE_MB * 1024 * 1024
      );
    }
    const mb = parsePositiveInt(process.env.MEDIA_MAX_IMAGE_MB, DEFAULT_IMAGE_MB);
    return mb * 1024 * 1024;
  }

  if (process.env.MEDIA_MAX_VIDEO_BYTES?.trim()) {
    return parsePositiveInt(
      process.env.MEDIA_MAX_VIDEO_BYTES,
      DEFAULT_VIDEO_MB * 1024 * 1024
    );
  }
  const mb = parsePositiveInt(process.env.MEDIA_MAX_VIDEO_MB, DEFAULT_VIDEO_MB);
  return mb * 1024 * 1024;
}

export const MEDIA_TYPES = {
  image: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const,
  },
  video: {
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"] as const,
    extensions: [".mp4", ".webm", ".mov"] as const,
  },
} as const;

/** @deprecated Prefer getMediaMaxBytes — kept for callers reading static shape */
export const MEDIA_LIMITS = {
  get image() {
    return {
      maxBytes: getMediaMaxBytes("image"),
      mimeTypes: MEDIA_TYPES.image.mimeTypes,
      extensions: MEDIA_TYPES.image.extensions,
    };
  },
  get video() {
    return {
      maxBytes: getMediaMaxBytes("video"),
      mimeTypes: MEDIA_TYPES.video.mimeTypes,
      extensions: MEDIA_TYPES.video.extensions,
    };
  },
};

export function detectMediaTypeFromMime(mime: string): MediaType | null {
  const lower = mime.toLowerCase();
  if (
    (MEDIA_TYPES.image.mimeTypes as readonly string[]).includes(lower)
  ) {
    return "image";
  }
  if (
    (MEDIA_TYPES.video.mimeTypes as readonly string[]).includes(lower)
  ) {
    return "video";
  }
  return null;
}

export function detectMediaTypeFromFilename(filename: string): MediaType | null {
  const lower = filename.toLowerCase();
  const ext = lower.includes(".") ? lower.slice(lower.lastIndexOf(".")) : "";
  if ((MEDIA_TYPES.image.extensions as readonly string[]).includes(ext)) {
    return "image";
  }
  if ((MEDIA_TYPES.video.extensions as readonly string[]).includes(ext)) {
    return "video";
  }
  return null;
}

export function assertValidMediaFile(input: {
  mimeType: string;
  size: number;
  filename?: string;
  expectedType?: MediaType;
}): MediaType {
  const fromMime = detectMediaTypeFromMime(input.mimeType);
  const fromName = input.filename
    ? detectMediaTypeFromFilename(input.filename)
    : null;
  const type = input.expectedType ?? fromMime ?? fromName;

  if (!type) {
    throw new InvalidMediaFileError(
      "Unsupported file type. Allowed images: jpeg, png, webp, gif. Videos: mp4, webm, mov.",
      { mimeType: input.mimeType, filename: input.filename }
    );
  }

  if (fromMime && fromMime !== type) {
    throw new InvalidMediaFileError("MIME type does not match media type", {
      mimeType: input.mimeType,
      expectedType: type,
    });
  }

  const maxBytes = getMediaMaxBytes(type);
  const mimeTypes = MEDIA_TYPES[type].mimeTypes;

  if (input.size <= 0) {
    throw new InvalidMediaFileError("Empty file is not allowed");
  }
  if (input.size > maxBytes) {
    throw new InvalidMediaFileError(
      `${type} exceeds max size of ${Math.round(maxBytes / (1024 * 1024))}MB`,
      { size: input.size, maxBytes }
    );
  }

  if (
    input.mimeType &&
    !(mimeTypes as readonly string[]).includes(input.mimeType.toLowerCase())
  ) {
    throw new InvalidMediaFileError(`Unsupported ${type} MIME type`, {
      mimeType: input.mimeType,
      allowed: mimeTypes,
    });
  }

  return type;
}

export function assertCloudinaryResult(input: {
  publicId?: string;
  secureUrl?: string;
  type?: MediaType;
}) {
  if (!input.publicId?.trim()) {
    throw new InvalidMediaFileError("cloudinaryPublicId is required");
  }
  if (!input.secureUrl?.trim() || !/^(https?:\/\/|data:)/i.test(input.secureUrl)) {
    throw new InvalidMediaFileError("secureUrl must be a valid http, https, or data URL");
  }
  if (input.type && input.type !== "image" && input.type !== "video") {
    throw new InvalidMediaFileError("type must be image or video");
  }
}
