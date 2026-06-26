/**
 * Builds a locale-aware link to the dedicated contact page, carrying CTA context
 * as query params, e.g. `/es/contact?servicio=compraventa&interes=buy`.
 *
 * The contact form reads these via `useSearchParams()` to pre-fill the interest,
 * area and reference fields, so the params must live in the query string.
 */
export function contactoHref(
  locale: string,
  params: Record<string, string | null | undefined> = {},
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return `/${locale}/contact${qs ? `?${qs}` : ""}`;
}
