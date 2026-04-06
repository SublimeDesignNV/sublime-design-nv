export default function LocalBusinessSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: "Sublime Design NV",
    url: siteUrl,
    telephone: "+17028479016",
    email: "info@sublimedesignnv.com",
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Check, Credit Card, Zelle",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "18:00",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Las Vegas",
      addressRegion: "NV",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.1699,
      longitude: -115.1398,
    },
    areaServed: [
      { "@type": "City", name: "Las Vegas" },
      { "@type": "City", name: "Henderson" },
      { "@type": "City", name: "Summerlin" },
      { "@type": "City", name: "Paradise" },
      { "@type": "City", name: "Spring Valley" },
      { "@type": "City", name: "Lake Las Vegas" },
      { "@type": "City", name: "Green Valley Ranch" },
      { "@type": "City", name: "Anthem" },
      { "@type": "City", name: "Red Rock" },
      { "@type": "City", name: "Centennial Hills" },
      { "@type": "City", name: "North Las Vegas" },
      { "@type": "City", name: "Rhodes Ranch" },
      { "@type": "City", name: "Seven Hills" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Custom Finish Carpentry Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Floating Shelves",
            url: `${siteUrl}/services/floating-shelves`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Built-Ins",
            url: `${siteUrl}/services/built-ins`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Pantry Pullouts",
            url: `${siteUrl}/services/pantry-pullouts`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Closet Systems",
            url: `${siteUrl}/services/closet-systems`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Cabinetry",
            url: `${siteUrl}/services/custom-cabinetry`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Mantels",
            url: `${siteUrl}/services/mantels`,
          },
        },
      ],
    },
    sameAs: [
      "https://www.instagram.com/sublimedesignnv",
      "https://www.facebook.com/sublimedesignnv",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
