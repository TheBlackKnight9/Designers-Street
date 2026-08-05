"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function GoogleMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Shared card shell for login / signup — matches Designer's Street auth mock. */
export function AuthScreen({ title, subtitle, children, footer }: AuthScreenProps) {
  return (
    <div className="min-h-[100dvh] bg-transparent flex items-start justify-center px-4 pt-10 pb-28">
      <div className="w-full max-w-md rounded-[2rem] bg-chip border border-espresso/10 px-6 py-8 sm:px-8 shadow-[0_8px_40px_rgba(42,31,24,0.1)]">
        <div className="text-center mb-7">
          <h1 className="font-sans text-[1.65rem] font-extrabold text-charcoal tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-stone px-1">{subtitle}</p>
        </div>
        {children}
        {footer ? <div className="mt-7 text-center space-y-3">{footer}</div> : null}
      </div>
    </div>
  );
}

type AuthFieldProps = {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  icon: "email" | "lock" | "user";
};

export function AuthField({
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  icon,
}: AuthFieldProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone">
        {icon === "email" && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        )}
        {icon === "lock" && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        )}
        {icon === "user" && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        )}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        suppressHydrationWarning
        className="w-full rounded-full border border-espresso/20 bg-chip pl-12 pr-4 py-3.5 text-sm text-charcoal placeholder:text-silver outline-none focus:border-bronze focus:ring-2 focus:ring-bronze/25"
      />
    </div>
  );
}

export function AuthPrimaryButton({
  children,
  loading,
  type = "submit",
  onClick,
  disabled,
}: {
  children: ReactNode;
  loading?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      suppressHydrationWarning
      className="w-full rounded-full bg-espresso text-chip py-3.5 text-sm font-extrabold shadow-[0_8px_20px_rgba(42,31,24,0.3)] hover:bg-espresso-soft active:scale-[0.99] transition disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function AuthGoogleButton({
  onClick,
  loading,
  label = "Continue with Google",
  variant = "primary",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  /** primary = main CTA (passwordless); secondary = outline */
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-chip border-[1.5px] border-espresso text-espresso shadow-[0_2px_10px_rgba(42,31,24,0.12)] hover:bg-canvas-soft"
      : "border border-espresso/20 bg-chip text-charcoal hover:bg-mist/60";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      suppressHydrationWarning
      className={`w-full flex items-center justify-center gap-3 rounded-full py-3.5 text-sm font-extrabold active:scale-[0.99] transition disabled:opacity-60 ${styles}`}
    >
      <GoogleMark />
      {loading ? "Connecting…" : label}
    </button>
  );
}

export function AuthDivider({ label = "OR USE EMAIL" }: { label?: string }) {
  return (
    <div className="relative flex items-center justify-center my-5">
      <div className="border-t border-espresso/10 w-full" />
      <span className="absolute bg-chip px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-silver">
        {label}
      </span>
    </div>
  );
}

export function AuthBackLink() {
  return (
    <Link href="/" className="inline-block text-sm text-stone hover:text-charcoal">
      ← Back to shop
    </Link>
  );
}
