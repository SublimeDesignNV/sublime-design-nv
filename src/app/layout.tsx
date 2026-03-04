import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Raleway } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import BuildDebugBadge from "@/components/layout/BuildDebugBadge";
import Footer from "@/components/layout/Footer";
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

export const metadata: Metadata = {
  title: "Sublime Design NV | Custom Woodwork Las Vegas",
  description:
    "Las Vegas's premier custom woodwork company. Free estimates. Call (702) 241-6907.",
};

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
        <Navbar />
        {children}
        <BuildDebugBadge />
        <Footer />
      </body>
    </html>
  );
}
