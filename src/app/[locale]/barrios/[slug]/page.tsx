import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { NeighbourhoodView } from "@/components/NeighbourhoodView";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import {
  NEIGHBOURHOOD_BY_SLUG_QUERY,
  NEIGHBOURHOOD_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { routing } from "@/i18n/routing";

type Params = { locale: string; slug: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// Pre-render every neighbourhood in both locales. `generateStaticParams` runs
// without a request, so we use the plain client (not `sanityFetch`, which reads
// `draftMode()` and is only valid during request rendering).
export async function generateStaticParams() {
  const data = await client
    .withConfig({ perspective: "published", useCdn: false })
    .fetch(NEIGHBOURHOOD_SLUGS_QUERY);
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
  const { data: barrio } = await sanityFetch({
    query: NEIGHBOURHOOD_BY_SLUG_QUERY,
    params: { slug, locale },
    stega: false,
  });

  if (!barrio) return {};

  const raw = barrio.intro || barrio.blurb || undefined;
  const description = raw
    ? raw.length > 160
      ? `${raw.slice(0, 157).trimEnd()}…`
      : raw
    : undefined;

  const ogImage = barrio.heroImage?.asset
    ? urlFor(barrio.heroImage).width(1200).height(630).fit("crop").url()
    : barrio.image?.asset
      ? urlFor(barrio.image).width(1200).height(630).fit("crop").url()
      : undefined;

  const fullTitle = `${barrio.name} — Casa Madre`;
  const url = `/${locale}/barrios/${slug}`;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
      languages: {
        es: `/es/barrios/${slug}`,
        en: `/en/barrios/${slug}`,
        "x-default": `/es/barrios/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      url,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export default async function NeighbourhoodPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const { data: barrio } = await sanityFetch({
    query: NEIGHBOURHOOD_BY_SLUG_QUERY,
    params: { slug, locale },
  });

  if (!barrio) notFound();

  const tNav = await getTranslations({ locale, namespace: "nav" });

  const image = barrio.heroImage?.asset
    ? urlFor(barrio.heroImage).width(1200).height(630).fit("crop").url()
    : barrio.image?.asset
      ? urlFor(barrio.image).width(1200).height(630).fit("crop").url()
      : undefined;

  // Place structured data for the neighbourhood. Brand-controlled — safe to inline.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: barrio.name,
    ...(barrio.intro || barrio.blurb
      ? { description: barrio.intro || barrio.blurb }
      : {}),
    ...(image ? { image: [image] } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Barcelona",
      addressCountry: "ES",
    },
    ...(SITE_URL ? { url: `${SITE_URL}/${locale}/barrios/${slug}` } : {}),
  };

  const breadcrumbs = SITE_URL
    ? [
        { name: "Casa Madre", url: `${SITE_URL}/${locale}` },
        { name: tNav("items.barrios.label"), url: `${SITE_URL}/${locale}/barrios` },
        { name: barrio.name, url: `${SITE_URL}/${locale}/barrios/${slug}` },
      ]
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteNav />
      <main>
        <NeighbourhoodView barrio={barrio} />
      </main>
      <Footer />
    </>
  );
}
