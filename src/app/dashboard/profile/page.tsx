"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  fetchDashboardMe,
  updateDashboardProfile,
} from "@/lib/api/dashboard";
import { useToast } from "@/components/dashboard/Toast";

export default function DashboardProfilePage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    handle: "",
    bio: "",
    foundingStory: "",
    location: "",
    website: "",
    logo: "",
    banner: "",
    offersBespoke: false,
  });

  useEffect(() => {
    fetchDashboardMe()
      .then((data) => {
        const d = data.designer;
        setForm({
          name: d.name,
          handle: d.handle,
          bio: d.bio,
          foundingStory: d.foundingStory || "",
          location: d.location || "",
          website: d.website || "",
          logo: d.logo,
          banner: d.banner,
          offersBespoke: Boolean(d.offersBespoke),
        });
      })
      .catch((err) =>
        push(err instanceof Error ? err.message : "Failed to load", "err")
      )
      .finally(() => setLoading(false));
  }, [push]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDashboardProfile(form);
      push("Profile saved");
    } catch (err) {
      push(err instanceof Error ? err.message : "Save failed", "err");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "mt-1 w-full rounded-xl border border-cloud bg-mist px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/40";

  if (loading) {
    return <div className="h-80 rounded-2xl bg-mist animate-pulse" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="text-sm text-stone mt-1">
          Update how your designer house appears.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-xs text-stone">House name</span>
          <input
            className={field}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs text-stone">Handle</span>
          <input
            className={field}
            required
            value={form.handle}
            onChange={(e) => setForm({ ...form, handle: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs text-stone">Bio</span>
          <textarea
            className={field}
            rows={2}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs text-stone">Founding story</span>
          <textarea
            className={field}
            rows={4}
            value={form.foundingStory}
            onChange={(e) =>
              setForm({ ...form, foundingStory: e.target.value })
            }
          />
        </label>
        <label className="block">
          <span className="text-xs text-stone">Location</span>
          <input
            className={field}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs text-stone">Website</span>
          <input
            className={field}
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs text-stone">Logo URL</span>
          <input
            className={field}
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs text-stone">Banner URL</span>
          <input
            className={field}
            value={form.banner}
            onChange={(e) => setForm({ ...form, banner: e.target.value })}
          />
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.offersBespoke}
            onChange={(e) =>
              setForm({ ...form, offersBespoke: e.target.checked })
            }
          />
          Offers bespoke
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-charcoal text-paper px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
