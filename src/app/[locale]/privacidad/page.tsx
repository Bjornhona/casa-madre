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
  return legalMetadata(locale, "privacidad", "/privacidad");
}

export default async function PrivacidadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPlaceholder locale={locale} />;
}
