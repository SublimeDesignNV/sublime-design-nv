import type { ServiceDef } from "@/content/services";

export default function ServiceSchema({ service }: { service: ServiceDef }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";
  const serviceUrl = `${siteUrl}/services/${service.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seoDescription,
    url: serviceUrl,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: "Sublime Design NV",
      url: siteUrl,
      telephone: "702-847-9016",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Las Vegas",
        addressRegion: "NV",
        addressCountry: "US",
      },
    },
    areaServed: {
      "@type": "State",
      name: "Nevada",
    },
    serviceType: service.shortTitle,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
