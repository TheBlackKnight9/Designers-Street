import { NextResponse } from "next/server";
import { AppError, RateLimitError } from "@/server/errors";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T, init?: ResponseInit & { meta?: Record<string, unknown> }) {
  const body: ApiSuccess<T> = {
    ok: true,
    data,
    ...(init?.meta ? { meta: init.meta } : {}),
  };
  const responseInit: ResponseInit = {};
  if (init?.status) responseInit.status = init.status;
  if (init?.headers) responseInit.headers = init.headers;
  if (init?.statusText) responseInit.statusText = init.statusText;
  return NextResponse.json(body, { status: 200, ...responseInit });
}

export function fail(
  error: unknown,
  fallbackStatus = 500
): NextResponse<ApiFailure> {
  if (error instanceof AppError) {
    const headers = new Headers();
    if (error instanceof RateLimitError) {
      headers.set("Retry-After", String(error.retryAfterSeconds));
    }
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode, headers }
    );
  }

  const message =
    error instanceof Error ? error.message : "Unexpected server error";

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          process.env.NODE_ENV === "production"
            ? "Unexpected server error"
            : message,
      },
    },
    { status: fallbackStatus }
  );
}
