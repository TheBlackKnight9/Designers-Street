type StickerProps = {
  className?: string;
  size?: number;
};

/** 8-bit style scrapbook stickers — NEWME / album-art inspired */
export function PixelHeart({ className, size = 28 }: StickerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      aria-hidden
    >
      <rect x="2" y="4" width="2" height="2" fill="#E11D48" />
      <rect x="4" y="2" width="2" height="2" fill="#E11D48" />
      <rect x="6" y="2" width="2" height="2" fill="#E11D48" />
      <rect x="8" y="2" width="2" height="2" fill="#E11D48" />
      <rect x="10" y="4" width="2" height="2" fill="#E11D48" />
      <rect x="0" y="6" width="2" height="2" fill="#E11D48" />
      <rect x="2" y="8" width="2" height="2" fill="#E11D48" />
      <rect x="4" y="10" width="2" height="2" fill="#E11D48" />
      <rect x="6" y="12" width="2" height="2" fill="#E11D48" />
      <rect x="8" y="12" width="2" height="2" fill="#E11D48" />
      <rect x="10" y="10" width="2" height="2" fill="#E11D48" />
      <rect x="12" y="8" width="2" height="2" fill="#E11D48" />
      <rect x="14" y="6" width="2" height="2" fill="#E11D48" />
      <rect x="1" y="5" width="1" height="1" fill="#0A0A0A" />
      <rect x="3" y="3" width="1" height="1" fill="#0A0A0A" />
      <rect x="5" y="1" width="1" height="1" fill="#0A0A0A" />
      <rect x="7" y="1" width="1" height="1" fill="#0A0A0A" />
      <rect x="9" y="1" width="1" height="1" fill="#0A0A0A" />
      <rect x="11" y="3" width="1" height="1" fill="#0A0A0A" />
      <rect x="13" y="5" width="1" height="1" fill="#0A0A0A" />
    </svg>
  );
}

export function PixelStar({ className, size = 24 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="7" y="0" width="2" height="2" fill="#FACC15" />
      <rect x="5" y="2" width="2" height="2" fill="#FACC15" />
      <rect x="7" y="2" width="2" height="2" fill="#FDE047" />
      <rect x="9" y="2" width="2" height="2" fill="#FACC15" />
      <rect x="3" y="4" width="2" height="2" fill="#FACC15" />
      <rect x="5" y="4" width="2" height="2" fill="#FDE047" />
      <rect x="7" y="4" width="2" height="2" fill="#FACC15" />
      <rect x="9" y="4" width="2" height="2" fill="#FDE047" />
      <rect x="11" y="4" width="2" height="2" fill="#FACC15" />
      <rect x="1" y="6" width="2" height="2" fill="#FACC15" />
      <rect x="7" y="6" width="2" height="2" fill="#FDE047" />
      <rect x="13" y="6" width="2" height="2" fill="#FACC15" />
      <rect x="5" y="8" width="2" height="2" fill="#FACC15" />
      <rect x="7" y="8" width="2" height="2" fill="#FDE047" />
      <rect x="9" y="8" width="2" height="2" fill="#FACC15" />
      <rect x="6" y="10" width="2" height="2" fill="#FACC15" />
      <rect x="8" y="10" width="2" height="2" fill="#FACC15" />
      <rect x="5" y="12" width="2" height="2" fill="#FACC15" />
      <rect x="9" y="12" width="2" height="2" fill="#FACC15" />
      <rect x="7" y="14" width="2" height="2" fill="#FACC15" />
    </svg>
  );
}

export function PixelRainbow({ className, size = 36 }: StickerProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 24 14" className={className} aria-hidden>
      <rect x="2" y="10" width="20" height="2" fill="#EF4444" />
      <rect x="2" y="8" width="20" height="2" fill="#F97316" />
      <rect x="2" y="6" width="20" height="2" fill="#FACC15" />
      <rect x="2" y="4" width="20" height="2" fill="#22C55E" />
      <rect x="2" y="2" width="20" height="2" fill="#3B82F6" />
      <rect x="0" y="0" width="2" height="12" fill="#0A0A0A" />
      <rect x="22" y="0" width="2" height="12" fill="#0A0A0A" />
      <rect x="2" y="0" width="20" height="2" fill="#A855F7" />
    </svg>
  );
}

