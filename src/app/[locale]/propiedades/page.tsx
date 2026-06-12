import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Propiedades } from "@/components/Propiedades";
import { pageMetadata } from "@/lib/page-metadata";
import { sanityFetch } from "@/sanity/lib/live";
import { PROPERTIES_QUERY } from "@/sanity/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "propiedades", "/propiedades");
}

export default async function PropiedadesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { data: properties } = await sanityFetch({
    query: PROPERTIES_QUERY,
    params: { locale },
  });

  return (
    <>
      <SiteNav />
      <main>
        <PageHero pageKey="propiedades" />
        <Propiedades properties={properties} variant="page" />
      </main>
      <Footer />
    </>
  );
}
