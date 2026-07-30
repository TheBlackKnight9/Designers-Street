"use client";

import type { ReactNode } from "react";

type MediaOverlayProps = {
  children: ReactNode;
  onBackdropClick?: () => void;
};

/** Fullscreen dark scrim shell (z above StoryViewer). */
export function MediaOverlay({ children, onBackdropClick }: MediaOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[90] bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackdropClick?.();
      }}
    >
      {children}
    </div>
  );
}