export function PixelMoon({ className, size = 28 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="4" y="2" width="2" height="2" fill="#FDE047" />
      <rect x="6" y="2" width="2" height="2" fill="#FDE047" />
      <rect x="8" y="2" width="2" height="2" fill="#FDE047" />
      <rect x="2" y="4" width="2" height="2" fill="#FDE047" />
      <rect x="4" y="4" width="2" height="2" fill="#FACC15" />
      <rect x="6" y="4" width="2" height="2" fill="#FACC15" />
      <rect x="8" y="4" width="2" height="2" fill="#FACC15" />
      <rect x="10" y="4" width="2" height="2" fill="#FDE047" />
      <rect x="2" y="6" width="2" height="2" fill="#FDE047" />
      <rect x="4" y="6" width="2" height="2" fill="#FACC15" />
      <rect x="6" y="6" width="2" height="2" fill="#0A0A0A" />
      <rect x="8" y="6" width="2" height="2" fill="#FACC15" />
      <rect x="10" y="6" width="2" height="2" fill="#FDE047" />
      <rect x="2" y="8" width="2" height="2" fill="#FDE047" />
      <rect x="4" y="8" width="2" height="2" fill="#FACC15" />
      <rect x="6" y="8" width="2" height="2" fill="#FACC15" />
      <rect x="8" y="8" width="2" height="2" fill="#FACC15" />
      <rect x="10" y="8" width="2" height="2" fill="#FDE047" />
      <rect x="4" y="10" width="2" height="2" fill="#FDE047" />
      <rect x="6" y="10" width="2" height="2" fill="#FDE047" />
      <rect x="8" y="10" width="2" height="2" fill="#FDE047" />
    </svg>
  );
}

export function PixelClover({ className, size = 32 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="4" y="0" width="2" height="2" fill="#22C55E" />
      <rect x="6" y="0" width="2" height="2" fill="#22C55E" />
      <rect x="2" y="2" width="2" height="2" fill="#22C55E" />
      <rect x="4" y="2" width="2" height="2" fill="#4ADE80" />
      <rect x="6" y="2" width="2" height="2" fill="#4ADE80" />
      <rect x="8" y="2" width="2" height="2" fill="#22C55E" />
      <rect x="10" y="2" width="2" height="2" fill="#22C55E" />
      <rect x="0" y="4" width="2" height="2" fill="#22C55E" />
      <rect x="2" y="4" width="2" height="2" fill="#4ADE80" />
      <rect x="4" y="4" width="2" height="2" fill="#22C55E" />
      <rect x="6" y="4" width="2" height="2" fill="#4ADE80" />
      <rect x="8" y="4" width="2" height="2" fill="#22C55E" />
      <rect x="10" y="4" width="2" height="2" fill="#4ADE80" />
      <rect x="12" y="4" width="2" height="2" fill="#22C55E" />
      <rect x="2" y="6" width="2" height="2" fill="#22C55E" />
      <rect x="4" y="6" width="2" height="2" fill="#4ADE80" />
      <rect x="6" y="6" width="2" height="2" fill="#22C55E" />
      <rect x="8" y="6" width="2" height="2" fill="#4ADE80" />
      <rect x="10" y="6" width="2" height="2" fill="#22C55E" />
      <rect x="6" y="8" width="2" height="2" fill="#22C55E" />
      <rect x="6" y="10" width="2" height="2" fill="#15803D" />
      <rect x="6" y="12" width="2" height="2" fill="#15803D" />
      <rect x="1" y="1" width="1" height="1" fill="#0A0A0A" />
      <rect x="11" y="1" width="1" height="1" fill="#0A0A0A" />
    </svg>
  );
}

