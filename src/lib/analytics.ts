/**
 * Lightweight GA4 analytics helper.
 * Wraps window.gtag with a no-op fallback so callers never need to
 * null-check — safe to call in dev/local when GA is not loaded.
 */

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetOrDate: string | Date,
      params?: Record<string, unknown>,
    ) => void;
    dataLayer: unknown[];
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
