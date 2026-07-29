"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { DesignerHouse, Product } from "@/lib/types";
import { formatPrice } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const {
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
  } = useData();

  // Active admin section tab: "overview" | "designers" | "products" | "curation"
  const [activeTab, setActiveTab] = useState<"overview" | "designers" | "products" | "curation">("overview");

  // Selected item for Right Inspector Panel
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);

  // Selected designer for product filtering in admin
  const [selectedDesignerFilter, setSelectedDesignerFilter] = useState<string>("all");

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Designer Form Modals
  const [showAddDesignerModal, setShowAddDesignerModal] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState<DesignerHouse | null>(null);

  // Designer Form State
  const [designerForm, setDesignerForm] = useState({
    name: "",
    handle: "",
    location: "",
    bio: "",
    foundingStory: "",
    logo: "",
    banner: "",
    website: "",
    signatureTechniques: "",
    verified: true,
    exclusive: true,
    offersBespoke: true,
  });

  // Product Form Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: "",
    designerId: "",
    price: 50000,
    mrp: 60000,
    bestPrice: 45000,
    category: "lehengas",
    subcategory: "bridal",
    gender: "women" as "women" | "men" | "unisex",
    images: "",
    sizes: "S, M, L, XL",
    description: "",
    story: "",
    craftOrigin: "",
    material: "",
    technique: "",
    occasion: "Bridal",
    tags: "bridal, lehenga, couture",
    piecesRemaining: 5,
    limitedEdition: true,
    customizable: true,
    deliveryText: "Delivery within 48 hours",
  });

  // Promo Banner state
  const [bannerInput, setBannerInput] = useState(promoBanner);

  // Open Designer Add/Edit
  const handleOpenAddDesigner = () => {
    setEditingDesigner(null);
    setDesignerForm({
      name: "",
      handle: "",
      location: "Mumbai, India",
      bio: "High-end couture & occasion wear.",
      foundingStory: "Crafting timeless silhouettes with master artisans.",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80",
      banner: "https://images.unsplash.com/photo-1610031340484-485bb87b2733?w=1600&q=80",
      website: "www.designersstreet.com",
      signatureTechniques: "Hand Embroidery, Zardozi, Silk Weaving",
      verified: true,
      exclusive: true,
      offersBespoke: true,
    });
    setShowAddDesignerModal(true);
  };

  const handleOpenEditDesigner = (d: DesignerHouse) => {
    setEditingDesigner(d);
    setDesignerForm({
      name: d.name,
      handle: d.handle,
      location: d.location,
      bio: d.bio,
      foundingStory: d.foundingStory,
      logo: d.logo,
      banner: d.banner,
      website: d.website || "",
      signatureTechniques: d.signatureTechniques.join(", "),
      verified: d.verified,
      exclusive: !!d.exclusive,
      offersBespoke: !!d.offersBespoke,
    });
    setShowAddDesignerModal(true);
  };

  const handleSaveDesigner = (e: React.FormEvent) => {
    e.preventDefault();
    const techniquesArray = designerForm.signatureTechniques
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const handleSlug =
      designerForm.handle.trim() ||
      designerForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingDesigner) {
      updateDesigner(editingDesigner.id, {
        name: designerForm.name,
        handle: handleSlug,
        location: designerForm.location,
        bio: designerForm.bio,
        foundingStory: designerForm.foundingStory,
        logo: designerForm.logo,
        banner: designerForm.banner,
        website: designerForm.website,
        signatureTechniques: techniquesArray,
        verified: designerForm.verified,
        exclusive: designerForm.exclusive,
        offersBespoke: designerForm.offersBespoke,
      });
    } else {
      addDesigner({
        name: designerForm.name,
        handle: handleSlug,
        location: designerForm.location,
        bio: designerForm.bio,
        foundingStory: designerForm.foundingStory,
        logo: designerForm.logo,
        banner: designerForm.banner,
        website: designerForm.website,
        signatureTechniques: techniquesArray,
        verified: designerForm.verified,
        exclusive: designerForm.exclusive,
        offersBespoke: designerForm.offersBespoke,
      });
    }
    setShowAddDesignerModal(false);
  };

  // Open Product Add/Edit
  const handleOpenAddProduct = (defaultDesignerId?: string) => {
    setEditingProduct(null);
    const targetDesigner = designers.find((d) => d.id === defaultDesignerId) || designers[0];
    setProductForm({
      name: "",
      designerId: targetDesigner ? targetDesigner.id : "",
      price: 85000,
      mrp: 98000,
      bestPrice: 79000,
      category: "lehengas",
      subcategory: "bridal",
      gender: "women",
      images: "https://images.unsplash.com/photo-1610117238813-27404126b014?w=800&q=80",
      sizes: "S, M, L, XL",
      description: "Exclusive hand-crafted couture piece created for grand occasions.",
      story: "Each panel is hand-embroidered by artisan weavers.",
      craftOrigin: targetDesigner ? targetDesigner.location : "India",
      material: "Pure Handloom Silk",
      technique: "Handwork & Zari",
      occasion: "Bridal",
      tags: "bridal, lehenga, couture",
      piecesRemaining: 5,
      limitedEdition: true,
      customizable: true,
      deliveryText: "Delivery within 48 hours",
    });
    setShowAddProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      designerId: p.designerId,
      price: p.price,
      mrp: p.mrp || p.price,
      bestPrice: p.bestPrice || p.price,
      category: p.category,
      subcategory: p.subcategory || "",
      gender: p.gender,
      images: p.images.join(", "),
      sizes: p.sizes.join(", "),
      description: p.description,
      story: p.story || "",
      craftOrigin: p.craftOrigin || "",
      material: p.material || "",
      technique: p.technique || "",
      occasion: p.occasion || "",
      tags: (p.tags || []).join(", "),
      piecesRemaining: p.piecesRemaining || 5,
      limitedEdition: !!p.limitedEdition,
      customizable: !!p.customizable,
      deliveryText: p.deliveryText || "Delivery within 48 hours",
    });
    setShowAddProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const currentDesigner = designers.find((d) => d.id === productForm.designerId) || designers[0];
    const imageList = productForm.images
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);
    const sizeList = productForm.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const tagList = productForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: productForm.name,
        designerName: currentDesigner.name,
        designerId: currentDesigner.id,
        price: Number(productForm.price),
        mrp: Number(productForm.mrp),
        bestPrice: Number(productForm.bestPrice),
        category: productForm.category,
        subcategory: productForm.subcategory,
        gender: productForm.gender,
        images: imageList.length > 0 ? imageList : ["https://images.unsplash.com/photo-1610117238813-27404126b014?w=800&q=80"],
        sizes: sizeList.length > 0 ? sizeList : ["Free Size"],
        description: productForm.description,
        story: productForm.story,
        craftOrigin: productForm.craftOrigin,
        material: productForm.material,
        technique: productForm.technique,
        occasion: productForm.occasion,
        tags: tagList,
        piecesRemaining: Number(productForm.piecesRemaining),
        limitedEdition: productForm.limitedEdition,
        customizable: productForm.customizable,
        deliveryText: productForm.deliveryText,
      });
    } else {
      addProduct({
        name: productForm.name,
        designerName: currentDesigner ? currentDesigner.name : "Exclusive Atelier",
        designerId: currentDesigner ? currentDesigner.id : "dh-1",
        price: Number(productForm.price),
        mrp: Number(productForm.mrp),
        bestPrice: Number(productForm.bestPrice),
        category: productForm.category,
        subcategory: productForm.subcategory,
        gender: productForm.gender,
        images: imageList.length > 0 ? imageList : ["https://images.unsplash.com/photo-1610117238813-27404126b014?w=800&q=80"],
        sizes: sizeList.length > 0 ? sizeList : ["Free Size"],
        description: productForm.description,
        story: productForm.story,
        craftOrigin: productForm.craftOrigin,
        material: productForm.material,
        technique: productForm.technique,
        occasion: productForm.occasion,
        tags: tagList,
        verified: true,
        piecesRemaining: Number(productForm.piecesRemaining),
        limitedEdition: productForm.limitedEdition,
        customizable: productForm.customizable,
        rating: 4.9,
        deliveryText: productForm.deliveryText,
      });
    }
    setShowAddProductModal(false);
  };

  // Filtered product list for table display
  const filteredProducts = products.filter((p) => {
    const matchesDesigner = selectedDesignerFilter === "all" || p.designerId === selectedDesignerFilter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDesigner && matchesSearch;
  });

  return (
    <div
      className="w-full min-h-screen bg-[#F7F5F0] text-[#101010] flex items-stretch"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Full Screen Edge-to-Edge Dashboard Container */}
      <div className="w-full min-h-screen bg-[#F7F5F0] flex">
        
        {/* ── LEFT DARK SIDEBAR ── */}
        <aside className="w-48 bg-[#161B22] text-[#8B949E] flex flex-col justify-between p-4 flex-shrink-0 border-r border-white/5">
          <div className="space-y-6">
            {/* Logo Brand */}
            <div className="flex items-center gap-2 px-1 pt-1">
              <div className="w-5 h-5 rounded bg-white text-black flex items-center justify-center font-black text-[9px]">
                DS
              </div>
              <span className="text-white text-[11px] font-bold tracking-tight">
                Designer&apos;s St
              </span>
            </div>

            {/* Sidebar Navigation Menu */}
            <nav className="space-y-1 text-[10px] font-semibold">
              {[
                { id: "overview", label: "Dashboard", icon: "📊" },
                { id: "designers", label: "Houses & Brands", icon: "✨" },
                { id: "products", label: "Products Catalog", icon: "👗" },
                { id: "curation", label: "Store Curation", icon: "⚙️" },
              ].map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      active
                        ? "bg-white text-[#11161D] font-extrabold shadow-sm"
                        : "hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-xs">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Link */}
          <div className="pt-4 border-t border-white/10 text-[9px] space-y-2">
            <Link
              href="/store"
              target="_blank"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
            >
              <span>🌐 View Storefront</span>
              <span className="text-[8px]">↗</span>
            </Link>
            <p className="text-[8px] text-gray-500 text-center">v2.4 SF Compact Admin</p>
          </div>
        </aside>

        {/* ── CENTER MAIN CONTENT AREA ── */}
        <main className="flex-1 p-5 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Top Bar Header Filter & Search */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8] mb-4 gap-3">
              <div>
                <h1 className="text-sm font-extrabold text-[#11161D] tracking-tight uppercase">
                  {activeTab === "overview" && "Dashboard Overview"}
                  {activeTab === "designers" && "Designer Houses Directory"}
                  {activeTab === "products" && "Product Catalog & Pricing"}
                  {activeTab === "curation" && "Store Curation & Promos"}
                </h1>
                <p className="text-[9px] font-medium text-[#787268]">
                  40% Reduced SF Pro High-Density Control Center
                </p>
              </div>

              {/* Top Search Input & Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter products or houses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 px-2.5 py-1 rounded-lg bg-white border border-[#E3DBCC] text-[9px] text-[#101010] outline-none placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddDesigner}
                  className="px-2.5 py-1 rounded-lg bg-[#11161D] text-white text-[9px] font-extrabold uppercase tracking-wider hover:opacity-90 cursor-pointer shadow-xs"
                >
                  + New House
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddProduct()}
                  className="px-2.5 py-1 rounded-lg bg-[#C5A059] text-black text-[9px] font-extrabold uppercase tracking-wider hover:opacity-90 cursor-pointer shadow-xs"
                >
                  + New Product
                </button>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* 4 Compact Metric Cards (40% smaller text scale) */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-[#E3DBCC] shadow-2xs">
                    <span className="text-[8px] font-extrabold text-[#787268] uppercase tracking-wider block">
                      Designer Houses
                    </span>
                    <span className="text-base font-extrabold text-[#11161D] mt-0.5 block">
                      {designers.length}
                    </span>
                    <span className="text-[8px] text-emerald-700 font-bold block mt-0.5">
                      ✓ Active Ateliers
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#E3DBCC] shadow-2xs">
                    <span className="text-[8px] font-extrabold text-[#787268] uppercase tracking-wider block">
                      Active Products
                    </span>
                    <span className="text-base font-extrabold text-[#11161D] mt-0.5 block">
                      {products.length}
                    </span>
                    <span className="text-[8px] text-amber-700 font-bold block mt-0.5">
                      👑 {products.filter((p) => p.limitedEdition).length} Limited
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#E3DBCC] shadow-2xs">
                    <span className="text-[8px] font-extrabold text-[#787268] uppercase tracking-wider block">
                      Average Price
                    </span>
                    <span className="text-base font-extrabold text-[#11161D] mt-0.5 block">
                      {formatPrice(
                        products.reduce((acc, p) => acc + p.price, 0) / (products.length || 1)
                      )}
                    </span>
                    <span className="text-[8px] text-[#787268] font-bold block mt-0.5">
                      Couture Line
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#E3DBCC] shadow-2xs">
                    <span className="text-[8px] font-extrabold text-[#787268] uppercase tracking-wider block">
                      Bespoke Atelier
                    </span>
                    <span className="text-base font-extrabold text-[#11161D] mt-0.5 block">
                      {designers.filter((d) => d.offersBespoke).length}
                    </span>
                    <span className="text-[8px] text-purple-700 font-bold block mt-0.5">
                      Made-to-Measure
                    </span>
                  </div>
                </div>

                {/* Main Compact Table View */}
                <div className="bg-white rounded-xl border border-[#E3DBCC] overflow-hidden shadow-2xs">
                  <div className="px-3 py-2 bg-[#F3F0E9] border-b border-[#E3DBCC] flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#11161D]">
                      Catalog Inventory Overview ({filteredProducts.length})
                    </span>
                    <span className="text-[8px] text-[#787268]">San Francisco Compact Table</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-[#E3DBCC] text-[8px] font-extrabold uppercase tracking-wider text-[#787268]">
                          <th className="py-2 px-3">Item Name</th>
                          <th className="py-2 px-3">House / Brand</th>
                          <th className="py-2 px-3">Selling Price</th>
                          <th className="py-2 px-3">MRP</th>
                          <th className="py-2 px-3">Category</th>
                          <th className="py-2 px-3">Stock</th>
                          <th className="py-2 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3DBCC] text-[9px] font-medium text-[#11161D]">
                        {filteredProducts.slice(0, 8).map((p) => (
                          <tr
                            key={p.id}
                            onClick={() => setSelectedProduct(p)}
                            className={`hover:bg-amber-50/50 transition-colors cursor-pointer ${
                              selectedProduct?.id === p.id ? "bg-amber-100/60" : ""
                            }`}
                          >
                            <td className="py-2 px-3 font-extrabold truncate max-w-[160px]">
                              {p.name}
                            </td>
                            <td className="py-2 px-3 text-gray-600">{p.designerName}</td>
                            <td className="py-2 px-3 font-bold text-emerald-800">
                              {formatPrice(p.price)}
                            </td>
                            <td className="py-2 px-3 text-gray-400 line-through">
                              {p.mrp ? formatPrice(p.mrp) : "-"}
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[8px] uppercase font-bold">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[8px] font-bold">
                                {p.piecesRemaining || 5} left
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditProduct(p);
                                }}
                                className="px-2 py-0.5 bg-[#11161D] text-white rounded text-[8px] font-bold uppercase hover:opacity-90"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DESIGNER HOUSES */}
            {activeTab === "designers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#11161D] uppercase">
                    All Designer Houses ({designers.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAddDesigner}
                    className="px-3 py-1 bg-[#11161D] text-white text-[9px] font-extrabold uppercase rounded-lg shadow-2xs"
                  >
                    + Add New House
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {designers.map((d) => {
                    const houseProductCount = products.filter((p) => p.designerId === d.id).length;
                    return (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl bg-white border border-[#E3DBCC] flex flex-col justify-between space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden relative bg-black flex-shrink-0 border border-gray-200">
                            <Image src={d.logo} alt={d.name} fill className="object-cover" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-extrabold text-[#11161D] uppercase leading-tight">
                              {d.name}
                            </h4>
                            <span className="text-[8px] text-[#787268] block">
                              {d.location} • {houseProductCount} Products
                            </span>
                          </div>
                        </div>

                        <p className="text-[9px] text-gray-600 line-clamp-2 leading-relaxed">
                          {d.bio}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#E3DBCC]">
                          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {d.offersBespoke ? "Bespoke Active" : "Standard Collection"}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenAddProduct(d.id)}
                              className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[8px] font-bold"
                            >
                              + Item
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditDesigner(d)}
                              className="px-2 py-0.5 bg-[#11161D] text-white rounded text-[8px] font-bold"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCTS CATALOG */}
            {activeTab === "products" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-[#787268]">Filter House:</span>
                    <select
                      value={selectedDesignerFilter}
                      onChange={(e) => setSelectedDesignerFilter(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-[#E3DBCC] rounded-lg text-[9px] font-bold text-[#11161D] outline-none"
                    >
                      <option value="all">✨ All Houses ({products.length})</option>
                      {designers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({products.filter((p) => p.designerId === d.id).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddProduct()}
                    className="px-3 py-1 bg-[#11161D] text-white text-[9px] font-extrabold uppercase rounded-lg shadow-2xs"
                  >
                    + Add New Product
                  </button>
                </div>

                {/* Compact Products Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`p-3 rounded-xl bg-white border border-[#E3DBCC] shadow-2xs flex flex-col justify-between cursor-pointer hover:border-[#11161D] transition-all ${
                        selectedProduct?.id === p.id ? "ring-2 ring-[#11161D]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-14 h-16 rounded-md overflow-hidden bg-gray-100 relative flex-shrink-0 border border-gray-200">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block truncate">
                            {p.designerName}
                          </span>
                          <h4 className="text-[10px] font-extrabold text-[#11161D] line-clamp-2 leading-tight">
                            {p.name}
                          </h4>
                          <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-xs font-extrabold text-[#11161D]">
                              {formatPrice(p.price)}
                            </span>
                            {p.mrp && (
                              <span className="text-[8px] text-gray-400 line-through">
                                {formatPrice(p.mrp)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E3DBCC] mt-2 text-[8px]">
                        <span className="px-1.5 py-0.5 bg-[#F3F0E9] font-bold text-gray-700 rounded uppercase">
                          {p.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditProduct(p);
                            }}
                            className="px-2 py-0.5 bg-[#11161D] text-white rounded font-bold uppercase"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CURATION & PROMOS */}
            {activeTab === "curation" && (
              <div className="space-y-4 max-w-xl">
                <div className="p-4 rounded-xl bg-white border border-[#E3DBCC] space-y-3 shadow-2xs">
                  <h3 className="text-xs font-bold text-[#11161D] uppercase">
                    Homepage Announcement Bar
                  </h3>
                  <textarea
                    rows={3}
                    value={bannerInput}
                    onChange={(e) => setBannerInput(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] text-[#11161D] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      updatePromoBanner(bannerInput);
                      alert("Promo announcement updated!");
                    }}
                    className="px-3 py-1 bg-[#11161D] text-white rounded-lg text-[9px] font-bold uppercase"
                  >
                    Save Banner Text
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                  <h3 className="text-xs font-bold text-red-900 uppercase">
                    Reset Demo Store Data
                  </h3>
                  <p className="text-[9px] text-red-700">
                    Restores original mock data products, prices, and designer houses.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Reset all store data to defaults?")) {
                        resetToDefaults();
                        alert("Reset complete!");
                      }
                    }}
                    className="px-3 py-1 bg-red-700 text-white rounded-lg text-[9px] font-bold uppercase"
                  >
                    Reset All Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT INSPECTOR / QUICK DETAIL PANEL (Mirroring ProfitPulse item panel) ── */}
        <aside className="w-64 bg-white border-l border-[#E5E0D8] p-4 flex-shrink-0 flex flex-col justify-between">
          {selectedProduct ? (
            <div className="space-y-4 text-[9px]">
              <div className="flex items-center justify-between border-b border-[#E3DBCC] pb-2">
                <span className="font-extrabold uppercase tracking-wider text-[#11161D]">
                  Product Preview
                </span>
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[8px]">
                  ID #{selectedProduct.id.slice(-6)}
                </span>
              </div>

              {/* Large Image Preview */}
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 border border-[#E3DBCC]">
                <Image
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Title & Brand */}
              <div>
                <span className="font-bold text-gray-500 uppercase tracking-widest block text-[8px]">
                  {selectedProduct.designerName}
                </span>
                <h3 className="text-[11px] font-extrabold text-[#11161D] mt-0.5 leading-snug">
                  {selectedProduct.name}
                </h3>
              </div>

              {/* Price Details Breakdown */}
              <div className="p-2.5 rounded-lg bg-[#F7F5F0] border border-[#E3DBCC] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Selling Price:</span>
                  <span className="font-extrabold text-emerald-800 text-[10px]">
                    {formatPrice(selectedProduct.price)}
                  </span>
                </div>
                {selectedProduct.mrp && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Original MRP:</span>
                    <span className="line-through text-gray-400">
                      {formatPrice(selectedProduct.mrp)}
                    </span>
                  </div>
                )}
                {selectedProduct.bestPrice && (
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="text-gray-600 font-bold">Best Offer:</span>
                    <span className="font-extrabold text-amber-800">
                      {formatPrice(selectedProduct.bestPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Spec list */}
              <div className="space-y-1 text-gray-600 text-[9px]">
                <p>Category: <strong className="text-[#11161D]">{selectedProduct.category}</strong></p>
                <p>Gender: <strong className="text-[#11161D]">{selectedProduct.gender}</strong></p>
                <p>Stock Remaining: <strong className="text-[#11161D]">{selectedProduct.piecesRemaining || 5} pieces</strong></p>
                <p>Limited Edition: <strong className="text-[#11161D]">{selectedProduct.limitedEdition ? "Yes" : "No"}</strong></p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E3DBCC] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditProduct(selectedProduct)}
                  className="flex-1 py-1.5 bg-[#11161D] text-white rounded-lg font-bold text-[9px] uppercase hover:opacity-90"
                >
                  Edit Product
                </button>
                <Link
                  href={`/product/${selectedProduct.id}`}
                  target="_blank"
                  className="px-2.5 py-1.5 bg-gray-100 text-[#11161D] rounded-lg font-bold text-[9px] uppercase hover:bg-gray-200 text-center"
                >
                  View PDP
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 text-[9px] py-12">
              Select a product from the table to preview details
            </div>
          )}

          {/* Quick Footer Action */}
          <div className="pt-4 border-t border-[#E3DBCC] text-center">
            <button
              type="button"
              onClick={() => handleOpenAddProduct()}
              className="w-full py-1.5 bg-[#C5A059] text-black font-extrabold text-[9px] uppercase rounded-lg shadow-xs cursor-pointer"
            >
              + Create New Product
            </button>
          </div>
        </aside>
      </div>

      {/* ──────── MODAL: ADD / EDIT DESIGNER HOUSE ──────── */}
      {showAddDesignerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 border border-[#E3DBCC] shadow-2xl text-[9px]">
            <div className="flex items-center justify-between mb-3 border-b border-[#E3DBCC] pb-2">
              <h3 className="font-extrabold text-[11px] text-[#11161D] uppercase">
                {editingDesigner ? "Edit Designer House" : "Add New Designer House"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDesignerModal(false)}
                className="text-gray-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDesigner} className="space-y-3">
              <div>
                <label className="font-bold text-[#11161D] block mb-1">Designer House Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAISON RIVIÈRE"
                  value={designerForm.name}
                  onChange={(e) => setDesignerForm({ ...designerForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. maison-riviere"
                    value={designerForm.handle}
                    onChange={(e) => setDesignerForm({ ...designerForm, handle: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, India"
                    value={designerForm.location}
                    onChange={(e) => setDesignerForm({ ...designerForm, location: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#11161D] block mb-1">One-Line Tagline / Bio</label>
                <input
                  type="text"
                  placeholder="e.g. High-end couture & occasion wear."
                  value={designerForm.bio}
                  onChange={(e) => setDesignerForm({ ...designerForm, bio: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#11161D] block mb-1">Founding Story / Narrative</label>
                <textarea
                  rows={2}
                  placeholder="Describe craft origin and design philosophy..."
                  value={designerForm.foundingStory}
                  onChange={(e) => setDesignerForm({ ...designerForm, foundingStory: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Logo Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={designerForm.logo}
                    onChange={(e) => setDesignerForm({ ...designerForm, logo: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Banner Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={designerForm.banner}
                    onChange={(e) => setDesignerForm({ ...designerForm, banner: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#11161D] block mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="www.antigravity.design"
                  value={designerForm.website}
                  onChange={(e) => setDesignerForm({ ...designerForm, website: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#11161D] block mb-1">Signature Techniques (comma separated)</label>
                <input
                  type="text"
                  placeholder="Zardozi Embroidery, Handloom Weaving"
                  value={designerForm.signatureTechniques}
                  onChange={(e) =>
                    setDesignerForm({ ...designerForm, signatureTechniques: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[#11161D]">
                  <input
                    type="checkbox"
                    checked={designerForm.verified}
                    onChange={(e) => setDesignerForm({ ...designerForm, verified: e.target.checked })}
                  />
                  <span>Verified House Badge</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[#11161D]">
                  <input
                    type="checkbox"
                    checked={designerForm.offersBespoke}
                    onChange={(e) => setDesignerForm({ ...designerForm, offersBespoke: e.target.checked })}
                  />
                  <span>Offers Bespoke Service</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3DBCC]">
                <button
                  type="button"
                  onClick={() => setShowAddDesignerModal(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#11161D] text-white rounded-lg font-bold uppercase"
                >
                  Save Designer House
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────── MODAL: ADD / EDIT PRODUCT ──────── */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 border border-[#E3DBCC] shadow-2xl text-[9px]">
            <div className="flex items-center justify-between mb-3 border-b border-[#E3DBCC] pb-2">
              <h3 className="font-extrabold text-[11px] text-[#11161D] uppercase">
                {editingProduct ? "Edit Product Details" : "Add Product Under Designer"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="font-bold text-[#11161D] block mb-1">Belongs to Designer House *</label>
                <select
                  required
                  value={productForm.designerId}
                  onChange={(e) => setProductForm({ ...productForm, designerId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none bg-white font-bold"
                >
                  {designers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#11161D] block mb-1">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Lehenga — Midnight Garden"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#F7F5F0] p-2.5 rounded-lg border border-[#E3DBCC]">
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-1.5 rounded-md border border-[#E3DBCC] text-[9px] outline-none bg-white font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="w-full p-1.5 rounded-md border border-[#E3DBCC] text-[9px] outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Best Offer Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.bestPrice}
                    onChange={(e) => setProductForm({ ...productForm, bestPrice: Number(e.target.value) })}
                    className="w-full p-1.5 rounded-md border border-[#E3DBCC] text-[9px] outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none bg-white"
                  >
                    <option value="lehengas">Lehengas</option>
                    <option value="sarees">Sarees</option>
                    <option value="sherwanis">Sherwanis</option>
                    <option value="kurtas">Kurtas</option>
                    <option value="coats">Coats &amp; Outerwear</option>
                    <option value="gowns">Gowns &amp; Cocktail</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. bridal, cocktail"
                    value={productForm.subcategory}
                    onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#11161D] block mb-1">Gender *</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none bg-white"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#11161D] block mb-1">Product Image URLs (Comma separated) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#11161D] block mb-1">Available Sizes (Comma separated)</label>
                <input
                  type="text"
                  placeholder="XS, S, M, L, XL"
                  value={productForm.sizes}
                  onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#11161D] block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe material, embroidery..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-[#E3DBCC] text-[9px] outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[#11161D]">
                  <input
                    type="checkbox"
                    checked={productForm.limitedEdition}
                    onChange={(e) => setProductForm({ ...productForm, limitedEdition: e.target.checked })}
                  />
                  <span>👑 Limited Edition Tag</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[#11161D]">
                  <input
                    type="checkbox"
                    checked={productForm.customizable}
                    onChange={(e) => setProductForm({ ...productForm, customizable: e.target.checked })}
                  />
                  <span>Bespoke Customizable</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3DBCC]">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#11161D] text-white rounded-lg font-bold uppercase"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
