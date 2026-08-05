"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/dashboard/Toast";
import { formatPrice } from "@/lib/mock-data";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { ChevronDown, Plus, ExternalLink } from "lucide-react";

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
  const { push } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouseId, setSelectedHouseId] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=100").then((res) => res.json()),
      fetch("/api/designers").then((res) => res.json()),
    ])
      .then(([prodRes, houseRes]) => {
        if (prodRes?.ok && Array.isArray(prodRes.data?.products)) {
          setProducts(prodRes.data.products);
        }
        if (houseRes?.ok && Array.isArray(houseRes.data?.designers)) {
          setHouses(houseRes.data.designers);
        }
      })
      .catch(() => push("Failed to load catalog", "err"))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts =
    selectedHouseId === "ALL"
      ? products
      : products.filter((p) => p.designerId === selectedHouseId);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <AdminTopBar
        title="Products Catalog Manager"
        subtitle="View, verify, and audit published items across all luxury designer houses"
        actionButton={{
          label: "New Product",
          href: "/dashboard/products/new",
        }}
      />

      {/* Toolbar Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <select
            value={selectedHouseId}
            onChange={(e) => setSelectedHouseId(e.target.value)}
            className="appearance-none bg-white border border-[#ECE8DC] text-[#1A1A1A] font-sans text-xs font-bold px-4 py-2 pr-8 rounded-full shadow-2xs outline-none cursor-pointer hover:border-[#17181D]"
          >
            <option value="ALL">All Designer Houses ({products.length})</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#8A8A8A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <span className="text-xs text-[#8A8A8A] font-semibold">
          Showing {filteredProducts.length} products
        </span>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/70 animate-pulse border border-[#ECE8DC]" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[#ECE8DC] bg-white">
          <p className="text-sm font-bold text-[#1A1A1A]">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ECE8DC] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECE8DC] text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] bg-[#FAF8F5]">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Designer House</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8DC]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <div className="w-10 h-12 rounded-lg overflow-hidden relative bg-[#F4F0E5] flex-shrink-0">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-[#ECE8DC] flex items-center justify-center text-[10px] font-bold text-[#8A8A8A] flex-shrink-0">
                            No Img
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link href={`/product/${p.id}`} className="text-xs font-bold text-[#1A1A1A] hover:underline truncate block max-w-[200px]">
                            {p.name}
                          </Link>
                          <span className="text-[10px] font-mono text-[#8A8A8A]">#{p.id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[#1A1A1A]">
                      {p.designerName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#8A8A8A] font-semibold uppercase">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#1A1A1A]">
                      {formatPrice(p.price)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold font-mono">
                      <span className={p.piecesRemaining <= 3 ? "text-red-600 font-bold" : "text-[#1A1A1A]"}>
                        {p.piecesRemaining} remaining
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminStatusBadge status={p.status || "published"} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/products/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1A1A] hover:underline"
                      >
                        Edit
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
