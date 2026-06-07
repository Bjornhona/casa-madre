"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const LOCALES = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
] as const;

/** ES / EN switch wired to the next-intl locale-aware router. */
export function LocaleSwitch() {
  const active = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
      {LOCALES.map((locale, index) => (
        <span key={locale.code} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="opacity-40">
              /
            </span>
          )}
          <Link
            href={pathname}
            locale={locale.code}
            aria-current={active === locale.code ? "true" : undefined}
            className={
              active === locale.code
                ? "opacity-100"
                : "opacity-55 transition-opacity duration-300 hover:opacity-100"
            }
          >
            {locale.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
