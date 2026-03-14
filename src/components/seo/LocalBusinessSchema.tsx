export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: "Sublime Design NV",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com",
    telephone: "702-847-9016",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Las Vegas",
      addressRegion: "NV",
      addressCountry: "US",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Las Vegas",
      },
      {
        "@type": "City",
        name: "Henderson",
      },
      {
        "@type": "City",
        name: "Summerlin",
      },
      {
        "@type": "AdministrativeArea",
        name: "Las Vegas Valley",
      },
    ],
    serviceArea: {
      "@type": "AdministrativeArea",
      name: "Las Vegas Valley",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
