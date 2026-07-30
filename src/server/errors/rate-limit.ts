import { AppError } from "@/server/errors";

export class RateLimitError extends AppError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds = 60, details?: unknown) {
    super("Too many requests. Please try again later.", {
      statusCode: 429,
      code: "RATE_LIMITED",
      details,
    });
    this.name = "RateLimitError";
    this.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  }
}
