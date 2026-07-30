"use client";

import { useShare } from "@/hooks/useShare";

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
  const { share, copied } = useShare();

  return (
    <button
      type="button"
      onClick={() => {
        void share({ title, text, url: path });
      }}
      className={className}
      aria-label={copied ? "Link copied" : label}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
