"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";

/**
 * Quiet, light 404 surface — mirrors the `LegalPlaceholder` treatment: ivory
 * background, centred layout, the serif Casa Madre wordmark and warm
 * brown/muted type. Copy comes from the `notFound` catalog.
 */
export function NotFoundView() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <Link
        href="/"
        className="font-serif text-[28px] uppercase tracking-[0.22em] text-brown transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        Casa Madre
      </Link>

      <div className="flex flex-col items-center gap-5">
        <Kicker>{t("kicker")}</Kicker>
        <SerifHeading
          as="h1"
          className="max-w-[18ch] text-[34px] leading-[1.08] text-brown sm:text-[44px]"
        >
          {t("title")}
        </SerifHeading>
        <p className="max-w-[32rem] text-[16px] leading-[1.6] text-muted">
          {t("intro")}
        </p>
      </div>

      <Link
        href="/"
        className="inline-block border border-brown px-7 py-3.5 text-[11px] uppercase tracking-[0.16em] text-brown transition-colors duration-500 ease-out hover:bg-brown hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        {t("cta")}
      </Link>
    </main>
  );
}
