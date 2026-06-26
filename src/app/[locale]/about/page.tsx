import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import {
  AboutManifesto,
  AboutFounders,
  AboutMethod,
  AboutNetwork,
  AboutCta,
} from "@/components/About";
import { Testimonios } from "@/components/Testimonios";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "about", "/about");
}

export default async function AboutPage({
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
        {/* 1 · Manifesto / origin — hero (kicker + title + opening line). */}
        <PageHero pageKey="about" />
        <AboutManifesto />
        {/* 2 · Founders */}
        <AboutFounders />
        {/* 3 · The Método */}
        <AboutMethod />
        {/* 4 · Our network */}
        <AboutNetwork />
        {/* 5 · Testimonios (from Sanity; renders nothing if none published) */}
        <Testimonios />
        {/* 6 · CTA */}
        <AboutCta />
      </main>
      <Footer />
    </>
  );
}
