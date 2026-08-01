"use client";

import { useState } from "react";
import Image from "next/image";

export type APlusModule =
  | {
      type: "BRAND_STORY";
      image: string;
      title: string;
      description: string;
    }
  | {
      type: "FULL_BANNER_QUOTE";
      image: string;
      quote: string;
      author?: string;
    }
  | {
      type: "THREE_IMAGE_GRID";
      images: [string, string, string];
      titles: [string, string, string];
    };

export function APlusContentEditor({
  initialModules,
  onChange,
}: {
  initialModules?: APlusModule[] | null;
  onChange: (modules: APlusModule[]) => void;
}) {
  const [modules, setModules] = useState<APlusModule[]>(initialModules || []);

  function addModule(type: APlusModule["type"]) {
    let newMod: APlusModule;
    if (type === "BRAND_STORY") {
      newMod = {
        type: "BRAND_STORY",
        image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80",
        title: "Craftsmanship & Heritage",
        description: "Hand-embellished by master artisans over 140 hours using authentic Zardozi metallic threadwork.",
      };
    } else if (type === "FULL_BANNER_QUOTE") {
      newMod = {
        type: "FULL_BANNER_QUOTE",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
        quote: "Couture is not merely fashion; it is living sculpture woven with timeless emotion.",
        author: "Master Designer",
      };
    } else {
      newMod = {
        type: "THREE_IMAGE_GRID",
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80",
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80",
          "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&q=80",
        ],
        titles: ["Fabric Close-up", "Hand-stitched Motif", "Atelier Finish"],
      };
    }

    const updated = [...modules, newMod];
    setModules(updated);
    onChange(updated);
  }

  function removeModule(index: number) {
    const updated = modules.filter((_, i) => i !== index);
    setModules(updated);
    onChange(updated);
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-cloud space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-cloud pb-3">
        <h2 className="font-display text-sm font-bold uppercase text-charcoal">A+ Rich Content Modules</h2>
        <span className="text-xs font-mono font-bold text-stone">{modules.length} Modules</span>
      </div>

      <div className="space-y-4">
        {modules.map((mod, idx) => (
          <div key={idx} className="p-4 bg-mist rounded-2xl border border-cloud relative space-y-3">
            <button
              type="button"
              onClick={() => removeModule(idx)}
              className="absolute top-3 right-3 text-xs font-bold text-red-700 underline"
            >
              Remove
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-stone block">
              Module {idx + 1}: {mod.type}
            </span>

            {mod.type === "BRAND_STORY" && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  value={mod.title}
                  onChange={(e) => {
                    const clone = [...modules];
                    (clone[idx] as any).title = e.target.value;
                    setModules(clone);
                    onChange(clone);
                  }}
                  placeholder="Title"
                  className="rounded-xl border border-cloud p-2 bg-white font-bold"
                />
                <input
                  value={mod.image}
                  onChange={(e) => {
                    const clone = [...modules];
                    (clone[idx] as any).image = e.target.value;
                    setModules(clone);
                    onChange(clone);
                  }}
                  placeholder="Image URL"
                  className="rounded-xl border border-cloud p-2 bg-white"
                />
                <textarea
                  rows={2}
                  value={mod.description}
                  onChange={(e) => {
                    const clone = [...modules];
                    (clone[idx] as any).description = e.target.value;
                    setModules(clone);
                    onChange(clone);
                  }}
                  placeholder="Description"
                  className="col-span-2 rounded-xl border border-cloud p-2 bg-white"
                />
              </div>
            )}

            {mod.type === "FULL_BANNER_QUOTE" && (
              <div className="space-y-2 text-xs">
                <input
                  value={mod.image}
                  onChange={(e) => {
                    const clone = [...modules];
                    (clone[idx] as any).image = e.target.value;
                    setModules(clone);
                    onChange(clone);
                  }}
                  placeholder="Banner Image URL"
                  className="w-full rounded-xl border border-cloud p-2 bg-white"
                />
                <input
                  value={mod.quote}
                  onChange={(e) => {
                    const clone = [...modules];
                    (clone[idx] as any).quote = e.target.value;
                    setModules(clone);
                    onChange(clone);
                  }}
                  placeholder="Quote"
                  className="w-full rounded-xl border border-cloud p-2 bg-white italic"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={() => addModule("BRAND_STORY")}
          className="px-4 py-2 bg-mist border border-cloud rounded-xl text-xs font-bold text-charcoal hover:border-stone"
        >
          + Brand Story Module
        </button>
        <button
          type="button"
          onClick={() => addModule("FULL_BANNER_QUOTE")}
          className="px-4 py-2 bg-mist border border-cloud rounded-xl text-xs font-bold text-charcoal hover:border-stone"
        >
          + Banner Quote Module
        </button>
        <button
          type="button"
          onClick={() => addModule("THREE_IMAGE_GRID")}
          className="px-4 py-2 bg-mist border border-cloud rounded-xl text-xs font-bold text-charcoal hover:border-stone"
        >
          + 3-Image Showcase Grid
        </button>
      </div>
    </div>
  );
}
