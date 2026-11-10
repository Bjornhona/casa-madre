import { JOURNAL_ENABLED } from "@/lib/features";

/**
 * The site's menu items, in display order. Labels/subtitles come from
 * `nav.items.<key>` in the next-intl catalogs; `href` is the locale-agnostic
 * path handed to next-intl's <Link>, which adds the locale prefix.
 *
 * This lives in lib rather than inside SiteNav so the e2e suite can assert
 * against the real list without importing a client component (and the motion /
 * lucide tree that comes with it). One source of truth, no drift.
 */
export const NAV_ROUTES = [
  { key: "nosotras", href: "/about" },
  { key: "propiedades", href: "/properties" },
  { key: "servicios", href: "/services" },
  { key: "barrios", href: "/neighbourhoods" },
  { key: "journal", href: "/journal" },
  { key: "contacto", href: "/contact" },
] as const;

export type NavRoute = (typeof NAV_ROUTES)[number];

/**
 * What the overlay actually renders. The overlay is the only menu — one list
 * serves mobile and desktop — so filtering here removes the Journal item at
 * every breakpoint while JOURNAL_ENABLED is false.
 */
export const MENU_ROUTES: readonly NavRoute[] = NAV_ROUTES.filter(
  ({ key }) => key !== "journal" || JOURNAL_ENABLED,
);
