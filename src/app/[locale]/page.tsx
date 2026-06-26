import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { AboutIntro } from "@/components/AboutIntro";
import { ServiciosMarquee } from "@/components/ServiciosMarquee";
import { MetodoTeaser } from "@/components/MetodoTeaser";
import { Testimonios } from "@/components/Testimonios";
import { Barrios } from "@/components/Barrios";
import { Propiedades } from "@/components/Propiedades";
import { JournalTeaser } from "@/components/JournalTeaser";
import { ContactoTeaser } from "@/components/ContactoTeaser";
import { Footer } from "@/components/Footer";
import { sanityFetch } from "@/sanity/lib/live";
import {
  NEIGHBOURHOODS_QUERY,
  PROPERTIES_QUERY,
  RECENT_JOURNAL_POSTS_QUERY,
} from "@/sanity/lib/queries";

// Condensed narrative overview: each band teases a section and links to its
// dedicated page. Full versions live on /about, /services, /barrios,
// /propiedades and /contacto.
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [{ data: properties }, { data: neighbourhoods }, { data: journalPosts }] =
    await Promise.all([
      sanityFetch({ query: PROPERTIES_QUERY, params: { locale } }),
      sanityFetch({ query: NEIGHBOURHOODS_QUERY, params: { locale } }),
      sanityFetch({ query: RECENT_JOURNAL_POSTS_QUERY, params: { locale } }),
    ]);

  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <AboutIntro />
        <ServiciosMarquee />
        <MetodoTeaser />
        <Testimonios max={3} />
        <Propiedades properties={properties} variant="home" />
        <Barrios neighbourhoods={neighbourhoods} variant="home" />
        <JournalTeaser posts={journalPosts} />
        <ContactoTeaser />
      </main>
      <Footer />
    </>
  );
}
