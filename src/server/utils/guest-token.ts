import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const GUEST_CART_COOKIE = "ds_guest_token";

export async function getGuestToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(GUEST_CART_COOKIE)?.value ?? null;
}

export async function ensureGuestToken(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(GUEST_CART_COOKIE)?.value;
  if (existing) return existing;
  const token = randomUUID();
  jar.set(GUEST_CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return token;
}
