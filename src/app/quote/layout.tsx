import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Request a free quote for custom built-ins, floating shelves, closet systems, pantry pullouts, cabinetry, or fireplace mantels in Las Vegas and Henderson, NV.",
  alternates: { canonical: `${SITE_URL}/quote` },
  openGraph: {
    title: "Get a Free Quote | Sublime Design NV",
    description:
      "Tell us about your project — we respond with scope, timeline, and pricing. No pressure, no commitment.",
    url: `${SITE_URL}/quote`,
  },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
