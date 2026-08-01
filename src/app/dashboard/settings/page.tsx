"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDashboardMe } from "@/lib/api/dashboard";
import { createClient } from "@/lib/supabase/client";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    fetchDashboardMe()
      .then((data) => {
        setEmail(data.user.email);
        setName(data.user.name || "");
      })
      .catch(() => undefined);
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-sm text-stone mt-1">Account and session.</p>
      </div>

      <div className="rounded-2xl border border-cloud bg-mist/40 p-5 space-y-3 text-sm">
        <div>
          <p className="text-xs tracking-label uppercase text-stone">Name</p>
          <p className="mt-1">{name || "—"}</p>
        </div>
        <div>
          <p className="text-xs tracking-label uppercase text-stone">Email</p>
          <p className="mt-1">{email || "—"}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="rounded-full border border-cloud px-5 py-2.5 text-sm"
      >
        Log out
      </button>
    </div>
  );
}
