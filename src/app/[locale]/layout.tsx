import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/JsonLd";
import { SanityLive } from "@/sanity/lib/live";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// BCP-47 / OpenGraph locale mapping.
const OG_LOCALE: Record<string, string> = { es: "es_ES", en: "en_GB" };

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const description = t("subtext");
  const otherLocale = locale === "es" ? "en" : "es";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `Casa Madre — ${t("descriptor")}`,
      template: "%s — Casa Madre",
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
        "x-default": "/es",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Casa Madre",
      title: `Casa Madre — ${t("descriptor")}`,
      description,
      url: `/${locale}`,
      locale: OG_LOCALE[locale] ?? "es_ES",
      alternateLocale: OG_LOCALE[otherLocale],
    },
    twitter: {
      card: "summary_large_image",
      title: `Casa Madre — ${t("descriptor")}`,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "hero" });

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <NextIntlClientProvider>
        <head>
          <link rel="icon" href="/icon" />
          <JsonLd description={t("subtext")} />
        </head>
        <SanityLive />
        <body className="min-h-full flex flex-col">{children}</body>
      </NextIntlClientProvider>
    </html>
  );
}
