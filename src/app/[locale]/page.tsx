import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { AboutIntro } from "@/components/AboutIntro";
import { Nosotras } from "@/components/Nosotras";
import { Servicios } from "@/components/Servicios";
import { Metodo } from "@/components/Metodo";
import { Barrios } from "@/components/Barrios";
import { Propiedades } from "@/components/Propiedades";
import { Contacto } from "@/components/Contacto";
import { Footer } from "@/components/Footer";
import { sanityFetch } from "@/sanity/lib/live";
import { NEIGHBOURHOODS_QUERY, PROPERTIES_QUERY } from "@/sanity/lib/queries";

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
        <Nosotras />
        <Servicios />
        <Metodo />
        <Barrios neighbourhoods={neighbourhoods} />
        <Propiedades properties={properties} />
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
