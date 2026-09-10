"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Image as ImageIcon,
  Check,
  Sparkles,
  AlertCircle,
  Trash2,
  Eye,
  Store,
  DollarSign,
  Percent,
  Package,
  ShieldCheck,
  Layers,
  Scissors,
  Tag,
  Link as LinkIcon,
  HelpCircle,
} from "lucide-react";
import { ProductColorPicker } from "@/components/admin/ProductColorPicker";
import { ProductSizeSelector } from "@/components/admin/ProductSizeSelector";
import type { WearCategory } from "@/components/admin/SizeChartModal";

type DesignerHouse = {
  id: string;
  name: string;
  handle: string;
  logo?: string | null;
  commissionRate?: number;
};

const SAMPLE_LUXURY_IMAGES = [
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80",
];

const STANDARD_CATEGORIES = [
  "Outerwear & Coats",
  "Dresses & Evening Gowns",
  "Sarees & Kurta Ensembles",
  "Tailoring & Blazers",
  "Tops & Blouses",
  "Trousers & Skirts",
  "Accessories & Leatherware",
  "Footwear",
  "Fine Jewelry",
  "Artisan Prototype",
];

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Custom Bespoke"];
const STANDARD_COLORS = ["Midnight Black", "Ivory White", "Champagne Gold", "Emerald Green", "Royal Crimson", "Earthy Sand", "Raw Indigo"];
const POPULAR_TAGS = ["Runway Edition", "Handloom Silk", "Made to Measure", "Zardozi", "Sustainable Luxury", "Festive Couture"];

