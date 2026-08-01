/** Soft haptic feedback when Vibration API is available (mobile). */
export function softHaptic(pattern: number | number[] = 8): void {
  if (typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
