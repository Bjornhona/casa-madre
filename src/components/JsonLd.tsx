import { LEGAL_DATA } from "@/lib/legal-data";

/**
 * RealEstateAgent + LocalBusiness structured data.
 * Server component (no client JS) — renders a JSON-LD script tag.
 *
 * Company details come from LEGAL_DATA (single source of truth). Unfilled
 * "[PENDIENTE…]" fields are omitted rather than leaked into structured data;
 * email/phone fall back to the public env values when LEGAL_DATA is still pending.
 */
export function JsonLd({ description }: { description: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const addr = LEGAL_DATA.address;

  const email = LEGAL_DATA.email
    ? LEGAL_DATA.email
    : process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const telephone = LEGAL_DATA.phone
    ? LEGAL_DATA.phone
    : whatsapp
      ? `+${whatsapp}`
      : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    name: LEGAL_DATA.brandName,
    ...(LEGAL_DATA.legalName ? { legalName: LEGAL_DATA.legalName } : {}),
    ...(LEGAL_DATA.taxId ? { taxID: LEGAL_DATA.taxId } : {}),
    description,
    url: siteUrl,
    areaServed: "Barcelona",
    address: {
      "@type": "PostalAddress",
      ...(addr.street ? { streetAddress: addr.street } : {}),
      ...(addr.postalCode ? { postalCode: addr.postalCode } : {}),
      addressLocality: addr.city,
      addressRegion: addr.region,
      addressCountry: "ES",
    },
    email,
    telephone,
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
