"use client";

type AtelierStatusBadgeProps = {
  status: string;
  className?: string;
};

export function AtelierStatusBadge({ status, className = "" }: AtelierStatusBadgeProps) {
  const normalized = status.toLowerCase();

  let colorClasses = "bg-gray-100 text-gray-800 border-gray-300";

  switch (normalized) {
    case "pending":
    case "submitted":
      colorClasses = "bg-amber-50 text-amber-900 border-amber-300";
      break;
    case "confirmed":
    case "accepted":
      colorClasses = "bg-emerald-50 text-emerald-900 border-emerald-300";
      break;
    case "in_review":
    case "under_review":
      colorClasses = "bg-blue-50 text-blue-900 border-blue-300";
      break;
    case "in_production":
      colorClasses = "bg-purple-50 text-purple-900 border-purple-300";
      break;
    case "ready":
    case "completed":
    case "delivered":
      colorClasses = "bg-green-100 text-green-900 border-green-400 font-extrabold";
      break;
    case "cancelled":
    case "rejected":
      colorClasses = "bg-red-50 text-red-800 border-red-200";
      break;
  }

  const label = status.replace(/_/g, " ").toUpperCase();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[9px] font-sans font-bold uppercase tracking-wider ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
