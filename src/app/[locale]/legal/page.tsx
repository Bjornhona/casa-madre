import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPlaceholder } from "@/components/LegalPlaceholder";

export const metadata: Metadata = {
  title: "Aviso Legal / Legal Notice",
};

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPlaceholder locale={locale} />;
}
