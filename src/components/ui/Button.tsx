import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "inverted";
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
    "inline-flex items-center justify-center px-8 py-4 font-sans text-sm font-semibold uppercase tracking-nav transition-all duration-300 select-none btn-press";

  const variants = {
    primary:
      "curvy-btn-dark text-[#E0E5EC] hover:opacity-95",
    inverted:
      "curvy-btn text-[#2B2B2B] hover:opacity-95",
  };

  const classes = `${base} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`;

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
