import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Raleway } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import BuildDebugBadge from "@/components/layout/BuildDebugBadge";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const displayFont = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Raleway({
  variable: "--font-body",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const uiFont = Montserrat({
  variable: "--font-ui",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";

export const metadata: Metadata = {
  title: {
    default: "Sublime Design NV | Custom Woodwork Las Vegas",
    template: "%s | Sublime Design NV",
  },
  description:
    "Custom built-ins, floating shelves, closet systems, pantry pullouts, cabinetry, and mantels — measured, shop-built, and installed throughout Las Vegas and Henderson, NV. Free estimates.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "Sublime Design NV",
    locale: "en_US",
    type: "website",
  },
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${uiFont.variable}`}
    >
      <body className="antialiased">
        {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
        <Navbar />
        {children}
        <BuildDebugBadge />
        <Footer />
      </body>
    </html>
  );
}
