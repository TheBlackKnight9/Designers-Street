import { ValidationError } from "@/server/errors";

export function requireString(
  value: unknown,
  field: string
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }
  return value.trim();
}

export function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new ValidationError("Expected a string");
  }
  return value.trim();
}

export function parseLimit(value: string | null, fallback = 20, max = 50): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(n, max);
}

export function assertNever(value: never): never {
  throw new ValidationError(`Unexpected value: ${String(value)}`);
}
