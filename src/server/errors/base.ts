export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options?: { statusCode?: number; code?: string; details?: unknown }
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = options?.statusCode ?? 500;
    this.code = options?.code ?? "INTERNAL_ERROR";
    this.details = options?.details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super(message, { statusCode: 404, code: "NOT_FOUND", details });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, { statusCode: 400, code: "VALIDATION_ERROR", details });
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, { statusCode: 401, code: "UNAUTHORIZED", details });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, { statusCode: 403, code: "FORBIDDEN", details });
    this.name = "ForbiddenError";
  }
}
