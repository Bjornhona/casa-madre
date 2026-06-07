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

export default async function Home({
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
        <Hero />
        <AboutIntro />
        <Nosotras />
        <Servicios />
        <Metodo />
        <Barrios />
        <Propiedades />
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
