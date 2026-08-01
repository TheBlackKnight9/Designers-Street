"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchDashboardMe, updateDashboardProfile } from "@/lib/api/dashboard";
import { useToast } from "@/components/dashboard/Toast";

const PRESET_TECHNIQUES = ["Zardozi", "Gota Patti", "Handloom Silk", "Chikankari", "Bandhani", "Kantha", "Brocade", "Mirror Work"];

export default function DashboardProfilePage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [form, setForm] = useState({
    name: "",
    handle: "",
    bio: "",
    foundingStory: "",
    designPhilosophy: "",
    location: "",
    website: "",
    logo: "",
    banner: "",
    offersBespoke: false,
    signatureTechniques: [] as string[],
    newTechnique: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      pinterest: "",
      youtube: "",
    },
    returnAddressLine1: "",
    returnCity: "",
    returnState: "",
    returnPincode: "",
    returnPhone: "",
  });

  useEffect(() => {
    fetchDashboardMe()
      .then((data) => {
        const d = data.designer;
        setForm({
          name: d.name || "",
          handle: d.handle || "",
          bio: d.bio || "",
          foundingStory: d.foundingStory || "",
          designPhilosophy: (d as any).designPhilosophy || "",
          location: d.location || "",
          website: d.website || "",
          logo: d.logo || "",
          banner: d.banner || "",
          offersBespoke: Boolean(d.offersBespoke),
          signatureTechniques: (d as any).signatureTechniques || ["Handloom Silk"],
          newTechnique: "",
          socialLinks: (d as any).socialLinks || { instagram: "", facebook: "", pinterest: "", youtube: "" },
          returnAddressLine1: (d as any).returnAddressLine1 || "",
          returnCity: (d as any).returnCity || "",
          returnState: (d as any).returnState || "",
          returnPincode: (d as any).returnPincode || "",
          returnPhone: (d as any).returnPhone || "",
        });
      })
      .catch((err) => push(err instanceof Error ? err.message : "Failed to load profile", "err"))
      .finally(() => setLoading(false));
  }, [push]);

  async function handleFileUpload(file: File, type: "logo" | "banner") {
    if (type === "logo") setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `designers/${type}s`);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data?.ok && data.data?.url) {
        setForm((prev) => ({ ...prev, [type]: data.data.url }));
        push(`${type.toUpperCase()} uploaded successfully`, "ok");
      } else {
        push(data?.error?.message || `Failed to upload ${type}`, "err");
      }
    } catch {
      push(`Error uploading ${type}`, "err");
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  }

  function toggleTechnique(tech: string) {
    setForm((prev) => {
      const exists = prev.signatureTechniques.includes(tech);
      return {
        ...prev,
        signatureTechniques: exists
          ? prev.signatureTechniques.filter((t) => t !== tech)
          : [...prev.signatureTechniques, tech],
      };
    });
  }

  function addCustomTechnique() {
    if (!form.newTechnique.trim()) return;
    const clean = form.newTechnique.trim();
    if (!form.signatureTechniques.includes(clean)) {
      setForm((prev) => ({
        ...prev,
        signatureTechniques: [...prev.signatureTechniques, clean],
        newTechnique: "",
      }));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDashboardProfile(form);
      push("Profile saved successfully", "ok");
    } catch (err) {
      push(err instanceof Error ? err.message : "Save failed", "err");
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-1 w-full rounded-xl border border-cloud bg-mist px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-charcoal/20 font-medium";

  if (loading) {
    return <div className="h-96 rounded-3xl bg-mist animate-pulse" />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cloud pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Designer House Profile
          </h1>
          <p className="text-xs text-stone mt-1">
            Manage your atelier brand identity, Cloudinary media assets &amp; customer view
          </p>
        </div>

        {form.handle && (
          <Link
            href={`/designer/${form.handle}`}
            target="_blank"
            className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-xs hover:bg-black"
          >
            Preview as Customer ↗
          </Link>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Media Assets (Logo & Banner Uploaders) */}
        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Brand Media Assets</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone block mb-2">
                Brand Logo Badge
              </span>
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20 rounded-2xl bg-mist border border-cloud overflow-hidden shrink-0 flex items-center justify-center font-bold text-stone">
                  {form.logo ? (
                    <Image src={form.logo} alt="Logo" fill className="object-cover" sizes="80px" />
                  ) : (
                    "LOGO"
                  )}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-mist border border-cloud rounded-xl text-xs font-bold text-charcoal hover:border-stone">
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, "logo");
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone block mb-2">
                Hero Brand Banner
              </span>
              <div className="relative h-20 rounded-2xl bg-mist border border-cloud overflow-hidden flex items-center justify-center font-bold text-stone">
                {form.banner ? (
                  <Image src={form.banner} alt="Banner" fill className="object-cover" sizes="300px" />
                ) : (
                  "BANNER"
                )}
                <label className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer text-white text-xs font-bold uppercase transition-opacity">
                  {uploadingBanner ? "Uploading..." : "Change Banner"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, "banner");
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Brand Details */}
        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Atelier Information</h2>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">House Name *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Handle (@) *</span>
              <input required value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} className={field} />
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Short Tagline / Bio</span>
            <input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={field} />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Founding Story &amp; Heritage</span>
            <textarea rows={3} value={form.foundingStory} onChange={(e) => setForm({ ...form, foundingStory: e.target.value })} className={field} />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Design Philosophy &amp; Aesthetic</span>
            <textarea rows={3} value={form.designPhilosophy} onChange={(e) => setForm({ ...form, designPhilosophy: e.target.value })} className={field} />
          </label>
        </div>

        {/* Signature Techniques Chip Manager */}
        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-3 shadow-xs">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Signature Craft Techniques</h2>
          <div className="flex flex-wrap gap-2">
            {PRESET_TECHNIQUES.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => toggleTechnique(tech)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors border ${
                  form.signatureTechniques.includes(tech)
                    ? "bg-charcoal text-paper border-charcoal"
                    : "bg-mist text-stone border-cloud hover:border-stone"
                }`}
              >
                {form.signatureTechniques.includes(tech) ? "✓ " : ""}{tech}
              </button>
            ))}
          </div>
        </div>

        {/* Return Address Form */}
        <div className="bg-white p-6 rounded-3xl border border-cloud space-y-3 shadow-xs">
          <h2 className="font-display text-sm font-bold uppercase text-charcoal">Return Shipping Address (Reverse Logistics)</h2>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Address Line 1</span>
            <input value={form.returnAddressLine1} onChange={(e) => setForm({ ...form, returnAddressLine1: e.target.value })} className={field} />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">City</span>
              <input value={form.returnCity} onChange={(e) => setForm({ ...form, returnCity: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">State</span>
              <input value={form.returnState} onChange={(e) => setForm({ ...form, returnState: e.target.value })} className={field} />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone">Pincode</span>
              <input value={form.returnPincode} onChange={(e) => setForm({ ...form, returnPincode: e.target.value })} className={field} />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md disabled:opacity-60 hover:bg-black"
        >
          {saving ? "Saving Profile…" : "Save Designer Profile"}
        </button>
      </form>
    </div>
  );
}
