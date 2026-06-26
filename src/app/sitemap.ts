import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { client } from "@/sanity/lib/client";
import {
  JOURNAL_SLUGS_QUERY,
  NEIGHBOURHOOD_SLUGS_QUERY,
  PROPERTY_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { SERVICE_SLUGS } from "@/lib/services";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const CONTENT_PATHS = [
  "about",
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

  // Dynamic slugs (published only). Uses the plain client, not sanityFetch,
  // since sitemap() runs outside a request (no draftMode()).
  const publishedClient = client.withConfig({
    perspective: "published",
    useCdn: false,
  });
  const [journalSlugs, propertySlugs, neighbourhoodSlugs] = await Promise.all([
    publishedClient.fetch(JOURNAL_SLUGS_QUERY),
    publishedClient.fetch(PROPERTY_SLUGS_QUERY),
    publishedClient.fetch(NEIGHBOURHOOD_SLUGS_QUERY),
  ]);

  const journal: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    (journalSlugs ?? []).map(({ slug }) => ({
      url: `${SITE_URL}/${locale}/journal/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages: altsFor(`journal/${slug}`) },
    })),
  );

  const properties: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    (propertySlugs ?? []).map(({ slug }) => ({
      url: `${SITE_URL}/${locale}/propiedades/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: { languages: altsFor(`propiedades/${slug}`) },
    })),
  );

  const neighbourhoods: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    (neighbourhoodSlugs ?? []).map(({ slug }) => ({
      url: `${SITE_URL}/${locale}/barrios/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages: altsFor(`barrios/${slug}`) },
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

  const services: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    SERVICE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/${locale}/servicios/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages: altsFor(`servicios/${slug}`) },
    })),
  );

  const legal: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    LEGAL_PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}/${path}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
      alternates: { languages: altsFor(path) },
    })),
  );

  return [
    ...home,
    ...content,
    ...journal,
    ...properties,
    ...services,
    ...neighbourhoods,
    ...legal,
  ];
}
