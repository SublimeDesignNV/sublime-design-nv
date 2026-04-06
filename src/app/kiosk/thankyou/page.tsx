"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";
const RESET_AFTER_MS = 90_000;

export default function KioskThankyouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firstName = searchParams.get("name") ?? "there";
  const token = searchParams.get("token") ?? "";

  const statusUrl = token ? `${SITE_URL}/intake/${token}` : SITE_URL;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startResetTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      router.replace("/kiosk");
    }, RESET_AFTER_MS);
  }

  useEffect(() => {
    startResetTimer();
    const events = ["touchstart", "touchmove", "click", "keydown"] as const;
    const reset = () => startResetTimer();
    events.forEach((e) => window.addEventListener(e, reset));
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-8 text-center">
      {/* Red accent top */}
      <div className="absolute left-0 right-0 top-0 h-2 bg-red" />

      {/* Check mark */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red/20">
        <span className="text-5xl">✓</span>
      </div>

      <h1 className="font-display text-5xl text-white md:text-6xl">
        You&apos;re all set, {firstName}!
      </h1>

      <p className="mt-5 max-w-lg text-xl leading-relaxed text-white/70">
        We&apos;ll follow up within 24 hours with your personalized design concept.
      </p>

      {/* QR Code */}
      {token && (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="font-ui text-sm uppercase tracking-widest text-white/40">
            Scan to view your submission
          </p>
          <div className="rounded-2xl bg-white p-4">
            <QRCodeSVG value={statusUrl} size={180} />
          </div>
          <p className="font-ui text-xs text-white/30">{statusUrl}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.replace("/kiosk")}
        className="mt-12 min-h-[64px] rounded-xl border border-white/20 px-10 text-lg text-white/70 active:bg-white/10"
      >
        Start Over
      </button>

      {/* Auto-reset note */}
      <p className="mt-6 font-ui text-xs text-white/20">
        Returns to home screen automatically after 90 seconds
      </p>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-8 py-4">
        <p className="font-ui text-xs text-white/20">
          Powered by Sublime Design NV
        </p>
      </div>
    </main>
  );
}
