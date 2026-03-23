import { getPublicBuildInfo } from "@/lib/buildInfo";

export default function BuildDebugBadge() {
  const build = getPublicBuildInfo();

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-50 rounded-full border border-black/10 bg-white/85 px-3 py-1.5 font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-charcoal shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70"
      aria-label={`Site build ${build.label}`}
    >
      {build.label}
    </div>
  );
}
