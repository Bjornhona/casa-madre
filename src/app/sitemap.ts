import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { client } from "@/sanity/lib/client";
import { JOURNAL_SLUGS_QUERY } from "@/sanity/lib/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const CONTENT_PATHS = [
  "nosotras",
  "servicios",
  "barrios",
  "propiedades",
  "journal",
  "contacto",
];
const LEGAL_PATHS = ["legal", "privacidad", "cookies"];

// hreflang alternates for a path across every locale.
const altsFor = (path: string) =>
  Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${path ? `/${path}` : ""}`]),
  );

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Individual Journal articles (published only). Uses the plain client, not
  // sanityFetch, since sitemap() runs outside a request (no draftMode()).
  const journalSlugs = await client
    .withConfig({ perspective: "published", useCdn: false })
    .fetch(JOURNAL_SLUGS_QUERY);

  const journal: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    (journalSlugs ?? []).map(({ slug }) => ({
      url: `${SITE_URL}/${locale}/journal/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  const home: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: { languages: altsFor("") },
  }));

  const content: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    CONTENT_PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}/${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: { languages: altsFor(path) },
    })),
  );

  const legal: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    LEGAL_PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}/${path}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  );

  return [...home, ...content, ...journal, ...legal];
}
