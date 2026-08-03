"use client";

import { useState } from "react";
import { ShareSheet } from "@/components/ShareSheet";

type ShareButtonProps = {
  title: string;
  text?: string;
  path: string;
  className?: string;
  label?: string;
};

export function ShareButton({
  title,
  text,
  path,
  className = "",
  label = "Share",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        aria-label={label}
      >
        {label}
      </button>
      <ShareSheet
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        text={text}
        url={path}
      />
    </>
  );
}
