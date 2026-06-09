/**
 * Builds a locale-aware link to the contact section that carries CTA context as
 * query params, e.g. `/es?servicio=compraventa&interes=buy#contacto`.
 *
 * The params go BEFORE the `#contacto` hash on purpose: `useSearchParams()`
 * reads the URL query string, not the fragment, so params placed after the hash
 * would be invisible to the form. The hash still scrolls to the contact section.
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
  return `/${locale}${qs ? `?${qs}` : ""}#contacto`;
}
