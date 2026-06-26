import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Contacto } from "@/components/Contacto";
import { pageMetadata } from "@/lib/page-metadata";

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

  return (
    <>
      <SiteNav />
      <main>
        <PageHero pageKey="contacto" />
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
