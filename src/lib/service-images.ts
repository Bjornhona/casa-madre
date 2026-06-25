/**
 * Editorial imagery for the services pages. One image per service detail page
 * (keyed by English slug) plus one for the /servicios overview. Static — service
 * copy lives in the message catalogs, not Sanity.
 *
 * These are tasteful Unsplash placeholders for now. To use the real local files,
 * drop them in /public/servicios/ and swap each value to its local path — a
 * ONE-LINE change per entry, e.g.
 *   "buying-selling": "/servicios/buying-selling.jpg",
 *   SERVICES_OVERVIEW_IMAGE = "/servicios/overview.jpg"
 *
 * A missing entry (undefined) degrades gracefully: the detail hero falls back to
 * the plain dark band, and the overview banner renders nothing — never a broken
 * image.
 */

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;

// slug → image. Swap the right-hand side to "/servicios/<slug>.jpg" when ready.
export const SERVICE_IMAGES: Record<string, string> = {
  "buying-selling": UNSPLASH("1554995207-c18c203602cb"),
  rentals: UNSPLASH("1613977257363-707ba9348227"),
  "personal-shopper": UNSPLASH("1517248135467-4c7edcad34c4"),
  "renovation-home-staging": UNSPLASH("1583422409516-2895a77efded"),
  investment: UNSPLASH("1607706189992-eae578626c86"),
  "legal-financial": UNSPLASH("1539037116277-4db20889f2d4"),
};

// Overview page banner. Swap to "/servicios/overview.jpg" when ready.
export const SERVICES_OVERVIEW_IMAGE: string | undefined = UNSPLASH(
  "1486406146926-c627a92ad1ab",
);

/** Resolve a service's editorial image by slug; undefined when none is set. */
export const serviceImage = (slug: string): string | undefined =>
  SERVICE_IMAGES[slug];
