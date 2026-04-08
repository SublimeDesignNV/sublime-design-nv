import { getBusinessSettings } from "@/lib/settings";

export default async function LocalBusinessSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";
  const biz = await getBusinessSettings();

  const phone = biz.phone ? `+1${biz.phone.replace(/\D/g, "")}` : "+17028479016";
  const email = biz.email || "info@sublimedesignnv.com";
  const city = biz.city ?? "Las Vegas";
  const state = biz.state ?? "NV";

  const sameAs = biz.showSocialLinks
    ? [
        biz.instagramHandle
          ? `https://www.instagram.com/${biz.instagramHandle.replace(/^@/, "")}`
          : "https://www.instagram.com/sublimedesignnv",
        biz.facebookUrl ?? "https://www.facebook.com/sublimedesignnv",
      ].filter(Boolean)
    : [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: biz.companyName,
    url: biz.website ?? siteUrl,
    ...(biz.showPhone && { telephone: phone }),
    ...(biz.showEmail && { email }),
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Check, Credit Card, Zelle",
    ...(biz.showHours && {
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "07:00",
          closes: "18:00",
        },
      ],
    }),
    ...(biz.showAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: biz.address ?? undefined,
        addressLocality: city,
        postalCode: biz.zip ?? undefined,
        addressRegion: state,
        addressCountry: "US",
      },
    }),
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
          itemOffered: { "@type": "Service", name: "Floating Shelves", url: `${siteUrl}/services/floating-shelves` },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Built-Ins", url: `${siteUrl}/services/built-ins` },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Pantry Pullouts", url: `${siteUrl}/services/pantry-pullouts` },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Closet Systems", url: `${siteUrl}/services/closet-systems` },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Custom Cabinetry", url: `${siteUrl}/services/custom-cabinetry` },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Mantels", url: `${siteUrl}/services/mantels` },
        },
      ],
    },
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
