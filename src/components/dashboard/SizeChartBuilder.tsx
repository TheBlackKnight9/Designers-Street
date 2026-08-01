"use client";

import { useState } from "react";

export type SizeChartRow = {
  size: string;
  chest?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;
  length?: string;
};

export type SizeChartData = {
  unit: "inches" | "cm";
  rows: SizeChartRow[];
};

type Props = {
  value: SizeChartData | null;
  onChange: (val: SizeChartData) => void;
};

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "Free Size"];

export function SizeChartBuilder({ value, onChange }: Props) {
  const [unit, setUnit] = useState<"inches" | "cm">(value?.unit || "inches");
  const [rows, setRows] = useState<SizeChartRow[]>(
    value?.rows && value.rows.length > 0
      ? value.rows
      : DEFAULT_SIZES.map((size) => ({ size, chest: "", waist: "", hip: "", shoulder: "", length: "" }))
  );

  function updateRow(index: number, field: keyof SizeChartRow, val: string) {
    const updated = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r));
    setRows(updated);
    onChange({ unit, rows: updated });
  }

  function handleUnitChange(newUnit: "inches" | "cm") {
    setUnit(newUnit);
    onChange({ unit: newUnit, rows });
  }

  return (
    <div className="space-y-3 bg-mist/30 p-4 rounded-2xl border border-cloud">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone">
            Per-Product Size Guide Table
          </span>
          <p className="text-[10px] text-stone">Specify garment dimensions for customer PDP modal guide</p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-cloud">
          <button
            type="button"
            onClick={() => handleUnitChange("inches")}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors ${
              unit === "inches" ? "bg-charcoal text-paper" : "text-stone"
            }`}
          >
            Inches (&quot;)
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange("cm")}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors ${
              unit === "cm" ? "bg-charcoal text-paper" : "text-stone"
            }`}
          >
            CM
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-cloud text-[10px] font-bold uppercase text-stone">
              <th className="py-2 px-2">Size</th>
              <th className="py-2 px-2">Chest</th>
              <th className="py-2 px-2">Waist</th>
              <th className="py-2 px-2">Hip</th>
              <th className="py-2 px-2">Shoulder</th>
              <th className="py-2 px-2">Garment Length</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.size} className="border-b border-cloud/40">
                <td className="py-2 px-2 font-bold text-charcoal">{row.size}</td>
                <td className="py-1 px-1">
                  <input
                    value={row.chest || ""}
                    onChange={(e) => updateRow(idx, "chest", e.target.value)}
                    placeholder='e.g. 34"'
                    className="w-full bg-white border border-cloud rounded-lg px-2 py-1 text-xs text-center"
                  />
                </td>
                <td className="py-1 px-1">
                  <input
                    value={row.waist || ""}
                    onChange={(e) => updateRow(idx, "waist", e.target.value)}
                    placeholder='e.g. 28"'
                    className="w-full bg-white border border-cloud rounded-lg px-2 py-1 text-xs text-center"
                  />
                </td>
                <td className="py-1 px-1">
                  <input
                    value={row.hip || ""}
                    onChange={(e) => updateRow(idx, "hip", e.target.value)}
                    placeholder='e.g. 38"'
                    className="w-full bg-white border border-cloud rounded-lg px-2 py-1 text-xs text-center"
                  />
                </td>
                <td className="py-1 px-1">
                  <input
                    value={row.shoulder || ""}
                    onChange={(e) => updateRow(idx, "shoulder", e.target.value)}
                    placeholder='e.g. 14.5"'
                    className="w-full bg-white border border-cloud rounded-lg px-2 py-1 text-xs text-center"
                  />
                </td>
                <td className="py-1 px-1">
                  <input
                    value={row.length || ""}
                    onChange={(e) => updateRow(idx, "length", e.target.value)}
                    placeholder='e.g. 44"'
                    className="w-full bg-white border border-cloud rounded-lg px-2 py-1 text-xs text-center"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
