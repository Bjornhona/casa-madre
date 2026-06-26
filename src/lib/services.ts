import {
  KeyRound,
  House,
  Search,
  Armchair,
  TrendingUp,
  Scale,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for the six services. Shared by the /services hub,
 * the detail pages and the sitemap so the set never drifts.
 *
 * - `key` is the Spanish identifier used for the contact pre-fill `servicio`
 *   param and the in-page anchor (matches the contact form's lookup) — DO NOT
 *   change it to the slug, or the pre-fill pill breaks.
 * - `slug` is the English URL segment for /[locale]/services/[slug].
 * - `index` aligns with the `servicios.items` message array.
 * - `interes` pre-selects the contact form's interest dropdown.
 */
export type Service = {
  key: string;
  slug: string;
  index: number;
  interes?: "buy" | "sell" | "rent" | "invest";
  icon: LucideIcon;
};

export const SERVICES: Service[] = [
  { key: "compraventa", slug: "buying-selling", index: 0, interes: "buy", icon: KeyRound },
  { key: "alquileres", slug: "rentals", index: 1, interes: "rent", icon: House },
  { key: "personal-shopper", slug: "personal-shopper", index: 2, interes: "buy", icon: Search },
  { key: "reformas", slug: "renovation-home-staging", index: 3, icon: Armchair },
  { key: "inversion", slug: "investment", index: 4, interes: "invest", icon: TrendingUp },
  { key: "juridico", slug: "legal-financial", index: 5, icon: Scale },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

export const getServiceBySlug = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);
