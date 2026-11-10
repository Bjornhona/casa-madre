import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { JournalIndex } from "@/components/JournalIndex";
import { pageMetadata } from "@/lib/page-metadata";
import { sanityFetch } from "@/sanity/lib/live";
import { JOURNAL_POSTS_QUERY } from "@/sanity/lib/queries";
import { JOURNAL_ENABLED } from "@/lib/features";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Hidden route: no title, no canonical, no hreflang pair to index.
  if (!JOURNAL_ENABLED) return {};
  return pageMetadata(locale, "journal", "/journal");
}

export default async function JournalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!JOURNAL_ENABLED) notFound();

  const { data: posts } = await sanityFetch({
    query: JOURNAL_POSTS_QUERY,
    params: { locale },
  });

  return (
    <>
      <SiteNav />
      <main>
        <PageHero pageKey="journal" />
        <JournalIndex posts={posts} />
      </main>
      <Footer />
    </>
  );
}
