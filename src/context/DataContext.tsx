"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DesignerHouse, Product } from "@/lib/types";
import { DESIGNERS as initialDesigners, PRODUCTS as initialProducts } from "@/lib/mock-data";

interface DataContextType {
  designers: DesignerHouse[];
  products: Product[];
  promoBanner: string;
  addDesigner: (designer: Omit<DesignerHouse, "id">) => void;
  updateDesigner: (id: string, updates: Partial<DesignerHouse>) => void;
  deleteDesigner: (id: string) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updatePromoBanner: (text: string) => void;
  resetToDefaults: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [designers, setDesigners] = useState<DesignerHouse[]>(initialDesigners);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [promoBanner, setPromoBanner] = useState<string>(
    "⚡ FAST DELIVERY IN 48 HOURS • ✨ 100% AUTHENTIC HANDLOOM & COUTURE • 🚚 COMPLIMENTARY GLOBAL SHIPPING"
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedDesigners = localStorage.getItem("ds_designers");
      const savedProducts = localStorage.getItem("ds_products");
      const savedPromo = localStorage.getItem("ds_promo");

      if (savedDesigners) setDesigners(JSON.parse(savedDesigners));
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts) as Product[];
        // Refresh images/videos from seed so broken Unsplash URLs in old caches are fixed
        setProducts(
          parsed.map((p) => {
            const seed = initialProducts.find((s) => s.id === p.id);
            if (!seed) return p;
            return {
              ...p,
              images: seed.images?.length ? seed.images : p.images,
              // Always refresh videos from seed so new lookbook clips land for everyone
              videos: seed.videos?.length ? seed.videos : p.videos,
            };
          })
        );
      }
      if (savedPromo) setPromoBanner(savedPromo);
    } catch (e) {
      console.error("Failed to load store data from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("ds_designers", JSON.stringify(designers));
      localStorage.setItem("ds_products", JSON.stringify(products));
      localStorage.setItem("ds_promo", promoBanner);
    } catch (e) {
      console.error("Failed to save store data to localStorage", e);
    }
  }, [designers, products, promoBanner, isLoaded]);

  // Designer CRUD
  const addDesigner = (designerData: Omit<DesignerHouse, "id">) => {
    const id = `dh-${Date.now()}`;
    const newDesigner: DesignerHouse = { ...designerData, id };
    setDesigners((prev) => [newDesigner, ...prev]);
  };

  const updateDesigner = (id: string, updates: Partial<DesignerHouse>) => {
    setDesigners((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const deleteDesigner = (id: string) => {
    setDesigners((prev) => prev.filter((d) => d.id !== id));
    // Also remove products under this designer
    setProducts((prev) => prev.filter((p) => p.designerId !== id));
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, "id">) => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...productData, id };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePromoBanner = (text: string) => {
    setPromoBanner(text);
  };

  const resetToDefaults = () => {
    setDesigners(initialDesigners);
    setProducts(initialProducts);
    setPromoBanner(
      "⚡ FAST DELIVERY IN 48 HOURS • ✨ 100% AUTHENTIC HANDLOOM & COUTURE • 🚚 COMPLIMENTARY GLOBAL SHIPPING"
    );
    localStorage.removeItem("ds_designers");
    localStorage.removeItem("ds_products");
    localStorage.removeItem("ds_promo");
  };

  return (
    <DataContext.Provider
      value={{
        designers,
        products,
        promoBanner,
        addDesigner,
        updateDesigner,
        deleteDesigner,
        addProduct,
        updateProduct,
        deleteProduct,
        updatePromoBanner,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
