"use client";

import { useState, useMemo } from "react";
import { Ruler, Plus, X, Check, Scissors, Sparkles, Layers } from "lucide-react";
import { SizeChartModal, WearCategory } from "./SizeChartModal";

interface ProductSizeSelectorProps {
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
  gender: "men" | "women" | "unisex";
  wearType?: WearCategory;
  onWearTypeChange?: (wearType: WearCategory) => void;
}

export function ProductSizeSelector({
  selectedSizes,
  onChange,
  gender,
  wearType: controlledWearType,
  onWearTypeChange,
}: ProductSizeSelectorProps) {
  const [internalWearType, setInternalWearType] = useState<WearCategory>("TOP");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState("");

  const activeWearType = controlledWearType ?? internalWearType;
  const setWearType = (val: WearCategory) => {
    if (onWearTypeChange) onWearTypeChange(val);
    else setInternalWearType(val);
  };

  const isMen = gender === "men";
  const isWomen = gender === "women";

  // Sizing definitions
  const topAlphaSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "Custom Bespoke"];
  const menTopNumeric = ["36 (XS)", "38 (S)", "40 (M)", "42 (L)", "44 (XL)", "46 (2XL)", "48 (3XL)"];
  const womenTopNumeric = ["32 (XS)", "34 (S)", "36 (M)", "38 (L)", "40 (XL)", "42 (2XL)"];
  const womenUkNumeric = ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16"];

  const menBottomWaist = ['28"', '30"', '32"', '34"', '36"', '38"', '40"', '42"', '44"'];
  const womenBottomWaist = ['24"', '26"', '28"', '30"', '32"', '34"', '36"', '38"'];
  const bottomAlpha = ["XS", "S", "M", "L", "XL", "2XL", "Custom Bespoke"];

  const ensembleSizes = ["Free Size", "One Size", "Unstitched Fabric", "XS", "S", "M", "L", "XL", "Custom Bespoke"];
  const accessorySizes = ["One Size", "Free Size", "Standard Fit", "Custom Bespoke"];

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onChange(selectedSizes.filter((s) => s !== size));
    } else {
      onChange([...selectedSizes, size]);
    }
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!selectedSizes.includes(trimmed)) {
      onChange([...selectedSizes, trimmed]);
    }
    setCustomSizeInput("");
  };

  const handleSelectGroup = (group: string[]) => {
    const merged = Array.from(new Set([...selectedSizes, ...group]));
    onChange(merged);
  };

  const handleApplyFromSizeChart = (chartSizes: string[]) => {
    onChange(chartSizes);
  };

  return (
    <div className="space-y-4">
      {/* Header with Title & Size Chart Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-zinc-700" />
            <label className="text-xs font-semibold text-zinc-900">
              Garment Classification & Available Sizing
            </label>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Select wear type to dynamically populate alpha, chest, collar, or waist dimensions
          </p>
        </div>

        {/* Size Chart Modal Trigger Button */}
        <button
          type="button"
          onClick={() => setIsSizeChartOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-medium border border-zinc-200 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Ruler className="w-3.5 h-3.5 text-zinc-700" />
          <span>View Size Chart & Dimensions</span>
        </button>
      </div>

      {/* Wear Type Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
          Garment Silhouette / Wear Type:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              id: "TOP" as const,
              label: "Top Wear",
              sub: "Shirts, Kurtas, Blazers, Tops",
              icon: "🧥",
            },
            {
              id: "BOTTOM" as const,
              label: "Bottom Wear",
              sub: "Trousers, Pants, Dhotis, Skirts",
              icon: "👖",
            },
            {
              id: "ENSEMBLE" as const,
              label: "Full Ensemble",
              sub: "Sarees, Lehengas, Gowns, Sets",
              icon: "👗",
            },
            {
              id: "ACCESSORY" as const,
              label: "Free Size / Bags",
              sub: "Shawls, Stoles, Clutches, Belts",
              icon: "👝",
            },
          ].map((item) => {
            const isSelected = activeWearType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setWearType(item.id)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                    : "bg-zinc-50/70 text-zinc-800 border-zinc-200 hover:bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-base">{item.icon}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-xs font-bold leading-tight">{item.label}</span>
                <span
                  className={`text-[10px] mt-0.5 leading-tight ${
                    isSelected ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {item.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Size Chips */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs space-y-4">
        {/* Quick Multi-Select Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
          <span className="text-xs font-semibold text-zinc-900">
            Select sizes for {gender.toUpperCase()} ({selectedSizes.length} active)
          </span>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                if (activeWearType === "TOP") {
                  handleSelectGroup(["S", "M", "L", "XL"]);
                } else if (activeWearType === "BOTTOM") {
                  handleSelectGroup(isMen ? ['30"', '32"', '34"', '36"'] : ['28"', '30"', '32"', '34"']);
                } else {
                  handleSelectGroup(["Free Size", "One Size"]);
                }
              }}
              className="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium transition-colors"
            >
              + Standard 4
            </button>
            {selectedSizes.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="px-2 py-0.5 rounded text-zinc-400 hover:text-rose-600 text-[11px] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* TOP WEAR SIZES */}
        {activeWearType === "TOP" && (
          <div className="space-y-3">
            {/* Standard Alpha Chips */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Alphabetical Standard Sizing:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topAlphaSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs font-semibold"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numeric Chest / Collar Sizes */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                {isMen ? "Men's Chest / Shirt Collar Numbers (inches):" : "Women's Bust Sizing (inches):"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(isMen ? menTopNumeric : womenTopNumeric).map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs font-semibold"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Women's UK / International Sizes */}
            {isWomen && (
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                  UK / International Ready-to-Wear:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {womenUkNumeric.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs font-semibold"
                            : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM WEAR SIZES */}
        {activeWearType === "BOTTOM" && (
          <div className="space-y-3">
            {/* Waist Size Numbers */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Waist Size Numbers in Inches (e.g. 30, 32, 34...):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(isMen ? menBottomWaist : womenBottomWaist).map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs"
                          : "bg-zinc-50 text-zinc-800 border-zinc-200 hover:bg-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equivalent Alpha Sizes */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Alphabetical Standard:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bottomAlpha.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ENSEMBLE SIZES */}
        {activeWearType === "ENSEMBLE" && (
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
              Ensemble, Gown & Couture Sizing:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ensembleSizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs font-semibold"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ACCESSORY SIZES */}
        {activeWearType === "ACCESSORY" && (
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
              Accessory & Free Size Options:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {accessorySizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs font-semibold"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Bespoke Size Input */}
        <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
          <input
            type="text"
            value={customSizeInput}
            onChange={(e) => setCustomSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomSize();
              }
            }}
            placeholder="Add custom size (e.g. 40 Regular, 5.5m Saree, Bespoke 42)..."
            className="flex-1 bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
          />
          <button
            type="button"
            onClick={handleAddCustomSize}
            disabled={!customSizeInput.trim()}
            className="px-3.5 py-1.5 bg-zinc-950 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer shadow-2xs"
          >
            + Add Size
          </button>
        </div>

        {/* Selected Sizes Chips Bar */}
        {selectedSizes.length > 0 && (
          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-zinc-500">Active sizes:</span>
            {selectedSizes.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 bg-zinc-950 text-white text-xs font-medium px-2.5 py-0.5 rounded-md shadow-2xs"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => toggleSize(s)}
                  className="hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modal Popup */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        wearCategory={activeWearType}
        gender={gender}
        onApplySizes={handleApplyFromSizeChart}
      />
    </div>
  );
}
