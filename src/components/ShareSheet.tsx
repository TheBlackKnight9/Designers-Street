"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  type SharePayload,
  buildEmailShareUrl,
  buildFacebookShareUrl,
  buildTelegramShareUrl,
  buildTwitterShareUrl,
  buildWhatsAppShareUrl,
  canNativeShare,
  copyShareLink,
  nativeShare,
  resolveShareUrl,
} from "@/lib/share-links";

type ShareSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  text?: string;
  url: string;
};

type ShareOption = {
  id: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  action: () => void;
};

export function ShareSheet({
  open,
  onClose,
  title,
  text,
  url,
}: ShareSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  const payload: SharePayload = { title, text, url };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open || typeof document === "undefined") return null;

  const openExternal = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    onClose();
  };

  const options: ShareOption[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      color: "#25D366",
      icon: (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.887L0 24l6.335-1.662A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.82 9.82 0 0 1-5.01-1.378l-.361-.214-3.742.982 1-3.648-.235-.374A9.817 9.817 0 0 1 2.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z" />
        </svg>
      ),
      action: () => openExternal(buildWhatsAppShareUrl(payload)),
    },
    {
      id: "email",
      label: "Email",
      color: "#EA4335",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      action: () => {
        window.location.href = buildEmailShareUrl(payload);
        onClose();
      },
    },
    {
      id: "facebook",
      label: "Facebook",
      color: "#1877F2",
      icon: (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      action: () => openExternal(buildFacebookShareUrl(payload)),
    },
    {
      id: "x",
      label: "X",
      color: "#141414",
      icon: (
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () => openExternal(buildTwitterShareUrl(payload)),
    },
    {
      id: "telegram",
      label: "Telegram",
      color: "#26A5E4",
      icon: (
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      action: () => openExternal(buildTelegramShareUrl(payload)),
    },
    {
      id: "copy",
      label: copied ? "Copied!" : "Copy link",
      color: "#6B7280",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-3.884a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
      action: () => {
        void copyShareLink(url).then((ok) => {
          if (ok) {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
              onClose();
            }, 900);
          }
        });
      },
    },
  ];

  if (canNativeShare()) {
    options.unshift({
      id: "more",
      label: "More",
      color: "#374151",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      ),
      action: () => {
        void nativeShare(payload).then((ok) => {
          if (ok) onClose();
        });
      },
    });
  }

  const displayUrl = resolveShareUrl(url);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px] animate-[fade-in_0.2s_ease-out]"
        aria-label="Close share"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share"
        className="relative z-10 rounded-t-3xl bg-paper shadow-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{ animation: "ds-sheet-up 0.32s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-10 rounded-full bg-mist" />
        </div>

        <div className="px-5 pt-2 pb-4">
          <h2 className="font-display text-lg font-bold text-charcoal uppercase tracking-wide">
            Share
          </h2>
          <p className="mt-1 text-[11px] text-stone truncate">{title}</p>
        </div>

        <div className="px-5 pb-2 grid grid-cols-4 gap-4 sm:grid-cols-6">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={opt.action}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full shadow-md"
                style={{ backgroundColor: opt.color }}
              >
                {opt.icon}
              </span>
              <span className="text-[10px] font-bold text-charcoal text-center leading-tight">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mx-5 mt-4 mb-2 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-mist/40 px-3 py-2.5">
          <span className="flex-1 text-[10px] text-stone truncate font-mono">
            {displayUrl}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
