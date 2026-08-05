import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "inverted" | "feature";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  id,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-8 py-4 font-sans text-sm font-semibold uppercase tracking-nav transition-all duration-300 select-none btn-press shadow-sm";

  const variants = {
    primary:
      "bg-espresso text-chip border-none hover:bg-espresso-soft shadow-[0_2px_8px_rgba(42,31,24,0.25)]",
    inverted:
      "bg-chip text-espresso border-[1.5px] border-espresso hover:bg-mist shadow-[0_1px_3px_rgba(42,31,24,0.12)]",
    feature:
      "bg-bronze text-[#1A120C] border-none hover:bg-bronze-deep shadow-[0_2px_10px_rgba(166,124,82,0.35)] font-extrabold",
  };

  const classes = `${base} rounded-full border ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} id={id}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      id={id}
    >
      {children}
    </button>
  );
}
