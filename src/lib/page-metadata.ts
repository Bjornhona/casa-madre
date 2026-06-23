import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// BCP-47 / OpenGraph locale mapping (mirrors the root layout).
const OG_LOCALE: Record<string, string> = { es: "es_ES", en: "en_GB" };

/**
 * Localized metadata for a content sub-page. Title + description come from the
 * `pages.<key>` catalog; the title runs through the layout's `%s — Casa Madre`
 * template. Emits canonical + hreflang alternates for the route in both locales.
 */
export async function pageMetadata(
  locale: string,
  key: string,
  path: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `pages.${key}` });
  const title = t("kicker");
  const description = t("intro");
  const url = `/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        es: `/es${path}`,
        en: `/en${path}`,
        "x-default": `/es${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Casa Madre",
      title: `${title} — Casa Madre`,
      description,
      url,
      locale: OG_LOCALE[locale] ?? "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Casa Madre`,
      description,
    },
  };
}

// Route segment → key under `footer.legal`.
const LEGAL_LABEL: Record<string, string> = {
  legal: "notice",
  privacidad: "privacy",
  cookies: "cookies",
};

/**
 * Localized metadata for the legal placeholder routes. Title comes from the
 * `footer.legal.*` labels; description reuses the brand tagline. Emits canonical
 * + hreflang alternates so these routes match the rest of the site.
 */
export async function legalMetadata(
  locale: string,
  segment: keyof typeof LEGAL_LABEL,
  path: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "footer" });
  const title = t(`legal.${LEGAL_LABEL[segment]}`);
  const description = t("tagline");
  const url = `/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        es: `/es${path}`,
        en: `/en${path}`,
        "x-default": `/es${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Casa Madre",
      title: `${title} — Casa Madre`,
      description,
      url,
      locale: OG_LOCALE[locale] ?? "es_ES",
    },
  };
}
