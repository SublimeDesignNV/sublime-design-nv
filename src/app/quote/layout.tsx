import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";

export const metadata: Metadata = {
  title: "Start with a Quote | Sublime Design NV",
  description:
    "Start with a quote for built-ins, floating shelves, closet systems, pantry pullouts, custom cabinetry, or mantels in Las Vegas, Henderson, Summerlin, and the wider Las Vegas Valley.",
  alternates: { canonical: `${SITE_URL}/quote` },
  openGraph: {
    title: "Start with a Quote | Sublime Design NV",
    description:
      "Tell us about your project — we respond with scope, timeline, and pricing. No pressure, no commitment.",
    url: `${SITE_URL}/quote`,
  },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
