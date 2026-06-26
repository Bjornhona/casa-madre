import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Barrios } from "@/components/Barrios";
import { pageMetadata } from "@/lib/page-metadata";
import { sanityFetch } from "@/sanity/lib/live";
import { NEIGHBOURHOODS_QUERY } from "@/sanity/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "barrios", "/neighbourhoods");
}

export default async function BarriosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { data: neighbourhoods } = await sanityFetch({
    query: NEIGHBOURHOODS_QUERY,
    params: { locale },
  });

  return (
    <>
      <SiteNav />
      <main>
        <PageHero pageKey="barrios" />
        <Barrios neighbourhoods={neighbourhoods} variant="page" />
      </main>
      <Footer />
    </>
  );
}
