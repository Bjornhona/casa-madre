"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/components/LocaleSwitch";

const LEGAL_LINKS = [
  { href: "/legal", key: "notice" },
  { href: "/privacidad", key: "privacy" },
  { href: "/cookies", key: "cookies" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-cream border-t border-line px-6 py-14 text-muted sm:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <p className="font-serif text-[20px] tracking-[-0.02em] text-brown">
            {t("tagline")}
          </p>

          <nav
            aria-label={t("legal.notice")}
            className="flex flex-wrap gap-x-8 gap-y-3 text-[12px] uppercase tracking-[0.14em]"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
              >
                {t(`legal.${link.key}`)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-6 border-t border-line pt-8 text-[12px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 tracking-[0.02em]">
            <p>© {year} Casa Madre. {t("rights")}</p>
            <p>
              {t.rich("credit", {
                link: (chunks) => (
                  <a
                    href="https://asaeriksson.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
          <LocaleSwitch />
        </div>
      </div>
    </footer>
  );
}