export function PixelFlower({ className, size = 34 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="6" y="0" width="2" height="2" fill="#C084FC" />
      <rect x="4" y="2" width="2" height="2" fill="#A855F7" />
      <rect x="6" y="2" width="2" height="2" fill="#E9D5FF" />
      <rect x="8" y="2" width="2" height="2" fill="#A855F7" />
      <rect x="2" y="4" width="2" height="2" fill="#A855F7" />
      <rect x="4" y="4" width="2" height="2" fill="#E9D5FF" />
      <rect x="6" y="4" width="2" height="2" fill="#FDE047" />
      <rect x="8" y="4" width="2" height="2" fill="#E9D5FF" />
      <rect x="10" y="4" width="2" height="2" fill="#A855F7" />
      <rect x="4" y="6" width="2" height="2" fill="#A855F7" />
      <rect x="6" y="6" width="2" height="2" fill="#FDE047" />
      <rect x="8" y="6" width="2" height="2" fill="#A855F7" />
      <rect x="6" y="8" width="2" height="2" fill="#22C55E" />
      <rect x="6" y="10" width="2" height="2" fill="#22C55E" />
      <rect x="6" y="12" width="2" height="2" fill="#15803D" />
      <rect x="3" y="3" width="1" height="1" fill="#0A0A0A" />
      <rect x="9" y="3" width="1" height="1" fill="#0A0A0A" />
    </svg>
  );
}

export function PixelSparkle({ className, size = 20 }: StickerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden>
      <rect x="5" y="0" width="2" height="2" fill="#FDE047" />
      <rect x="3" y="2" width="2" height="2" fill="#FACC15" />
      <rect x="5" y="2" width="2" height="2" fill="#FDE047" />
      <rect x="7" y="2" width="2" height="2" fill="#FACC15" />
      <rect x="1" y="4" width="2" height="2" fill="#FACC15" />
      <rect x="5" y="4" width="2" height="2" fill="#FDE047" />
      <rect x="9" y="4" width="2" height="2" fill="#FACC15" />
      <rect x="3" y="6" width="2" height="2" fill="#FACC15" />
      <rect x="5" y="6" width="2" height="2" fill="#FDE047" />
      <rect x="7" y="6" width="2" height="2" fill="#FACC15" />
      <rect x="5" y="8" width="2" height="2" fill="#FACC15" />
    </svg>
  );
}

/** Tiny pixel mascots row (album-art style) */
export function PixelMascotRow({ className }: { className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className ?? ""}`} aria-hidden>
      {["#F472B6", "#38BDF8", "#FACC15", "#4ADE80", "#A78BFA"].map((color, i) => (
        <svg key={i} width={14} height={14} viewBox="0 0 8 8">
          <rect x="2" y="1" width="4" height="2" fill={color} />
          <rect x="1" y="3" width="2" height="2" fill={color} />
          <rect x="5" y="3" width="2" height="2" fill={color} />
          <rect x="2" y="5" width="4" height="2" fill={color} />
          <rect x="3" y="2" width="1" height="1" fill="#0A0A0A" />
          <rect x="5" y="2" width="1" height="1" fill="#0A0A0A" />
        </svg>
      ))}
    </div>
  );
}

function CornerBracket({ className }: { className?: string }) {
  return (
    <span
      className={`absolute w-4 h-4 border-white pointer-events-none ${className}`}
      aria-hidden
    />
  );
}

export function ImageCornerBrackets() {
  return (
    <>
      <CornerBracket className="top-3 left-3 border-t-2 border-l-2" />
      <CornerBracket className="top-3 right-3 border-t-2 border-r-2" />
      <CornerBracket className="bottom-3 left-3 border-b-2 border-l-2" />
      <CornerBracket className="bottom-3 right-3 border-b-2 border-r-2" />
    </>
  );
}

export function CrosshairMark({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      className={className}
      aria-hidden
    >
      <rect x="6" y="0" width="2" height="14" fill="currentColor" />
      <rect x="0" y="6" width="14" height="2" fill="currentColor" />
    </svg>
  );
}
