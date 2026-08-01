"use client";

import { useEffect, useRef, useState } from "react";

/** Soft count tick when likes/comments change. */
export function AnimatedCount({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const [bump, setBump] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    setBump(true);
    const from = prev.current;
    const to = value;
    prev.current = value;
    const start = performance.now();
    const dur = 280;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setBump(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const label =
    display > 999 ? `${(display / 1000).toFixed(1)}k` : String(display);

  return (
    <span
      className={`inline-block font-sans text-[10px] font-bold text-white drop-shadow transition-transform duration-200 ${
        bump ? "scale-125" : "scale-100"
      } ${className}`}
    >
      {label}
    </span>
  );
}
