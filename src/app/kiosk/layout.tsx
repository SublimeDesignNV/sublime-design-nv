import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sublime Design NV",
  robots: { index: false, follow: false },
};

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy text-white" style={{ touchAction: "manipulation" }}>
      {children}
    </div>
  );
}
