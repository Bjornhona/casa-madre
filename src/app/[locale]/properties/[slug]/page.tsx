import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PropertyView } from "@/components/PropertyView";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import {
  PROPERTY_BY_SLUG_QUERY,
  PROPERTY_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { fallbackImagesFor } from "@/lib/property-fallback-images";
import { routing } from "@/i18n/routing";

type Params = { locale: string; slug: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// Pre-render every public property in both locales. `generateStaticParams` runs
// without a request, so we use the plain client (not `sanityFetch`, which reads
// `draftMode()` and is only valid during request rendering).
export async function generateStaticParams() {
  const data = await client
    .withConfig({ perspective: "published", useCdn: false })
    .fetch(PROPERTY_SLUGS_QUERY);
  return routing.locales.flatMap((locale) =>
    (data ?? []).map(({ slug }) => ({ slug, locale })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { data: property } = await sanityFetch({
    query: PROPERTY_BY_SLUG_QUERY,
    params: { slug, locale },
    stega: false,
  });

  if (!property) return {};

  const description = property.description
    ? property.description.length > 160
      ? `${property.description.slice(0, 157).trimEnd()}…`
      : property.description
    : undefined;

  const ogImage = property.gallery?.[0]?.asset
    ? urlFor(property.gallery[0]).width(1200).height(630).fit("crop").url()
    : fallbackImagesFor(slug)[0];

  const fullTitle = `${property.title} — Casa Madre`;
  const url = `/${locale}/properties/${slug}`;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
      languages: {
        es: `/es/properties/${slug}`,
        en: `/en/properties/${slug}`,
        "x-default": `/es/properties/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      url,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const { data: property } = await sanityFetch({
    query: PROPERTY_BY_SLUG_QUERY,
    params: { slug, locale },
  });

  if (!property) notFound();

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const breadcrumbs =
    SITE_URL && property.title
      ? [
          { name: "Casa Madre", url: `${SITE_URL}/${locale}` },
          {
            name: tNav("items.propiedades.label"),
            url: `${SITE_URL}/${locale}/properties`,
          },
          {
            name: property.title,
            url: `${SITE_URL}/${locale}/properties/${slug}`,
          },
        ]
      : [];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteNav />
      <main>
        <PropertyView property={property} />
      </main>
      <Footer />
    </>
  );
}
