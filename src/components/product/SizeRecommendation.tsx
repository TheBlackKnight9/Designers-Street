"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  id: string;
  name: string;
  unit: string;
  chest: number | null;
  waist: number | null;
  hip: number | null;
  isDefault: boolean;
};

export function SizeRecommendation({
  selectedSize,
  onSelectSize,
  onAttachMeasurements,
}: {
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
  onAttachMeasurements?: (profile: Profile) => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [fitScore, setFitScore] = useState<number>(95);
  const [useCustomFit, setUseCustomFit] = useState(false);

  useEffect(() => {
    fetch("/api/account/measurements")
      .then((res) => res.json())
      .then((body) => {
        if (body?.ok && Array.isArray(body.data?.profiles) && body.data.profiles.length > 0) {
          const defaultProf = body.data.profiles.find((p: Profile) => p.isDefault) || body.data.profiles[0];
          setProfile(defaultProf);

          // Calculate recommended size from bust/chest (inches)
          const chest = defaultProf.chest || 36;
          let rec = "M";
          let score = 96;

          if (chest <= 33) rec = "XS";
          else if (chest <= 35) rec = "S";
          else if (chest <= 37) rec = "M";
          else if (chest <= 39) rec = "L";
          else if (chest <= 41) rec = "XL";
          else rec = "XXL";

          setRecommendedSize(rec);
          setFitScore(score);

          if (onSelectSize && !selectedSize) {
            onSelectSize(rec);
          }
        }
      })
      .catch(() => undefined);
  }, []);

  function handleCustomFitToggle(checked: boolean) {
    setUseCustomFit(checked);
    if (checked && profile && onAttachMeasurements) {
      onAttachMeasurements(profile);
    }
  }

  if (!profile || !recommendedSize) {
    return (
      <div className="text-[11px] text-stone flex items-center justify-between bg-mist/30 p-2.5 rounded-xl border border-cloud/60">
        <span>Save your measurement profile for 1-click size recommendations.</span>
        <Link href="/profile/measurements" className="font-bold text-charcoal underline ml-2 shrink-0">
          + Add Fit
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2 bg-mist/40 p-3 rounded-2xl border border-gold/30">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-charcoal">
          <span className="text-gold">✨</span>
          <span>Recommended Size: <strong className="text-gold-dark uppercase font-extrabold text-sm">{recommendedSize}</strong></span>
          <span className="bg-gold/20 text-gold-dark text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-gold/30">
            {fitScore}% Match
          </span>
        </div>
        <Link href="/profile/measurements" className="text-[10px] text-stone hover:text-charcoal underline">
          {profile.name} (Edit)
        </Link>
      </div>

      <label className="flex items-center gap-2 pt-1 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={useCustomFit}
          onChange={(e) => handleCustomFitToggle(e.target.checked)}
          className="accent-charcoal rounded"
        />
        <span className="text-stone">
          Attach <strong className="text-charcoal font-semibold">{profile.name}</strong> measurements for custom bespoke tailoring
        </span>
      </label>
    </div>
  );
}
