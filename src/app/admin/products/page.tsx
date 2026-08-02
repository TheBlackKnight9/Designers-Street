"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/dashboard/Toast";

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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-charcoal">
            Central Catalog Manager
          </h1>
          <p className="text-xs text-stone mt-1">
            View, edit, publish, and manage inventory across all luxury designer houses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-stone">Filter by House:</label>
          <select
            value={selectedHouseId}
            onChange={(e) => setSelectedHouseId(e.target.value)}
            className="bg-white border border-cloud px-4 py-2 rounded-full text-xs font-bold outline-none shadow-xs"
          >
            <option value="ALL">All Houses ({products.length})</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <Link
            href="/dashboard/products/new"
            className="px-5 py-2.5 bg-charcoal text-paper text-xs font-bold uppercase tracking-wider rounded-full shadow-md hover:bg-black"
          >
            + New Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone">Loading products…</div>
      ) : (
        <div className="bg-white rounded-3xl border border-cloud overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cloud bg-mist/50 text-[10px] uppercase font-bold text-stone tracking-wider">
                  <th className="p-4">Item</th>
                  <th className="p-4">Designer House</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-mist/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-mist border border-cloud shrink-0">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-stone">
                              No Img
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-charcoal">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-stone">{p.designerName}</td>
                    <td className="p-4 uppercase text-stone">{p.category}</td>
                    <td className="p-4 font-bold text-charcoal">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="p-4 font-semibold text-stone">{p.piecesRemaining} pcs</td>
                    <td className="p-4">
                      <span className="bg-cloud text-charcoal px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        {p.status || "published"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/products/${p.id}`}
                        className="px-3 py-1.5 bg-charcoal text-paper font-bold text-[10px] uppercase rounded-full hover:bg-black"
                      >
                        Edit Product
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
