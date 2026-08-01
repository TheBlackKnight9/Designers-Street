"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/dashboard/Toast";

type LookbookItem = {
  id: string;
  mediaUrl: string;
  mediaKind: "image" | "video";
  caption?: string;
};

type Lookbook = {
  id: string;
  title: string;
  slug: string;
  kind: string;
  season?: string;
  coverImage: string;
  description?: string;
  items?: LookbookItem[];
};

function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

export default function DesignerLookbooksPage() {
  const { push } = useToast();
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    coverImage: "",
    season: "SS26",
    description: "",
  });

  async function fetchLookbooks() {
    try {
      const res = await fetch("/api/dashboard/lookbooks");
      const body = await res.json();
      if (body?.ok && Array.isArray(body.data?.lookbooks)) {
        setLookbooks(body.data.lookbooks);
      }
    } catch {
      push("Failed to load lookbooks", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLookbooks();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.coverImage) {
      push("Title and cover image are required", "err");
      return;
    }
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    try {
      const res = await fetch("/api/dashboard/lookbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug,
          coverImage: form.coverImage,
          season: form.season,
          description: form.description,
        }),
      });
      const body = await res.json();
      if (body?.ok) {
        push("Lookbook created successfully", "ok");
        setShowCreate(false);
        setForm({ title: "", slug: "", coverImage: "", season: "SS26", description: "" });
        await fetchLookbooks();
      } else {
        push(body?.error?.message || "Failed to create lookbook", "err");
      }
    } catch {
      push("Error creating lookbook", "err");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this lookbook?")) return;
    try {
      const res = await fetch(`/api/dashboard/lookbooks/${id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (body?.ok) {
        push("Lookbook deleted", "ok");
        await fetchLookbooks();
      } else {
        push("Could not delete lookbook", "err");
      }
    } catch {
      push("Error deleting lookbook", "err");
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-stone animate-pulse">
        Loading lookbooks...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Lookbook CMS
          </h1>
          <p className="text-xs text-stone mt-1">
            Manage seasonal campaigns and editorial lookbooks
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full"
        >
          {showCreate ? "Cancel" : "+ New Lookbook"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl border border-cloud bg-paper space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal">Create Lookbook</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cloud bg-mist focus:outline-none"
                placeholder="e.g. Midnight Garden SS26"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone mb-1">Season</label>
              <input
                type="text"
                value={form.season}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cloud bg-mist focus:outline-none"
                placeholder="e.g. SS26"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone mb-1">Cover Image URL</label>
            <input
              type="url"
              required
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cloud bg-mist focus:outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cloud bg-mist focus:outline-none resize-none"
              placeholder="Lookbook story and inspiration..."
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full"
          >
            Save Lookbook
          </button>
        </form>
      )}

      {lookbooks.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-cloud bg-mist/30">
          <p className="text-sm font-semibold text-charcoal">No lookbooks published yet</p>
          <p className="text-xs text-stone mt-1">
            Create lookbooks to showcase your seasonal campaigns
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lookbooks.map((lb) => (
            <div key={lb.id} className="p-4 rounded-2xl border border-cloud bg-paper flex gap-4 shadow-sm">
              <div className="relative w-24 h-32 rounded-xl bg-mist overflow-hidden shrink-0 flex items-center justify-center font-bold text-stone text-xs">
                {isValidImageUrl(lb.coverImage) ? (
                  <Image src={lb.coverImage} alt={lb.title} fill className="object-cover" sizes="96px" />
                ) : (
                  lb.title.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone">{lb.season || "Lookbook"}</span>
                  <h3 className="text-sm font-bold text-charcoal truncate mt-0.5">{lb.title}</h3>
                  <p className="text-xs text-stone line-clamp-2 mt-1">{lb.description || "No description provided."}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(lb.id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
