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
