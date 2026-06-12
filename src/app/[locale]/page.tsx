import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { AboutIntro } from "@/components/AboutIntro";
import { Servicios } from "@/components/Servicios";
import { MetodoTeaser } from "@/components/MetodoTeaser";
import { Barrios } from "@/components/Barrios";
import { Propiedades } from "@/components/Propiedades";
import { ContactoTeaser } from "@/components/ContactoTeaser";
import { Footer } from "@/components/Footer";
import { sanityFetch } from "@/sanity/lib/live";
import { NEIGHBOURHOODS_QUERY, PROPERTIES_QUERY } from "@/sanity/lib/queries";

// Condensed narrative overview: each band teases a section and links to its
// dedicated page. Full versions live on /nosotras, /servicios, /barrios,
// /propiedades and /contacto.
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [{ data: properties }, { data: neighbourhoods }] = await Promise.all([
    sanityFetch({ query: PROPERTIES_QUERY, params: { locale } }),
    sanityFetch({ query: NEIGHBOURHOODS_QUERY, params: { locale } }),
  ]);

  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <AboutIntro />
        <Servicios variant="home" />
        <MetodoTeaser />
        <Propiedades properties={properties} variant="home" />
        <Barrios neighbourhoods={neighbourhoods} variant="home" />
        <ContactoTeaser />
      </main>
      <Footer />
    </>
  );
}
