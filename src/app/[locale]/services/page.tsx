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
        <PageHero
          pageKey="servicios"
          item={{
            kicker: t("hero.kicker"),
            title: t("hero.title"),
            tagline: t.raw("hero.tagline") as string[],
            ...(SERVICES_OVERVIEW_IMAGE
              ? { image: { heroSrc: SERVICES_OVERVIEW_IMAGE, heroAlt: "" } }
              : {}),
          }}
        />
        <ServiciosIntro />
        <Servicios />
        <ServiciosClosing />
        <ServiciosCta />
      </main>
      <Footer />
    </>
  );
}
