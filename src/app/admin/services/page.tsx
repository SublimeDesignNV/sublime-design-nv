"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type ServiceType = {
  id: string;
  slug: string;
  title: string;
  coverImage: string | null;
};

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event: string; info: { secure_url: string } }) => void
      ) => { open: () => void };
    };
  }
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((data: ServiceType[]) => setServices(data))
      .catch(() => setError("Failed to load services."))
      .finally(() => setLoading(false));
  }, []);

  const openUploadWidget = useCallback((service: ServiceType) => {
    if (!window.cloudinary) {
      setError("Cloudinary widget not loaded. Refresh and try again.");
      return;
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        folder: `Sublime/Services/${service.slug}`,
        cropping: true,
        croppingAspectRatio: 1.6,
        maxFiles: 1,
        sources: ["local", "url", "camera"],
        styles: {
          palette: {
            window: "#1B2A6B",
            windowBorder: "#CC2027",
            tabIcon: "#FFFFFF",
            menuIcons: "#FFFFFF",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#CC2027",
            action: "#CC2027",
            inactiveTabIcon: "#8E9FBF",
            error: "#F44235",
            inProgress: "#CC2027",
            complete: "#20B832",
            sourceBg: "#13233A",
          },
        },
      },
      async (error, result) => {
        if (!error && result.event === "success") {
          const url = result.info.secure_url;
          setSaving(service.slug);
          try {
            const res = await fetch(`/api/admin/services/${service.slug}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ coverImage: url }),
            });
            if (res.ok) {
              setServices((prev) =>
                prev.map((s) => s.slug === service.slug ? { ...s, coverImage: url } : s)
              );
            }
          } finally {
            setSaving(null);
          }
        }
      }
    );
    widget.open();
  }, []);

  if (loading) {
    return (
      <main className="bg-cream px-4 pt-8 md:px-8">
        <p className="mt-16 font-ui text-sm text-gray-mid">Loading…</p>
      </main>
    );
  }

  return (
    <main className="bg-cream px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mt-8 text-4xl text-charcoal">Service Card Images</h1>
        <p className="mt-2 font-ui text-sm text-gray-mid">
          Upload a cover photo for each service. Images are cropped to 16:10 for visual consistency across cards.
        </p>

        {error && <p className="mt-4 font-ui text-sm text-red">{error}</p>}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.slug}
              className="overflow-hidden rounded-xl border border-gray-warm bg-white shadow-sm"
            >
              {/* Image preview */}
              <div className="relative h-48 w-full bg-cream">
                {service.coverImage ? (
                  <Image
                    src={service.coverImage}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">{service.title}</p>
                      <p className="mt-1 font-ui text-xs text-gray-400">No image set</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="p-4">
                <p className="font-ui text-sm font-semibold text-charcoal">{service.title}</p>
                {service.coverImage && (
                  <p className="mt-0.5 font-ui text-xs text-green-600">✓ Image set</p>
                )}
                <button
                  type="button"
                  onClick={() => openUploadWidget(service)}
                  disabled={saving === service.slug}
                  className="mt-3 w-full rounded-lg bg-navy px-4 py-2 font-ui text-sm text-white transition hover:bg-navy/90 disabled:opacity-50"
                >
                  {saving === service.slug ? "Saving…" : service.coverImage ? "Change Image" : "Upload Image"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && !error && (
          <p className="mt-12 font-ui text-sm text-gray-mid">
            No services found. Make sure services are seeded in the database.
          </p>
        )}
      </div>
    </main>
  );
}
