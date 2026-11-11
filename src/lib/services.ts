import {
  KeyRound,
  House,
  Search,
  Armchair,
  TrendingUp,
  Scale,
  Plane,
  ConciergeBell,
  type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for the services. Shared by the /services hub, the
 * detail pages, the contact form's reference lookup and the sitemap so the set
 * never drifts. Add one here and everything downstream follows — but check
 * `.services-grid` in globals.css, whose column counts are tuned to how many
 * entries there are.
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
  // Arriving and settling in Barcelona. The housing search is the spine of it,
  // so `rent` rather than letting the form fall back to its `buy` default.
  { key: "relocation", slug: "relocation", index: 6, interes: "rent", icon: Plane },
  // Household services rather than a transaction — no `interes`, same as
  // reformas and juridico.
  { key: "concierge", slug: "concierge", index: 7, icon: ConciergeBell },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

/**
 * Column count for the "Áreas de trabajo" grid, derived from how many services
 * there are so the layout follows the array instead of a hardcoded CSS value.
 *
 * Prefers the widest column count that divides the set evenly, so the final row
 * is never left with an orphan cell — 8 → 4, 6 → 3, 9 → 3. `candidates` is
 * ordered widest-first and stops at 2 because a cell narrower than roughly a
 * quarter of the container can't hold the longer service titles. A prime count
 * has no clean answer; it falls back to the widest option and accepts the gap.
 */
export function gridColumns(count: number, candidates = [4, 3, 2]): number {
  return candidates.find((c) => count % c === 0) ?? candidates[0];
}

/** Desktop columns, and the mid-breakpoint fallback (2 wherever it divides). */
export const SERVICE_GRID_COLUMNS = gridColumns(SERVICES.length);
export const SERVICE_GRID_COLUMNS_MD = gridColumns(SERVICES.length, [2, 3]);

export const getServiceBySlug = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);
