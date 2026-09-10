"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  ChevronDown,
  Plus,
  ExternalLink,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  CheckCircle2,
  Archive,
  Eye,
  Edit3,
  SlidersHorizontal,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  designerName: string;
  designerId: string;
  category: string;
  price: number;
  status: string;
  images: string[];
  piecesRemaining: number;
};

type House = {
  id: string;
  name: string;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { push } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouseId, setSelectedHouseId] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadCatalog() {
    setLoading(true);
    try {
      // Fetch products and designers concurrently
      const [prodRes, houseRes] = await Promise.all([
        fetch("/api/admin/products")
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
        fetch("/api/admin/designers")
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      ]);

      if (prodRes?.ok && Array.isArray(prodRes.data?.products) && prodRes.data.products.length > 0) {
        const prods = prodRes.data.products;
        setProducts(prods);

        // Derive houses directly from products immediately for instant dropdown population
        const houseMap = new Map<string, string>();
        prods.forEach((p: any) => {
          if (p.designerId && p.designerName) {
            houseMap.set(p.designerId, p.designerName);
          }
        });
        if (houseMap.size > 0) {
          setHouses(Array.from(houseMap.entries()).map(([id, name]) => ({ id, name })));
        }
      } else {
        // Fallback to public products API if admin API had any issue
        const fallbackRes = await fetch("/api/products?limit=100")
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        if (fallbackRes?.ok && Array.isArray(fallbackRes.data?.items)) {
          const prods = fallbackRes.data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            designerName: item.designerName || "Designer House",
            designerId: item.designerId || "dh-unknown",
            category: item.category || "Couture",
            price: item.price,
            status: "published",
            images: item.gallery?.map((g: any) => g.url) || (item.coverImage ? [item.coverImage] : []),
            piecesRemaining: item.piecesRemaining ?? 10,
          }));
          setProducts(prods);

          const houseMap = new Map<string, string>();
          prods.forEach((p: any) => {
            if (p.designerId && p.designerName) {
              houseMap.set(p.designerId, p.designerName);
            }
          });
          if (houseMap.size > 0) {
            setHouses(Array.from(houseMap.entries()).map(([id, name]) => ({ id, name })));
          }
        }
      }

      if (houseRes?.ok && Array.isArray(houseRes.data?.houses)) {
        setHouses(
          houseRes.data.houses.map((h: any) => ({ id: h.id, name: h.name }))
        );
      }
    } catch {
      push("Failed to load catalog products", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  async function handleStatusChange(productId: string, newStatus: string) {
    setUpdatingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data?.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
        );
        push(`Product status set to ${newStatus}`, "ok");
      } else {
        push("Failed to update status", "err");
      }
    } catch {
      push("Error updating status", "err");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(productId: string, productName: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to remove "${productName}" from the catalog?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        push("Product deleted from catalog", "ok");
      } else {
        push("Failed to delete product", "err");
      }
    } catch {
      push("Error removing product", "err");
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesHouse = selectedHouseId === "ALL" || p.designerId === selectedHouseId;
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.designerName.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || (p.status || "published").toLowerCase() === statusFilter;

      return matchesHouse && matchesSearch && matchesStatus;
    });
  }, [products, selectedHouseId, search, statusFilter]);

  const publishedCount = products.filter((p) => (p.status || "published").toLowerCase() === "published").length;
  const draftCount = products.filter((p) => (p.status || "").toLowerCase() === "draft").length;
  const lowStockCount = products.filter((p) => p.piecesRemaining <= 3 && p.piecesRemaining !== null).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Products Catalog"
        subtitle="Manage, audit, and modify merchandise pricing and details across all designer houses"
        actionButton={{
          label: "New Product",
          href: "/admin/products/new",
        }}
      />

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Listed Products"
          value={String(products.length)}
          icon={<ShoppingBag className="w-4 h-4 text-zinc-900" />}
          badgeBg="bg-zinc-100 text-zinc-900"
          loading={loading}
        />
        <AdminStatCard
          label="Published Online"
          value={String(publishedCount)}
          icon={<CheckCircle2 className="w-4 h-4 text-zinc-900" />}
          badgeBg="bg-zinc-950 text-white"
          loading={loading}
        />
        <AdminStatCard
          label="Drafts / Staging"
          value={String(draftCount)}
          icon={<Archive className="w-4 h-4 text-zinc-600" />}
          badgeBg="bg-zinc-100 text-zinc-900"
          loading={loading}
        />
        <AdminStatCard
          label="Low Stock Alerts"
          value={String(lowStockCount)}
          icon={<ShoppingBag className="w-4 h-4 text-amber-600" />}
          badgeBg="bg-amber-50 text-amber-900"
          loading={loading}
        />
      </div>

      {/* Toolbar Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Filter by name, category, or house…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 pl-8 pr-3.5 py-1.5 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-colors"
            />
          </div>

          {/* Designer House Select */}
          <div className="relative">
            <select
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              disabled={loading}
              className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-medium px-3 py-1.5 pr-8 rounded-lg shadow-2xs outline-none cursor-pointer hover:bg-white focus:ring-1 focus:ring-zinc-950 transition-colors disabled:opacity-60"
            >
              <option value="ALL">
                {loading ? "Loading houses..." : `All Houses (${products.length} items)`}
              </option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 self-start sm:self-auto text-xs font-medium">
          {(["all", "published", "draft", "archived"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 capitalize rounded-md transition-all ${
                statusFilter === s
                  ? "bg-white text-zinc-950 shadow-2xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Shadcn-Styled Products Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50/75">
                  <th className="py-3 px-4">Product Name & Silhouette</th>
                  <th className="py-3 px-4">Designer House</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Retail Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-14 rounded-lg bg-zinc-200 shrink-0" />
                        <div className="space-y-2 min-w-0">
                          <div className="h-3.5 w-36 bg-zinc-200 rounded" />
                          <div className="h-2.5 w-20 bg-zinc-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 w-28 bg-zinc-200 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-20 bg-zinc-100 rounded-md" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-4 w-16 bg-zinc-200 rounded ml-auto" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-24 bg-zinc-100 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-16 bg-zinc-100 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-7 w-16 bg-zinc-100 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-3">
          <ShoppingBag className="w-8 h-8 text-zinc-400 mx-auto" />
          <div>
            <p className="text-sm font-semibold text-zinc-950">No products found</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {products.length === 0
                ? "No products listed in catalog yet. Click \"New Product\" to add your first piece."
                : "No catalog items match your search or filter settings."}
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-50/75">
                  <th className="py-3 px-4">Product Name & Silhouette</th>
                  <th className="py-3 px-4">Designer House</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Retail Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/admin/products/${p.id}`)}
                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Item Thumbnail & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-14 rounded-lg overflow-hidden relative bg-zinc-100 border border-zinc-200/80 shrink-0 group-hover:border-zinc-400 transition-colors">
                          {p.images?.[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-zinc-400">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-zinc-950 group-hover:text-zinc-700 transition-colors truncate block max-w-[260px]">
                            {p.name}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                            #{p.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Designer House */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-medium text-zinc-800">{p.designerName}</span>
                      </div>
                    </td>

                    {/* Category Tag */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md text-[11px] font-medium border border-zinc-200/60">
                        {p.category}
                      </span>
                    </td>

                    {/* Retail Price */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-950 text-right">
                      {formatPrice(p.price)}
                    </td>

                    {/* Stock Status Indicator */}
                    <td className="py-3.5 px-4">
                      {p.piecesRemaining === null ? (
                        <span className="inline-flex items-center gap-1.5 text-zinc-700 font-medium text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Made to Order
                        </span>
                      ) : p.piecesRemaining <= 3 ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          {p.piecesRemaining} units left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-zinc-800 font-medium text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {p.piecesRemaining} in stock
                        </span>
                      )}
                    </td>

                    {/* Status with Quick Toggle */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <AdminStatusBadge status={p.status || "published"} />
                        <select
                          disabled={updatingId === p.id}
                          value={p.status || "published"}
                          onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          className="text-[11px] bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5 text-zinc-700 outline-none cursor-pointer hover:bg-white"
                        >
                          <option value="published">Publish</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archive</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        {/* Primary Edit Button */}
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>

                        {/* View in Storefront */}
                        <Link
                          href={`/product/${p.id}`}
                          target="_blank"
                          title="View on public storefront"
                          className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(p.id, p.name, e)}
                          title="Delete product"
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50/40">
            <span>
              Showing <strong className="text-zinc-900">{filteredProducts.length}</strong> of{" "}
              <strong className="text-zinc-900">{products.length}</strong> products
            </span>
            <span className="text-[11px] text-zinc-400">
              Click any row to edit pricing, stock &amp; media
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
