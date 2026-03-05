const TRUST_SIGNALS = [
  "Licensed & Insured",
  "Custom Built",
  "Install Included",
  "Fast Turnarounds",
] as const;

export default function TrustSignals() {
  return (
    <section className="bg-navy py-5">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 md:grid-cols-4 md:px-8">
        {TRUST_SIGNALS.map((item) => (
          <p key={item} className="font-ui text-center text-xs uppercase tracking-[0.18em] text-white/85">
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
