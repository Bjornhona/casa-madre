/**
 * Emptiness rules for catalog copy.
 *
 * The client fills sections in over time, so a section's catalog value may be
 * present but blank — `""`, `"   "`, `[]`, `[""]`, `["  ", ""]` all mean "not
 * written yet". Keys stay in the catalogs either way (next-intl needs them,
 * and a key in one locale but not the other is its own bug class), so the
 * decision to render has to be made from the *value*, not from the key.
 *
 * Truthiness is not enough: `"   "` and `[""]` are both truthy. Everything
 * here measures trimmed length instead.
 */

/** A catalog value that may be one paragraph, several, or nothing yet. */
export type CatalogText = string | readonly string[] | null | undefined;

/**
 * The entries actually worth rendering, in order — blanks dropped.
 *
 * A single string becomes a one-entry list, so callers can treat one-paragraph
 * and many-paragraph copy identically. Surviving entries are returned as
 * authored (not trimmed): the filter decides what renders, it doesn't rewrite
 * the copy.
 */
export function filled(value: CatalogText): string[] {
  if (value == null) return [];
  const entries = typeof value === "string" ? [value] : value;
  return entries.filter((entry) => entry?.trim().length > 0);
}

/**
 * True when there is nothing to render — so the caller can drop the heading
 * and the wrapper too, not just the body.
 */
export function isEmpty(value: CatalogText): boolean {
  return filled(value).length === 0;
}

/** Space, em-dash, space — how catalog list copy marks off a leading label. */
const LABEL_SEPARATOR = " — ";

/**
 * Split a list entry written as "Label — items, items, items".
 *
 * Long bullets are hard to scan as one run of prose, so the label is pulled
 * out and emphasised by the renderer. Entries without the separator come back
 * whole and render unchanged — this is presentation applied to existing copy,
 * not a new field.
 *
 * Only the first separator splits, so an em-dash inside the body survives. A
 * degenerate entry (nothing either side of the dash) is left alone rather than
 * producing an empty label or an empty body.
 */
export function splitLabel(entry: string): { label?: string; rest: string } {
  const at = entry.indexOf(LABEL_SEPARATOR);
  if (at === -1) return { rest: entry };

  const label = entry.slice(0, at).trim();
  const rest = entry.slice(at + LABEL_SEPARATOR.length).trim();
  if (!label || !rest) return { rest: entry };

  return { label, rest };
}
