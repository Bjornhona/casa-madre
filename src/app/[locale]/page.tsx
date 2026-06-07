import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { AboutIntro } from "@/components/AboutIntro";

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
      </main>
    </>
  );
}
