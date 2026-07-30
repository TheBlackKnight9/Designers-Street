import { getOptionalAuthUser } from "@/server/auth/buyer-session";
import { ensureGuestToken, getGuestToken } from "@/server/utils/guest-token";

export async function resolveCartIdentity(options?: {
  ensureGuest?: boolean;
}): Promise<{ userId: string | null; guestToken: string | null }> {
  const user = await getOptionalAuthUser();
  if (user) {
    return { userId: user.id, guestToken: null };
  }
  if (options?.ensureGuest) {
    const guestToken = await ensureGuestToken();
    return { userId: null, guestToken };
  }
  const guestToken = await getGuestToken();
  return { userId: null, guestToken };
}
