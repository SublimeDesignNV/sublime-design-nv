import type { AreaDef } from "@/content/areas";

export default function AreaSchema({ area }: { area: AreaDef }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";
  const areaUrl = `${siteUrl}/areas/${area.slug}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Sublime Design NV — ${area.serviceAreaLabel}`,
    description: area.seoDescription,
    url: areaUrl,
    telephone: "702-847-9016",
    address: {
      "@type": "PostalAddress",
      addressLocality: area.name,
      addressRegion: "NV",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "City",
      name: area.name,
    },
  };

  if (area.coordinates) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: area.coordinates.lat,
      longitude: area.coordinates.lng,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
