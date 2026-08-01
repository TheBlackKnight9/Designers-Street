"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CommentPanel } from "@/components/comments/CommentPanel";

type CommentSheetProps = {
  open: boolean;
  postId: string;
  designerName?: string;
  designerHandle?: string;
  onClose: () => void;
  onCountChange?: (count: number) => void;
};

export function CommentSheet({
  open,
  postId,
  designerName,
  designerHandle,
  onClose,
  onCountChange,
}: CommentSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close comments"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
        className="relative z-10 max-h-[70vh] rounded-t-3xl bg-[#FDFCF8] shadow-2xl translate-y-0"
        style={{
          animation: "ds-sheet-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-10 rounded-full bg-[#D0D0D0]" />
        </div>
        <div className="overflow-y-auto max-h-[calc(70vh-1.5rem)]">
          <CommentPanel
            postId={postId}
            designerName={designerName}
            designerHandle={designerHandle}
            onCountChange={onCountChange}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
