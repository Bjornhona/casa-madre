import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPlaceholder } from "@/components/LegalPlaceholder";
import { legalMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return legalMetadata(locale, "cookies", "/cookies");
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPlaceholder locale={locale} />;
}