export default function AdminNewProductPage() {
  const router = useRouter();
  const { push } = useToast();

  // House selector state
  const [houses, setHouses] = useState<DesignerHouse[]>([]);
  const [selectedHouseId, setSelectedHouseId] = useState<string>("");
  const [loadingHouses, setLoadingHouses] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Outerwear & Coats");
  const [subcategory, setSubcategory] = useState("");
  const [gender, setGender] = useState<"women" | "men" | "unisex">("women");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [piecesRemaining, setPiecesRemaining] = useState("10");
  const [unlimitedStock, setUnlimitedStock] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["Jet Black"]);
  const [wearType, setWearType] = useState<WearCategory>("TOP");
  const [tags, setTags] = useState<string[]>(["Runway Edition"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [deliveryText, setDeliveryText] = useState("Dispatched in 3-5 business days");
  const [customizable, setCustomizable] = useState(false);
  const [limitedEdition, setLimitedEdition] = useState(false);
  const [listingType, setListingType] = useState<"COMMERCIAL" | "CONCEPT_ART">("COMMERCIAL");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [weightGrams, setWeightGrams] = useState("750");

  function handleCategoryChange(newCat: string) {
    setCategory(newCat);
    if (newCat === "Trousers & Skirts") {
      setWearType("BOTTOM");
      setSelectedSizes(gender === "men" ? ['30"', '32"', '34"'] : ['28"', '30"', '32"']);
    } else if (newCat === "Sarees & Kurta Ensembles" || newCat === "Dresses & Evening Gowns") {
      setWearType("ENSEMBLE");
      setSelectedSizes(["Free Size", "S", "M", "L"]);
    } else if (
      newCat === "Accessories & Leatherware" ||
      newCat === "Footwear" ||
      newCat === "Fine Jewelry"
    ) {
      setWearType("ACCESSORY");
      setSelectedSizes(["One Size"]);
    } else {
      setWearType("TOP");
      setSelectedSizes(["S", "M", "L"]);
    }
  }

  // Luxury Craft Story
  const [craftOrigin, setCraftOrigin] = useState("Varanasi, India");
  const [material, setMaterial] = useState("100% Pure Mulberry Silk");
  const [technique, setTechnique] = useState("Handwoven Jacquard & Zari");
  const [showCraftStory, setShowCraftStory] = useState(true);

  // Media Gallery State
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);

  // Load houses
  useEffect(() => {
    async function loadHouses() {
      try {
        const res = await fetch("/api/admin/designers");
        const body = await res.json();
        if (body?.ok && Array.isArray(body.data?.houses)) {
          const list: DesignerHouse[] = body.data.houses;
          setHouses(list);

          // Read cookie or pick first house
          const match = document.cookie
            .split("; ")
            .find((row) => row.startsWith("admin_active_designer_id="));
          const activeCookie = match ? match.split("=")[1] : "";
          if (activeCookie && list.some((h) => h.id === activeCookie)) {
            setSelectedHouseId(activeCookie);
          } else if (list.length > 0) {
            setSelectedHouseId(list[0].id);
          }
        }
      } catch {
        push("Failed to load designer houses", "err");
      } finally {
        setLoadingHouses(false);
      }
    }
    loadHouses();
  }, [push]);

  const selectedHouse = useMemo(() => {
    return houses.find((h) => h.id === selectedHouseId) || houses[0] || null;
  }, [houses, selectedHouseId]);

  // Pricing calculations
  const numericPrice = Number(price) || 0;
  const numericMrp = Number(mrp) || 0;
  const discountPercent =
    numericMrp > numericPrice && numericMrp > 0
      ? Math.round(((numericMrp - numericPrice) / numericMrp) * 100)
      : 0;

  const platformCommissionRate = 0.10; // 10%
  const platformFee = Math.round(numericPrice * platformCommissionRate);
  const gstOnFee = Math.round(platformFee * 0.18);
  const tcsDeduction = Math.round(numericPrice * 0.01);
  const estimatedNetPayout = Math.max(0, numericPrice - platformFee - gstOnFee - tcsDeduction);

  // Handle local file uploads
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Sign upload attempt with Cloudinary
        try {
          const signRes = await fetch("/api/dashboard/media/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ownerType: "product", resourceType: "image" }),
          });
          const signData = await signRes.json();

          if (signRes.ok && signData?.ok && signData.data?.signature) {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("api_key", signData.data.apiKey);
            fd.append("timestamp", String(signData.data.timestamp));
            fd.append("signature", signData.data.signature);
            fd.append("folder", signData.data.folder);

            const uploadRes = await fetch(
              `https://api.cloudinary.com/v1_1/${signData.data.cloudName}/image/upload`,
              { method: "POST", body: fd }
            );
            const uploadJson = await uploadRes.json();
            if (uploadJson?.secure_url) {
              newUrls.push(uploadJson.secure_url);
              continue;
            }
          }
        } catch {
          /* fallback to data URL */
        }

        // Fallback to local Data URL
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newUrls.push(dataUrl);
      }

      setImages((prev) => [...prev, ...newUrls]);
      push(`Added ${newUrls.length} media asset(s)`, "ok");
    } catch {
      push("Error uploading images", "err");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleAddImageUrl() {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
    push("Image URL appended to gallery", "ok");
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSetAsCover(index: number) {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
    push("Cover photo updated", "ok");
  }

  function handleAddSampleImage(url: string) {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
      push("Editorial runway look added", "ok");
    }
  }

  function toggleSize(s: string) {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleColor(c: string) {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function handleAddCustomTag() {
    if (!customTagInput.trim()) return;
    const clean = customTagInput.trim();
    if (!tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setCustomTagInput("");
  }

  function handleRemoveTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function handleSubmit(saveStatus: "published" | "draft") {
    if (!name.trim()) {
      push("Please enter a product title", "err");
      return;
    }
    if (!numericPrice || numericPrice <= 0) {
      push("Please enter a valid retail price", "err");
      return;
    }
    if (!selectedHouseId) {
      push("Please select a designer house for this product", "err");
      return;
    }

    setSubmitting(true);
    try {
      // Sync active house cookie for consistency
      document.cookie = `admin_active_designer_id=${selectedHouseId}; path=/; max-age=86400`;

      const payload = {
        designerId: selectedHouseId,
        name: name.trim(),
        description: description.trim() || `${name} by ${selectedHouse?.name || "Designer House"}.`,
        category,
        subcategory: subcategory.trim() || null,
        gender,
        price: numericPrice,
        mrp: numericMrp > 0 ? numericMrp : null,
        basePrice: basePrice ? Number(basePrice) : null,
        sizes: selectedSizes,
        colors: selectedColors,
        tags,
        piecesRemaining: unlimitedStock ? null : Number(piecesRemaining) || 0,
        deliveryText: deliveryText.trim() || null,
        customizable,
        limitedEdition,
        status: saveStatus,
        listingType,
        images: images.length > 0 ? images : [SAMPLE_LUXURY_IMAGES[0]],
        story: showCraftStory ? `${material} crafted in ${craftOrigin} using ${technique}.` : null,
        craftOrigin: showCraftStory ? craftOrigin : null,
        material: showCraftStory ? material : null,
        technique: showCraftStory ? technique : null,
        weightGrams: weightGrams ? Number(weightGrams) : 500,
        countryOfOrigin: "India",
      };

      const res = await fetch("/api/dashboard/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        push(
          saveStatus === "published"
            ? "Product published successfully to marketplace!"
            : "Product saved as draft.",
          "ok"
        );
        router.push("/admin/products");
      } else {
        push(data?.error?.message || "Failed to create product", "err");
      }
    } catch {
      push("Network error while creating product", "err");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 font-sans pb-24 max-w-7xl mx-auto">
      {/* Top Header / Sticky Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products Catalog</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Add New Product
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200">
              Admin Direct
            </span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/products"
            className="px-3.5 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("draft")}
            className="px-4 py-2 text-xs font-medium text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("published")}
            className="px-5 py-2 text-xs font-medium text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-colors shadow-xs active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>{submitting ? "Publishing..." : "Publish Product"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Catalog Content (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Designer House Assignment (CRITICAL REQUIREMENT) */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-zinc-800" />
                <h2 className="text-sm font-semibold text-zinc-950">
                  Designer House / Atelier Assignment
                </h2>
              </div>
              <span className="text-[11px] text-zinc-500">
                Direct assignment without switching account
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Select Publishing House <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedHouseId}
                  onChange={(e) => setSelectedHouseId(e.target.value)}
                  className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-colors cursor-pointer"
                >
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} (@{h.handle})
                    </option>
                  ))}
                </select>
              </div>

              {selectedHouse && (
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/70 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-zinc-950 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {selectedHouse.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-950 truncate">{selectedHouse.name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">@{selectedHouse.handle}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: General Information */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-950 border-b border-zinc-100 pb-3">
              Title & Narrative
            </h2>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Silk Organza Hand-Embroidered Trench Coat"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Editorial Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the silhouette, hand-feel, artisan craftsmanship, draping, and styling advice..."
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg p-3 text-xs font-normal text-zinc-900 leading-relaxed outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-colors"
              />
            </div>

            {/* Luxury Craft Story Accordion */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCraftStory(!showCraftStory)}
                className="text-xs font-medium text-zinc-700 hover:text-zinc-950 flex items-center gap-1.5 transition-colors"
              >
                <Scissors className="w-3.5 h-3.5 text-zinc-500" />
                <span>{showCraftStory ? "Hide Craft & Heritage Details" : "+ Add Craft Origin & Technique"}</span>
              </button>

              {showCraftStory && (
                <div className="grid sm:grid-cols-3 gap-3 pt-3 mt-2 border-t border-zinc-100">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Craft Origin
                    </label>
                    <input
                      type="text"
                      value={craftOrigin}
                      onChange={(e) => setCraftOrigin(e.target.value)}
                      placeholder="e.g. Varanasi, India"
                      className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Material / Fabric
                    </label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. 100% Mulberry Silk"
                      className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Artisan Technique
                    </label>
                    <input
                      type="text"
                      value={technique}
                      onChange={(e) => setTechnique(e.target.value)}
                      placeholder="e.g. Zardozi Embroidery"
                      className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Media & Imagery (Shopify / Farfetch style) */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-950">
                  Media & Asset Gallery
                </h2>
                <p className="text-xs text-zinc-500">
                  Upload high-res imagery, lookbook crops, or direct CDN links
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-zinc-500">
                {images.length} asset(s)
              </span>
            </div>

            {/* Upload Options Row */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* File Upload Trigger */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "Uploading files..." : "Upload Device Photos"}</span>
                </button>

                {/* Direct Image URL input */}
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-lg text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium rounded-lg transition-colors shadow-2xs"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Sample Quick Asset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 pt-1">
                <span className="text-[11px] font-medium text-zinc-400">Quick samples:</span>
                {SAMPLE_LUXURY_IMAGES.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSampleImage(url)}
                    className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-[11px] text-zinc-700 transition-colors"
                  >
                    + Look {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-3/4 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shadow-2xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Product asset ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Primary Badge */}
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 bg-zinc-950 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
                        Primary Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(idx)}
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-white/90 text-zinc-900 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm hover:bg-white transition-opacity"
                      >
                        Set as Cover
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 w-6 h-6 rounded bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 text-center rounded-lg border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 cursor-pointer transition-colors space-y-1"
              >
                <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs font-semibold text-zinc-900">
                  Drop photographs here or browse
                </p>
                <p className="text-[11px] text-zinc-500">
                  Supports JPG, PNG, WEBP up to 20MB
                </p>
              </div>
            )}
          </div>

          {/* Card 4: Taxonomy, Variants & Sizing */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-950 border-b border-zinc-100 pb-3">
              Taxonomy, Sizing & Variants
            </h2>

            {/* Gender Pills */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Department / Target Gender
              </label>
              <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-medium">
                {(["women", "men", "unisex"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`px-4 py-1.5 rounded-md capitalize transition-colors ${
                      gender === g
                        ? "bg-white text-zinc-950 font-semibold shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Primary Category
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-colors"
                >
                  {STANDARD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Subcategory / Silhouette
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Belted Trench, Fluted Lehenga"
                  className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-colors"
                />
              </div>
            </div>

            {/* Wear Type, Classification & Available Sizing with Interactive Size Chart */}
            <ProductSizeSelector
              selectedSizes={selectedSizes}
              onChange={setSelectedSizes}
              gender={gender}
              wearType={wearType}
              onWearTypeChange={setWearType}
            />

            {/* Curated 12 Basic Colors Palette & Custom Couture Colorway Input */}
            <ProductColorPicker
              selectedColors={selectedColors}
              onChange={setSelectedColors}
            />

            {/* Style & Editorial Tags */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Tags & Editorial Keywords
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-medium px-2.5 py-0.5 rounded-md"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="Add custom keyword (press Enter)..."
                  className="w-64 bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pricing, Inventory, Settlement & Live Preview */}
        <div className="space-y-6">
          {/* Card 5: Pricing & Financials */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-950 border-b border-zinc-100 pb-3">
              Pricing & Economics
            </h2>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Retail Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 48000"
                  className="w-full pl-7 pr-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-lg text-xs font-mono font-semibold text-zinc-950 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-700">
                  Compare-at MRP (₹)
                </label>
                {discountPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="e.g. 58000"
                  className="w-full pl-7 pr-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-lg text-xs font-mono font-medium text-zinc-600 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Base Garment Cost (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 22000"
                  className="w-full pl-7 pr-3 py-2 bg-zinc-50/60 border border-zinc-200 rounded-lg text-xs font-mono font-medium text-zinc-600 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
                />
              </div>
            </div>

            {/* Real-Time Commission & Settlement Breakdown */}
            {numericPrice > 0 && (
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80 space-y-2 text-xs">
                <p className="font-semibold text-zinc-900 text-[11px] uppercase tracking-wider">
                  Settlement Breakdown (Est.)
                </p>
                <div className="space-y-1 text-zinc-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>10% Platform Commission:</span>
                    <span className="font-mono text-zinc-900">-{formatPrice(platformFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>18% GST on Commission:</span>
                    <span className="font-mono text-zinc-900">-{formatPrice(gstOnFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1% TCS (Sec 52):</span>
                    <span className="font-mono text-zinc-900">-{formatPrice(tcsDeduction)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-1 font-semibold text-zinc-950">
                    <span>Net Designer Payout:</span>
                    <span className="font-mono text-emerald-800">{formatPrice(estimatedNetPayout)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 6: Inventory & Attributes */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-950 border-b border-zinc-100 pb-3">
              Inventory & Logistics
            </h2>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Pieces Remaining in Stock
              </label>
              <input
                type="number"
                min="0"
                disabled={unlimitedStock}
                value={piecesRemaining}
                onChange={(e) => setPiecesRemaining(e.target.value)}
                className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono font-medium text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 disabled:opacity-50"
              />
              <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unlimitedStock}
                  onChange={(e) => setUnlimitedStock(e.target.checked)}
                  className="w-3.5 h-3.5 accent-zinc-950 rounded"
                />
                <span className="text-[11px] text-zinc-600">
                  Made to order / unlimited atelier inventory
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Shipping & Delivery Estimate
              </label>
              <input
                type="text"
                value={deliveryText}
                onChange={(e) => setDeliveryText(e.target.value)}
                placeholder="e.g. Dispatched in 3-5 business days"
                className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Package Weight (Grams)
              </label>
              <input
                type="number"
                min="0"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div className="space-y-2 pt-1 border-t border-zinc-100">
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 cursor-pointer">
                <span className="text-xs font-medium text-zinc-800">Customization Available</span>
                <input
                  type="checkbox"
                  checked={customizable}
                  onChange={(e) => setCustomizable(e.target.checked)}
                  className="w-4 h-4 accent-zinc-950 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 cursor-pointer">
                <span className="text-xs font-medium text-zinc-800">Limited Edition Run</span>
                <input
                  type="checkbox"
                  checked={limitedEdition}
                  onChange={(e) => setLimitedEdition(e.target.checked)}
                  className="w-4 h-4 accent-zinc-950 rounded"
                />
              </label>
            </div>
          </div>

          {/* Card 7: Live Storefront Card Preview */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs font-semibold text-zinc-950">Storefront Preview</span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">
                Customer View
              </span>
            </div>

            <div className="p-4">
              <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                {/* Image */}
                <div className="relative aspect-3/4 bg-zinc-100">
                  {images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-1">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[11px]">No cover image</span>
                    </div>
                  )}

                  {discountPercent > 0 && (
                    <span className="absolute top-2 left-2 bg-zinc-950 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-3 space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {selectedHouse?.name || "Designer House"}
                  </p>
                  <h3 className="text-xs font-semibold text-zinc-950 line-clamp-1">
                    {name || "Untitled Product"}
                  </h3>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-xs font-bold text-zinc-950 font-mono">
                      {formatPrice(numericPrice)}
                    </span>
                    {numericMrp > numericPrice && (
                      <span className="text-[11px] font-mono text-zinc-400 line-through">
                        {formatPrice(numericMrp)}
                      </span>
                    )}
                  </div>
                  {selectedSizes.length > 0 && (
                    <p className="text-[10px] text-zinc-500 font-mono pt-1">
                      Sizes: {selectedSizes.join(", ")}
                    </p>
                  )}
                  {selectedColors.length > 0 && (
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-[10px] text-zinc-500">Colors:</span>
                      <span className="text-[10px] font-medium text-zinc-800 truncate">
                        {selectedColors.slice(0, 3).join(", ")}
                        {selectedColors.length > 3 ? ` +${selectedColors.length - 3}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
