"use client";

type CatalogStatusProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  skeletonCount?: number;
};

export function CatalogStatus({
  loading,
  error,
  empty,
  emptyMessage = "Nothing to show yet.",
  onRetry,
  skeletonCount = 4,
}: CatalogStatusProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4" aria-busy="true" aria-label="Loading">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-xl bg-[#E8E4DC]/70 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="font-sans text-sm text-[#7A7A7A] mb-3">{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="font-sans text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] underline"
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="font-sans text-sm text-[#A0A0A0] font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return null;
}
