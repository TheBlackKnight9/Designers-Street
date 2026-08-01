"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";

type Variant = {
  id?: string;
  size: string;
  color?: string;
  sku: string;
  stock: number;
};

type ProductInventory = {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  piecesRemaining: number | null;
  totalStock: number;
  isConcept: boolean;
  listingType: string;
  variants: Variant[];
};

export default function InventoryDashboardPage() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock" | "concept">("all");

  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    conceptCount: 0,
  });

  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [designerHandle, setDesignerHandle] = useState<string>("STUDIO");

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/inventory");
      const data = await res.json();
      if (data?.ok) {
        setMetrics(data.data.metrics);
        setProducts(data.data.products);
        if (data.data.designerHandle) {
          setDesignerHandle(data.data.designerHandle);
        }
      }
    } catch {
      push("Failed to load inventory data", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  function handleStockChange(productId: string, size: string, color: string, stockVal: number) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;

        const existingVar = p.variants.find((v) => v.size === size && (v.color || "") === color);

        let updatedVariants: Variant[];
        if (existingVar) {
          updatedVariants = p.variants.map((v) =>
            v.size === size && (v.color || "") === color ? { ...v, stock: stockVal } : v
          );
        } else {
          const sanitizedHandle = designerHandle.toUpperCase().replace(/[^A-Z0-9]/g, "");
          const sanitizedProdId = productId.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
          const sanitizedSize = size.toUpperCase().replace(/[^A-Z0-9]/g, "");
          const sanitizedColor = color ? color.toUpperCase().replace(/[^A-Z0-9]/g, "") : "STD";
          const generatedSku = `DS-${sanitizedHandle}-${sanitizedProdId}-${sanitizedSize}-${sanitizedColor}`;

          updatedVariants = [...p.variants, { size, color, stock: stockVal, sku: generatedSku }];
        }

        const newTotalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

        return {
          ...p,
          variants: updatedVariants,
          totalStock: newTotalStock,
          piecesRemaining: newTotalStock,
        };
      })
    );
  }

  async function saveProductInventory(productId: string) {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setSavingId(productId);
    try {
      const res = await fetch("/api/dashboard/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          variants: prod.variants,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        push(`Saved SKU inventory for ${prod.name}`, "ok");
      } else {
        push(data?.error?.message || "Failed to save inventory", "err");
      }
    } catch {
      push("Save error", "err");
    } finally {
      setSavingId(null);
    }
  }

  const filteredProducts = products.filter((p) => {
    if (filter === "concept") return p.isConcept;
    if (filter === "in_stock") return !p.isConcept && p.totalStock >= 5;
    if (filter === "low_stock") return !p.isConcept && p.totalStock > 0 && p.totalStock < 5;
    if (filter === "out_of_stock") return !p.isConcept && p.totalStock === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Inventory Studio &amp; Multi-Variant SKU Manager
          </h1>
          <p className="text-xs text-stone mt-1">
            Manage per-size/color stock quantities, SKU codes, and auto out-of-stock guards
          </p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-black"
        >
          + Add Product
        </Link>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-cloud">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">Total Items</span>
          <p className="font-display text-2xl font-bold text-charcoal mt-1">{metrics.totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-cloud">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">Total Units</span>
          <p className="font-display text-2xl font-bold text-charcoal mt-1">{metrics.totalStockCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">Low Stock (&lt;5)</span>
          <p className="font-display text-2xl font-bold text-amber-900 mt-1">{metrics.lowStockCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 block">Out of Stock</span>
          <p className="font-display text-2xl font-bold text-red-900 mt-1">{metrics.outOfStockCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gold/30 bg-gold/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">Concept Previews</span>
          <p className="font-display text-2xl font-bold text-charcoal mt-1">{metrics.conceptCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-cloud pb-1 overflow-x-auto">
        {[
          { key: "all", label: "All Items" },
          { key: "in_stock", label: "In Stock" },
          { key: "low_stock", label: "Low Stock Alerts" },
          { key: "out_of_stock", label: "Out of Stock" },
          { key: "concept", label: "Concept Art Previews" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
              filter === tab.key
                ? "bg-charcoal text-paper"
                : "bg-white text-stone border border-cloud hover:bg-mist"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 rounded-3xl bg-mist animate-pulse" />
          <div className="h-40 rounded-3xl bg-mist animate-pulse" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-cloud bg-white">
          <p className="text-sm font-semibold text-charcoal">No inventory items in this filter</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProducts.map((p) => {
            const sizeList = p.sizes.length > 0 ? p.sizes : ["XS", "S", "M", "L", "XL"];
            const colorList = p.colors.length > 0 ? p.colors : ["Standard"];

            return (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cloud pb-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] && (
                      <div className="w-12 h-16 rounded-xl overflow-hidden border border-cloud shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold text-charcoal">{p.name}</span>
                        {p.isConcept ? (
                          <span className="px-2.5 py-0.5 bg-gold/20 text-gold-dark text-[9px] font-extrabold uppercase rounded-full">
                            Concept Runway Preview
                          </span>
                        ) : p.totalStock === 0 ? (
                          <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-[9px] font-extrabold uppercase rounded-full">
                            Out of Stock
                          </span>
                        ) : p.totalStock < 5 ? (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-extrabold uppercase rounded-full">
                            Low Stock Alert ({p.totalStock} left)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase rounded-full">
                            In Stock ({p.totalStock} units)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone mt-0.5">
                        {p.category} · {p.isConcept ? "Bespoke Request Only" : `₹${p.price.toLocaleString("en-IN")}`}
                      </p>
                    </div>
                  </div>

                  {!p.isConcept && (
                    <button
                      type="button"
                      disabled={savingId === p.id}
                      onClick={() => saveProductInventory(p.id)}
                      className="px-6 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-black disabled:opacity-60"
                    >
                      {savingId === p.id ? "Saving SKUs…" : "Save Inventory"}
                    </button>
                  )}
                </div>

                {/* Variant Stock Grid */}
                {!p.isConcept ? (
                  <div className="space-y-3 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">
                      Size &amp; Color Variant Stock Slices
                    </span>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-cloud text-[10px] font-bold uppercase text-stone">
                            <th className="py-2 px-2">Size</th>
                            <th className="py-2 px-2">Color Variant</th>
                            <th className="py-2 px-2">SKU Code</th>
                            <th className="py-2 px-2 text-right">Stock Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizeList.flatMap((sz) =>
                            colorList.map((cl) => {
                              const variant = p.variants.find(
                                (v) => v.size === sz && (v.color || "Standard") === cl
                              );
                              const currentStock = variant ? variant.stock : 0;
                              const sku =
                                variant?.sku ||
                                `DS-${designerHandle.toUpperCase().slice(0, 4)}-${p.id.toUpperCase().slice(0, 6)}-${sz.toUpperCase()}-${cl.toUpperCase().slice(0, 3)}`;

                              return (
                                <tr key={`${sz}-${cl}`} className="border-b border-cloud/40">
                                  <td className="py-2 px-2 font-bold text-charcoal">{sz}</td>
                                  <td className="py-2 px-2 text-stone">{cl}</td>
                                  <td className="py-2 px-2 font-mono text-[11px] text-stone">{sku}</td>
                                  <td className="py-1 px-2 text-right">
                                    <input
                                      type="number"
                                      min={0}
                                      value={currentStock}
                                      onChange={(e) =>
                                        handleStockChange(
                                          p.id,
                                          sz,
                                          cl === "Standard" ? "" : cl,
                                          Number(e.target.value || 0)
                                        )
                                      }
                                      className="w-20 bg-mist border border-cloud rounded-lg px-2 py-1.5 text-xs text-right font-mono font-bold text-charcoal outline-none focus:ring-2 focus:ring-gold/40"
                                    />
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone italic">
                    Concept Art items are non-inventoried prototypes. Buyers submit custom inquiries via PDP.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
