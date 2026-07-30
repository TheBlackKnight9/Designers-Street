"use client";

import { useRef, useCallback, type ReactNode } from "react";

type GestureHandlerProps = {
  enabled?: boolean;
  zoomed?: boolean;
  /** Primary swipe axis. Continuous / Reels mode uses vertical. */
  axis?: "horizontal" | "vertical" | "both";
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: (x: number, y: number) => void;
  onPinchZoom?: (scaleDelta: number) => void;
  onWheelZoom?: (delta: number) => void;
  children: ReactNode;
  className?: string;
};

const SWIPE_THRESHOLD = 50;

export function GestureHandler({
  enabled = true,
  zoomed = false,
  axis = "horizontal",
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onPinchZoom,
  onWheelZoom,
  children,
  className = "",
}: GestureHandlerProps) {
  const startX = useRef(0);
  const startY = useRef(0);
  const lastTap = useRef(0);
  const pinchStart = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStart.current = Math.hypot(dx, dy);
        return;
      }
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    },
    [enabled]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || e.touches.length !== 2 || pinchStart.current == null) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = (dist - pinchStart.current) / 120;
      pinchStart.current = dist;
      onPinchZoom?.(delta);
    },
    [enabled, onPinchZoom]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      pinchStart.current = null;
      if (zoomed) {
        const now = Date.now();
        if (now - lastTap.current < 280) {
          const t = e.changedTouches[0];
          onDoubleTap?.(t.clientX, t.clientY);
        }
        lastTap.current = now;
        return;
      }
      const t = e.changedTouches[0];
      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      const allowH = axis === "horizontal" || axis === "both";
      const allowV = axis === "vertical" || axis === "both";

      if (allowV && absY > SWIPE_THRESHOLD && absY > absX) {
        if (dy < 0) onSwipeUp?.();
        else onSwipeDown?.();
        return;
      }
      if (allowH && absX > SWIPE_THRESHOLD && absX > absY) {
        if (dx < 0) onSwipeLeft?.();
        else onSwipeRight?.();
        return;
      }

      const now = Date.now();
      if (now - lastTap.current < 280) {
        onDoubleTap?.(t.clientX, t.clientY);
      }
      lastTap.current = now;
    },
    [
      enabled,
      zoomed,
      axis,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onDoubleTap,
    ]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!enabled) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        onWheelZoom?.(-e.deltaY * 0.01);
        return;
      }
      // Trackpad / mouse wheel advances continuous feed
      if (axis === "vertical" || axis === "both") {
        if (Math.abs(e.deltaY) < 40) return;
        e.preventDefault();
        if (e.deltaY > 0) onSwipeUp?.();
        else onSwipeDown?.();
      }
    },
    [enabled, axis, onWheelZoom, onSwipeUp, onSwipeDown]
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      onDoubleTap?.(e.clientX, e.clientY);
    },
    [enabled, onDoubleTap]
  );

  return (
    <div
      className={className}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
}
