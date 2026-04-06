"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneInput } from "@/components/ui/PhoneInput";

type Service = {
  value: string;
  label: string;
  emoji: string;
};

const SERVICES: Service[] = [
  { value: "CABINETS", label: "Custom Cabinets", emoji: "🗄️" },
  { value: "FLOATING_SHELVES", label: "Floating Shelves", emoji: "📚" },
  { value: "CUSTOM_CLOSETS", label: "Closet Systems", emoji: "🚪" },
  { value: "BARN_DOORS", label: "Barn Doors", emoji: "🪵" },
  { value: "MANTELS", label: "Mantels", emoji: "🔥" },
  { value: "OTHER", label: "Something Else", emoji: "✏️" },
];

type Step = "service" | "contact";

export default function KioskStartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "tradeshow";

  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function selectService(value: string) {
    setSelectedService(value);
    setStep("contact");
  }

  async function handleSubmit() {
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/kiosk/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          phone: phone || undefined,
          serviceType: selectedService,
          source: mode === "jobwalk" ? "kiosk-jobwalk" : "kiosk-tradeshow",
        }),
      });

      const data = (await res.json()) as { ok: boolean; token?: string; error?: string };
      if (!data.ok || !data.token) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const modeParam = mode !== "tradeshow" ? `?mode=${mode}` : "";
      router.push(`/kiosk/intake/${data.token}${modeParam}`);
    } catch {
      setError("Connection error. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-navy">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-light.png"
          alt="Sublime Design NV"
          className="h-10 w-auto"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {step === "contact" && (
          <button
            type="button"
            onClick={() => setStep("service")}
            className="min-h-[56px] rounded-xl border border-white/20 px-6 text-lg text-white/70 active:bg-white/10"
          >
            ← Back
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
        {step === "service" && (
          <>
            <h1 className="mb-3 text-center font-display text-4xl text-white md:text-5xl">
              What are you building?
            </h1>
            <p className="mb-10 text-center text-xl text-white/60">
              Tap your project type to get started
            </p>
            <div className="grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-3">
              {SERVICES.map((service) => (
                <button
                  key={service.value}
                  type="button"
                  onClick={() => selectService(service.value)}
                  className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 p-5 text-center text-white transition active:scale-95 active:bg-white/15"
                >
                  <span className="text-4xl">{service.emoji}</span>
                  <span className="text-lg font-semibold leading-tight">{service.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "contact" && (
          <div className="w-full max-w-md">
            <h1 className="mb-2 text-center font-display text-4xl text-white">
              Quick intro
            </h1>
            <p className="mb-10 text-center text-lg text-white/60">
              We&apos;ll customize the next questions for you
            </p>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block font-ui text-sm uppercase tracking-widest text-white/50">
                  First Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-2xl text-white placeholder-white/30 outline-none focus:border-red"
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="mb-2 block font-ui text-sm uppercase tracking-widest text-white/50">
                  Phone (optional)
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-2xl text-white placeholder-white/30 outline-none focus:border-red"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red/20 px-4 py-3 text-sm text-red">{error}</p>
            )}

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="mt-8 w-full min-h-[72px] rounded-xl bg-red text-2xl font-semibold text-white shadow-xl active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? "Starting…" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
