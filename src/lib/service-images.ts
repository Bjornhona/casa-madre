/**
 * Editorial imagery for the services pages. One image per service detail page
 * (keyed by English slug) plus one for the /services overview. Static — service
 * copy lives in the message catalogs, not Sanity.
 *
 * A missing entry (undefined) degrades gracefully: the detail hero falls back to
 * the plain dark band, and the overview banner renders nothing — never a broken
 * image.
 */

// slug → image. Swap the right-hand side to "/services/<slug>.jpg" when ready.
export const SERVICE_IMAGES: Record<string, string> = {
  "buying-selling": '/services/buying-selling.webp',
  rentals: '/services/rentals.webp',
  "personal-shopper": '/services/personal-shopper.webp',
  "renovation-home-staging": '/services/renovation-home-staging.webp',
  investment: '/services/investment.webp',
  "legal-financial": '/services/legal-financial.webp',
  relocation: '/services/relocation.webp',
  concierge: '/services/concierge.webp',
};

// Overview page banner. Swap to "/services/overview.jpg" when ready.
export const SERVICES_OVERVIEW_IMAGE: string | undefined = '/services/overview1.webp';

/** Resolve a service's editorial image by slug; undefined when none is set. */
export const serviceImage = (slug: string): string | undefined =>
  SERVICE_IMAGES[slug];
