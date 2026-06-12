import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const CONTENT_PATHS = [
  "nosotras",
  "servicios",
  "barrios",
  "propiedades",
  "contacto",
];
const LEGAL_PATHS = ["legal", "privacidad", "cookies"];

// hreflang alternates for a path across every locale.
const altsFor = (path: string) =>
  Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${path ? `/${path}` : ""}`]),
  );

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

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

  return [...home, ...content, ...legal];
}
