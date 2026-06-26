import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { ServiceDetailView } from "@/components/ServiceDetailView";
import { SERVICES, getServiceBySlug } from "@/lib/services";
import { routing } from "@/i18n/routing";

type Params = { locale: string; slug: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const OG_LOCALE: Record<string, string> = { es: "es_ES", en: "en_GB" };

type ServiceItem = { title: string; tagline: string };

// The six services are a fixed set — pre-render each in both locales.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICES.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  const t = await getTranslations({ locale, namespace: "servicios" });
  const item = (t.raw("items") as ServiceItem[])[service.index];
  const title = item.title;
  const description = item.tagline;
  const url = `/${locale}/services/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        es: `/es/services/${slug}`,
        en: `/en/services/${slug}`,
        "x-default": `/es/services/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Casa Madre",
      title: `${title} — Casa Madre`,
      description,
      url,
      locale: OG_LOCALE[locale] ?? "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Casa Madre`,
      description,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "servicios" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const item = (t.raw("items") as ServiceItem[])[service.index];

  // Service structured data. Brand-controlled fields only — safe to inline.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: item.title,
    ...(item.tagline ? { description: item.tagline } : {}),
    serviceType: item.title,
    areaServed: "Barcelona",
    provider: {
      "@type": "RealEstateAgent",
      name: "Casa Madre",
      ...(SITE_URL ? { url: `${SITE_URL}/${locale}` } : {}),
    },
    ...(SITE_URL ? { url: `${SITE_URL}/${locale}/services/${slug}` } : {}),
  };

  const breadcrumbs = SITE_URL
    ? [
        { name: "Casa Madre", url: `${SITE_URL}/${locale}` },
        { name: tNav("items.servicios.label"), url: `${SITE_URL}/${locale}/services` },
        { name: item.title, url: `${SITE_URL}/${locale}/services/${slug}` },
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
        <ServiceDetailView slug={slug} />
      </main>
      <Footer />
    </>
  );
}
