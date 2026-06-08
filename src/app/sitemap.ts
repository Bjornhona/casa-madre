import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const LEGAL_PATHS = ["legal", "privacidad", "cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}`]),
  );

  const home: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: { languages },
  }));

  const legal: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    LEGAL_PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}/${path}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  );

  return [...home, ...legal];
}
