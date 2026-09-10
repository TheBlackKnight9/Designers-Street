"use client";

import { useState } from "react";
import { X, Ruler, Check, Info } from "lucide-react";

export type WearCategory = "TOP" | "BOTTOM" | "ENSEMBLE" | "ACCESSORY";

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  wearCategory: WearCategory;
  gender: "men" | "women" | "unisex";
  onApplySizes?: (sizes: string[]) => void;
}

export function SizeChartModal({
  isOpen,
  onClose,
  wearCategory,
  gender,
  onApplySizes,
}: SizeChartModalProps) {
  const [activeTab, setActiveTab] = useState<"TOP" | "BOTTOM">(
    wearCategory === "BOTTOM" ? "BOTTOM" : "TOP"
  );
  const [unit, setUnit] = useState<"in" | "cm">("in");

  if (!isOpen) return null;

  const isMen = gender === "men";
  const convert = (valInInches: number) => {
    if (unit === "in") return `${valInInches}"`;
    return `${(valInInches * 2.54).toFixed(1)} cm`;
  };

  // Top wear data
  const menTopData = [
    { size: "XS", num: "36", chest: 36, shoulder: 16.5, length: 28, sleeve: 24.5, collar: 14.5 },
    { size: "S", num: "38", chest: 38, shoulder: 17.25, length: 28.5, sleeve: 25, collar: 15 },
    { size: "M", num: "40", chest: 40, shoulder: 18, length: 29.5, sleeve: 25.5, collar: 15.5 },
    { size: "L", num: "42", chest: 42, shoulder: 18.75, length: 30, sleeve: 26, collar: 16 },
    { size: "XL", num: "44", chest: 44, shoulder: 19.5, length: 31, sleeve: 26.5, collar: 16.5 },
    { size: "2XL", num: "46", chest: 46, shoulder: 20.25, length: 31.5, sleeve: 27, collar: 17 },
    { size: "3XL", num: "48", chest: 48, shoulder: 21, length: 32, sleeve: 27.5, collar: 17.5 },
  ];

  const womenTopData = [
    { size: "XS", num: "32 (UK 6)", chest: 32, shoulder: 14, length: 25, sleeve: 22, collar: 13.5 },
    { size: "S", num: "34 (UK 8)", chest: 34, shoulder: 14.5, length: 25.5, sleeve: 22.5, collar: 14 },
    { size: "M", num: "36 (UK 10)", chest: 36, shoulder: 15, length: 26, sleeve: 23, collar: 14.5 },
    { size: "L", num: "38 (UK 12)", chest: 38, shoulder: 15.5, length: 26.5, sleeve: 23.5, collar: 15 },
    { size: "XL", num: "40 (UK 14)", chest: 40, shoulder: 16, length: 27, sleeve: 24, collar: 15.5 },
    { size: "2XL", num: "42 (UK 16)", chest: 42, shoulder: 16.5, length: 27.5, sleeve: 24.5, collar: 16 },
  ];

  // Bottom wear data
  const menBottomData = [
    { size: '28"', alpha: "XS", waist: 28, hip: 36, thigh: 22, inseam: 30, length: 39 },
    { size: '30"', alpha: "S", waist: 30, hip: 38, thigh: 23, inseam: 31, length: 40 },
    { size: '32"', alpha: "M", waist: 32, hip: 40, thigh: 24, inseam: 32, length: 41 },
    { size: '34"', alpha: "L", waist: 34, hip: 42, thigh: 25, inseam: 32, length: 41.5 },
    { size: '36"', alpha: "XL", waist: 36, hip: 44, thigh: 26, inseam: 33, length: 42 },
    { size: '38"', alpha: "2XL", waist: 38, hip: 46, thigh: 27, inseam: 33, length: 42.5 },
    { size: '40"', alpha: "3XL", waist: 40, hip: 48, thigh: 28, inseam: 33, length: 43 },
  ];

  const womenBottomData = [
    { size: '26"', alpha: "XS", waist: 26, hip: 36, thigh: 21, inseam: 29, length: 38 },
    { size: '28"', alpha: "S", waist: 28, hip: 38, thigh: 22, inseam: 30, length: 39 },
    { size: '30"', alpha: "M", waist: 30, hip: 40, thigh: 23, inseam: 30, length: 40 },
    { size: '32"', alpha: "L", waist: 32, hip: 42, thigh: 24, inseam: 31, length: 40.5 },
    { size: '34"', alpha: "XL", waist: 34, hip: 44, thigh: 25, inseam: 31, length: 41 },
    { size: '36"', alpha: "2XL", waist: 36, hip: 46, thigh: 26, inseam: 31, length: 41.5 },
  ];

  const currentTopData = isMen ? menTopData : womenTopData;
  const currentBottomData = isMen ? menBottomData : womenBottomData;

  const handleApplySizesFromCurrent = () => {
    if (!onApplySizes) return;
    if (activeTab === "TOP") {
      const alphaList = currentTopData.map((d) => d.size);
      const numList = currentTopData.map((d) => d.num.split(" ")[0]);
      onApplySizes(Array.from(new Set([...alphaList, ...numList])));
    } else {
      const waistList = currentBottomData.map((d) => d.size);
      onApplySizes(waistList);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950">
                Luxury Silhouette & Garment Size Chart
              </h3>
              <p className="text-xs text-zinc-500">
                Standard dimension guidelines for {gender.toUpperCase()} tailoring & ready-to-wear
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Unit Toggle */}
            <div className="flex bg-zinc-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUnit("in")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  unit === "in" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit("cm")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  unit === "cm" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Centimeters (cm)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-zinc-100 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("TOP")}
              className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "TOP"
                  ? "bg-zinc-950 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Top Wear (Shirts, Kurtas, Jackets, Blazers)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("BOTTOM")}
              className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "BOTTOM"
                  ? "bg-zinc-950 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Bottom Wear (Trousers, Pants, Dhotis, Skirts)
            </button>
          </div>

          <span className="text-[11px] font-mono text-zinc-400">
            Target: {gender === "women" ? "Women's Fit" : "Men's Fit"}
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {activeTab === "TOP" ? (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Alpha Size</th>
                    <th className="py-2.5 px-3.5">Numeric ({isMen ? "Collar/Chest" : "Bust"})</th>
                    <th className="py-2.5 px-3.5 text-right">{isMen ? "Chest" : "Bust"}</th>
                    <th className="py-2.5 px-3.5 text-right">Shoulder</th>
                    <th className="py-2.5 px-3.5 text-right">Length</th>
                    <th className="py-2.5 px-3.5 text-right">Sleeve</th>
                    <th className="py-2.5 px-3.5 text-right">Collar / Neck</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono">
                  {currentTopData.map((row) => (
                    <tr key={row.size} className="hover:bg-zinc-50/70">
                      <td className="py-2.5 px-3.5 font-bold font-sans text-zinc-950">
                        {row.size}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-zinc-700">
                        {row.num}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-900 font-medium">
                        {convert(row.chest)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-900 font-medium">
                        {convert(row.shoulder)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-900 font-medium">
                        {convert(row.length)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-900 font-medium">
                        {convert(row.sleeve)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-600">
                        {convert(row.collar)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Waist Size</th>
                    <th className="py-2.5 px-3.5">Equivalent Alpha</th>
                    <th className="py-2.5 px-3.5 text-right">Waist Circumference</th>
                    <th className="py-2.5 px-3.5 text-right">Hip</th>
                    <th className="py-2.5 px-3.5 text-right">Thigh</th>
                    <th className="py-2.5 px-3.5 text-right">Inseam</th>
                    <th className="py-2.5 px-3.5 text-right">Total Outseam Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono">
                  {currentBottomData.map((row) => (
                    <tr key={row.size} className="hover:bg-zinc-50/70">
                      <td className="py-2.5 px-3.5 font-bold font-sans text-zinc-950">
                        {row.size}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-zinc-700">
                        {row.alpha}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-900 font-medium">
                        {convert(row.waist)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-900 font-medium">
                        {convert(row.hip)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-900 font-medium">
                        {convert(row.thigh)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-900 font-medium">
                        {convert(row.inseam)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-zinc-600">
                        {convert(row.length)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Measuring Guide Notes */}
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 text-xs text-zinc-600 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
              <Info className="w-3.5 h-3.5 text-zinc-700" />
              <span>Tailoring & Measurement Instructions</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div>
                <strong className="text-zinc-800">Shoulder Width:</strong> Measure straight from the outer tip of one shoulder bone across the natural back curve to the other.
              </div>
              <div>
                <strong className="text-zinc-800">Chest / Bust:</strong> Pass tape measure under armpits around the fullest contour of chest/bust, keeping tape parallel to the floor.
              </div>
              <div>
                <strong className="text-zinc-800">Garment Length:</strong> Measure from the highest point of the shoulder seam straight down to the designated bottom hem.
              </div>
              <div>
                <strong className="text-zinc-800">Waist & Inseam:</strong> Measure natural waistline where trouser sits. Inseam is from crotch seam down along the inner leg to ankle.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-200 bg-zinc-50/80">
          <p className="text-[11px] text-zinc-500">
            Clicking &quot;Apply Sizes&quot; will select these standard sizes for your product.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200/70 rounded-lg transition-colors"
            >
              Close
            </button>
            {onApplySizes && (
              <button
                type="button"
                onClick={handleApplySizesFromCurrent}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-950 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply All Standard Sizes</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
