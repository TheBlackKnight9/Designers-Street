"use client";

import { useEffect, useState, use } from "react";
import {
  fetchDashboardMe,
  getDashboardProduct,
  type DashboardProductDetail,
} from "@/lib/api/dashboard";
import { ProductEditor } from "@/components/dashboard/ProductEditor";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const [product, setProduct] = useState<DashboardProductDetail | null>(null);
  const [designerName, setDesignerName] = useState("Your house");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardProduct(productId), fetchDashboardMe()])
      .then(([p, me]) => {
        setProduct(p);
        setDesignerName(me.designer.name);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return <div className="h-96 rounded-2xl bg-mist animate-pulse" />;
  }

  if (error || !product) {
    return (
      <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
        {error || "Product not found"}
      </p>
    );
  }

  return <ProductEditor initial={product} designerName={designerName} />;
}
