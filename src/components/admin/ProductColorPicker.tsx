"use client";

import { useState } from "react";
import { Check, Plus, X, Palette, Sparkles } from "lucide-react";

export interface ColorItem {
  name: string;
  hex: string;
  isLight?: boolean;
}

export const BASIC_12_COLORS: ColorItem[] = [
  { name: "Jet Black", hex: "#101010", isLight: false },
  { name: "Pure White", hex: "#FFFFFF", isLight: true },
  { name: "Ivory / Cream", hex: "#F7F4ED", isLight: true },
  { name: "Slate Grey", hex: "#4B5563", isLight: false },
  { name: "Midnight Navy", hex: "#0F172A", isLight: false },
  { name: "Royal Blue", hex: "#2563EB", isLight: false },
  { name: "Emerald Green", hex: "#047857", isLight: false },
  { name: "Forest Olive", hex: "#3F6212", isLight: false },
  { name: "Ruby Crimson", hex: "#DC2626", isLight: false },
  { name: "Wine / Burgundy", hex: "#831843", isLight: false },
  { name: "Blush Pink", hex: "#F472B6", isLight: false },
  { name: "Champagne Gold", hex: "#D4AF37", isLight: false },
];

interface ProductColorPickerProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

export function ProductColorPicker({
  selectedColors,
  onChange,
}: ProductColorPickerProps) {
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#A38F7A");

  const toggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      onChange(selectedColors.filter((c) => c !== colorName));
    } else {
      onChange([...selectedColors, colorName]);
    }
  };

  const handleAddCustomColor = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    if (!selectedColors.includes(trimmed)) {
      onChange([...selectedColors, trimmed]);
    }
    setCustomName("");
  };

  const handleRemoveColor = (colorName: string) => {
    onChange(selectedColors.filter((c) => c !== colorName));
  };

  // Helper to find hex if standard color
  const getHexForName = (name: string): string | null => {
    const found = BASIC_12_COLORS.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    return found ? found.hex : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-zinc-600" />
          <label className="text-xs font-semibold text-zinc-900">
            Product Colorways & Palette
          </label>
        </div>
        <span className="text-[11px] text-zinc-500 font-medium">
          {selectedColors.length} selected
        </span>
      </div>

      {/* 12 Basic Curated Color Swatches Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-medium text-zinc-500">
            Standard Palette (Click to select 12 basic luxury shades):
          </p>
          {selectedColors.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-zinc-400 hover:text-rose-600 transition-colors"
            >
              Reset colors
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-3 rounded-xl bg-zinc-50/80 border border-zinc-200">
          {BASIC_12_COLORS.map((color) => {
            const isSelected = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleColor(color.name)}
                title={`${color.name} (${color.hex})`}
                className={`group relative flex flex-col items-center gap-1.5 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white border-zinc-950 shadow-xs ring-1 ring-zinc-950"
                    : "border-transparent hover:bg-white/70 hover:border-zinc-300"
                }`}
              >
                {/* Circular Swatch */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${
                    color.isLight ? "border border-zinc-300" : ""
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        color.isLight ? "text-zinc-950" : "text-white"
                      }`}
                    />
                  )}
                </div>

                {/* Swatch Label */}
                <span className="text-[10px] font-medium text-zinc-700 text-center leading-tight truncate w-full">
                  {color.name.split("/")[0].trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Name & Picker */}
      <div className="p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
          <span className="text-xs font-semibold text-zinc-900">
            Add Custom Couture Color Name
          </span>
        </div>
        <p className="text-[11px] text-zinc-500">
          Have a unique runway shade? Type names like &quot;Pearl White&quot;, &quot;Obsidian Black&quot;, &quot;Rose Quartz&quot;, or &quot;Smoky Topaz&quot;.
        </p>

        <div className="flex items-center gap-2 pt-1">
          {/* Color Dropper Button / Swatch */}
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 shadow-2xs shrink-0 cursor-pointer group">
            <input
              type="color"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
              title="Pick exact custom shade"
            />
            <div
              className="w-full h-full rounded-lg"
              style={{ backgroundColor: customHex }}
            />
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomColor();
              }
            }}
            placeholder="Type color name (e.g. Pearl White, Sage Mist)..."
            className="flex-1 bg-zinc-50/70 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-colors"
          />

          <button
            type="button"
            onClick={handleAddCustomColor}
            disabled={!customName.trim()}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Selected Color Badges */}
      {selectedColors.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-zinc-500">
            Selected Colorways on this listing:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedColors.map((colorName) => {
              const hex = getHexForName(colorName);
              return (
                <span
                  key={colorName}
                  className="inline-flex items-center gap-1.5 bg-white border border-zinc-200/90 text-zinc-900 text-xs font-medium pl-2 pr-1.5 py-1 rounded-lg shadow-2xs group"
                >
                  {hex ? (
                    <span
                      className="w-3 h-3 rounded-full border border-zinc-200 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                  ) : (
                    <span
                      className="w-3 h-3 rounded-full border border-zinc-200 shrink-0"
                      style={{ backgroundColor: customHex }}
                    />
                  )}
                  <span>{colorName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(colorName)}
                    className="p-0.5 text-zinc-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title={`Remove ${colorName}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
