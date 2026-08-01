"use client";

import { useEffect, useState } from "react";
import { fetchDashboardMe } from "@/lib/api/dashboard";
import { ProductEditor } from "@/components/dashboard/ProductEditor";

export default function NewProductPage() {
  const [designerName, setDesignerName] = useState("Your house");

  useEffect(() => {
    fetchDashboardMe()
      .then((data) => setDesignerName(data.designer.name))
      .catch(() => undefined);
  }, []);

  return <ProductEditor designerName={designerName} />;
}
