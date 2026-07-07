import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/ComingSoon";

// Holding-page toggle. When off, this route is unreachable (visitors are sent
// home); the redirect/rewrite when on is handled in `src/proxy.ts`.
const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "comingSoon" });

  return {
    // Holding page — keep it out of the index.
    title: { absolute: "Casa Madre" },
    description: t("subtitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ComingSoonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!COMING_SOON) redirect(`/${locale}`);

  return <ComingSoon />;
}
