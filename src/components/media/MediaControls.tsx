"use client";

type MediaControlsProps = {
  index: number;
  count: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  title?: string;
};

export function MediaControls({
  index,
  count,
  onClose,
  onPrev,
  onNext,
  canPrev,
  canNext,
  title,
}: MediaControlsProps) {
  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 bg-gradient-to-b from-black/70 to-transparent">
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white"
          aria-label="Close media viewer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          {title ? (
            <p className="font-sans text-[10px] text-white/70 uppercase tracking-wider truncate max-w-[40vw]">
              {title}
            </p>
          ) : null}
          <p className="font-sans text-xs font-bold text-white" aria-live="polite">
            {count > 0 ? `${index + 1} / ${count}` : "0 / 0"}
          </p>
        </div>
        <div className="w-10" aria-hidden />
      </header>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-black/40 text-white disabled:opacity-30"
            aria-label="Previous media"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-black/40 text-white disabled:opacity-30"
            aria-label="Next media"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}
    </>
  );
}
