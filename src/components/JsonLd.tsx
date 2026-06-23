/**
 * RealEstateAgent + LocalBusiness structured data.
 * Server component (no client JS) — renders a JSON-LD script tag.
 */
export function JsonLd({ description }: { description: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;

  const data = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    name: "Casa Madre",
    description,
    url: siteUrl,
    areaServed: "Barcelona",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Barcelona",
      addressCountry: "ES",
    },
    email,
    telephone: whatsapp ? `+${whatsapp}` : undefined,
    priceRange: "€€€",
    openingHoursSpecification: [],
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      // Brand-controlled data, no user input — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * BreadcrumbList structured data for nested routes (journal posts, properties).
 * Pass absolute URLs; render nothing if any are missing (no SITE_URL configured).
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  if (items.length === 0 || items.some((i) => !i.url)) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
