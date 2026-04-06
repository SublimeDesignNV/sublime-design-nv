import Link from "next/link";

export default function KioskAttractPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-8 text-center">
      {/* Subtle star-field background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Red accent bar top */}
      <div className="absolute left-0 right-0 top-0 h-2 bg-red" />

      {/* Logo */}
      <div className="relative mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-light.png"
          alt="Sublime Design NV"
          className="mx-auto h-20 w-auto"
        />
      </div>

      {/* Headline */}
      <h1 className="relative max-w-2xl font-display text-5xl leading-tight text-white md:text-6xl">
        Tell us about your project
      </h1>
      <p className="relative mt-5 max-w-xl text-xl leading-relaxed text-white/70">
        We&apos;ll show you what&apos;s possible.
      </p>

      {/* CTA */}
      <Link
        href="/kiosk/start"
        className="relative mt-12 inline-flex min-h-[72px] items-center gap-3 rounded-xl bg-red px-12 py-4 text-2xl font-semibold text-white shadow-xl active:scale-95"
      >
        Get Started →
      </Link>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-8 py-4">
        <p className="font-ui text-sm uppercase tracking-widest text-white/30">
          Sublime Design NV · Las Vegas Custom Carpentry
        </p>
      </div>
    </main>
  );
}
