import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Contacto } from "@/components/Contacto";
import { pageMetadata } from "@/lib/page-metadata";
import { sanityFetch } from "@/sanity/lib/live";
import { AGENTS_QUERY } from "@/sanity/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "contacto", "/contact");
}

export default async function ContactoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { data: agents } = await sanityFetch({
    query: AGENTS_QUERY,
    params: { locale },
  });

  return (
    <>
      <SiteNav />
      <main>
        <PageHero pageKey="contacto" />
        <Contacto agents={agents} />
      </main>
      <Footer />
    </>
  );
}
