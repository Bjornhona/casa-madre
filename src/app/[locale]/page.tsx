import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { AboutIntro } from "@/components/AboutIntro";
import { ServiciosMarquee } from "@/components/ServiciosMarquee";
import { AboutMethod } from "@/components/About";
import { Barrios } from "@/components/Barrios";
import { Propiedades } from "@/components/Propiedades";
import { JournalTeaser } from "@/components/JournalTeaser";
import { ContactoTeaser } from "@/components/ContactoTeaser";
import { Footer } from "@/components/Footer";
import { sanityFetch } from "@/sanity/lib/live";
import {
  HOME_NEIGHBOURHOODS_QUERY,
  PROPERTIES_QUERY,
  RECENT_JOURNAL_POSTS_QUERY,
} from "@/sanity/lib/queries";
import type { RECENT_JOURNAL_POSTS_QUERY_RESULT } from "@/sanity/types.gen";
import { JOURNAL_ENABLED } from "@/lib/features";

// Condensed narrative overview: each band teases a section and links to its
// dedicated page. Full versions live on /about, /services, /neighbourhoods,
// /properties and /contact.
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    { data: properties },
    { data: neighbourhoods },
    { data: journalPosts },
  ] = await Promise.all([
    sanityFetch({ query: PROPERTIES_QUERY, params: { locale } }),
    sanityFetch({ query: HOME_NEIGHBOURHOODS_QUERY, params: { locale } }),
    // Skip the query entirely while the Journal is hidden — no point paying for
    // posts the page won't render.
    JOURNAL_ENABLED
      ? sanityFetch({ query: RECENT_JOURNAL_POSTS_QUERY, params: { locale } })
      : { data: [] as RECENT_JOURNAL_POSTS_QUERY_RESULT },
  ]);

  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <AboutIntro />
        <Propiedades properties={properties} variant="home" />
        <AboutMethod />
        <ServiciosMarquee />
        <Barrios neighbourhoods={neighbourhoods} variant="home" />
        {JOURNAL_ENABLED && <JournalTeaser posts={journalPosts} />}
        <ContactoTeaser />
      </main>
      <Footer />
    </>
  );
}
