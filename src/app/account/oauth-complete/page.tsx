"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeInternalPath } from "@/lib/safe-redirect";
import { AuthScreen } from "@/components/auth/AuthScreen";

async function mergeGuestState() {
  try {
    await fetch("/api/cart/merge", { method: "POST" });
  } catch {
    /* optional */
  }
  try {
    const raw = localStorage.getItem("ds-cart");
    const lines: { productId: string; size: string; quantity?: number }[] = raw
      ? JSON.parse(raw)
      : [];
    for (const line of lines) {
      if (!line?.productId || !line?.size) continue;
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: line.productId,
          size: line.size,
          quantity: line.quantity || 1,
        }),
      }).catch(() => undefined);
    }
    if (lines.length) localStorage.removeItem("ds-cart");
  } catch {
    /* ignore */
  }
  try {
    const raw = localStorage.getItem("ds-wishlist");
    const productIds: string[] = raw ? JSON.parse(raw) : [];
    if (productIds.length) {
      await fetch("/api/wishlist/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });
      localStorage.removeItem("ds-wishlist");
    }
  } catch {
    /* ignore */
  }
}

function OAuthCompleteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeInternalPath(params.get("next"), "/profile");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No session after Google sign-in");

        const boot = await fetch("/api/auth/buyer-bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "buyer",
            name:
              (user.user_metadata?.full_name as string | undefined) ||
              (user.user_metadata?.name as string | undefined) ||
              undefined,
          }),
        });
        const body = await boot.json();
        if (!boot.ok || body?.ok === false) {
          throw new Error(body?.error?.message || "Account sync failed");
        }

        await mergeGuestState();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("ds:commerce-sync"));
        }
        if (!cancelled) {
          router.replace(next);
          router.refresh();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Google sign-in failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  return (
    <AuthScreen
      title="Signing you in"
      subtitle="Finishing your Designer's Street Google account…"
    >
      {error ? (
        <div className="space-y-4 text-center">
          <p className="text-xs text-red-700 bg-red-50 rounded-2xl px-3 py-2 font-medium">
            {error}
          </p>
          <button
            type="button"
            onClick={() => router.replace(`/account/login?next=${encodeURIComponent(next)}`)}
            className="text-sm font-bold text-bronze-deep"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6">
          <span className="h-8 w-8 rounded-full border-2 border-espresso/25 border-t-espresso animate-spin" />
          <p className="text-xs font-semibold text-stone uppercase tracking-wider">
            Please wait
          </p>
        </div>
      )}
    </AuthScreen>
  );
}

export default function OAuthCompletePage() {
  return (
    <Suspense
      fallback={
        <AuthScreen title="Signing you in" subtitle="Please wait…">
          <div className="flex justify-center py-8">
            <span className="h-8 w-8 rounded-full border-2 border-espresso/25 border-t-espresso animate-spin" />
          </div>
        </AuthScreen>
      }
    >
      <OAuthCompleteInner />
    </Suspense>
  );
}
