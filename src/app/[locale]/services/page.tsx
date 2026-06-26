import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Servicios } from "@/components/Servicios";
import {
  ServiciosIntro,
  ServiciosClosing,
  ServiciosCta,
} from "@/components/ServiciosHub";
import { pageMetadata } from "@/lib/page-metadata";
import { SERVICES_OVERVIEW_IMAGE } from "@/lib/service-images";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "servicios", "/services");
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "serviciosHub" });

  return (
    <>
      <SiteNav />
      <main>
        {/* 1 · Page hero — kicker / title / tagline from serviciosHub.hero, over
            the optional overview image. */}
        <PageHero
          pageKey="services"
          item={{
            kicker: t("hero.kicker"),
            title: t("hero.title"),
            tagline: t("hero.tagline"),
            ...(SERVICES_OVERVIEW_IMAGE
              ? { image: { heroSrc: SERVICES_OVERVIEW_IMAGE, heroAlt: "" } }
              : {}),
          }}
        />
        {/* 2 · Editorial intro, before the grid */}
        <ServiciosIntro />
        {/* 3 · "Áreas de trabajo" bordered grid (unchanged) */}
        <Servicios />
        {/* 4 · Editorial closing + one-line network link → /about */}
        <ServiciosClosing />
        {/* 5 · CTA band → /contacto */}
        <ServiciosCta />
      </main>
      <Footer />
    </>
  );
}
