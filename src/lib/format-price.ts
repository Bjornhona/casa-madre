// Property price formatting — shared by the listing cards, the property detail
// page and the PDF ficha, so the same figure never appears two ways.
//
// `useGrouping: "always"` is the load-bearing option. Spanish defaults to
// "min2", which drops the separator on four-digit numbers: a 7.000 €/mes rental
// printed as "7000 €" directly above a "1.850.000 €" sale, in the same column of
// the same grid. Property listings group thousands regardless of the RAE prose
// rule, and the inconsistency reads as a bug. English is unaffected — en-GB
// groups from four digits either way — so this is a no-op there rather than a
// locale-specific branch.
//
// `maximumFractionDigits: 0` because cents are noise at these amounts.

const PRICE_FORMAT: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  useGrouping: "always",
};

/**
 * A formatter, not a formatted string: the cards build one per locale and reuse
 * it across the grid, where constructing an Intl.NumberFormat per property is
 * the expensive part. Callers formatting a single price can just chain
 * `.format(…)`.
 *
 * `locale` accepts either form in use here — next-intl's "es"/"en" from the
 * components, or the ficha's "es-ES"/"en-GB" — since both resolve to the same
 * grouping and currency placement.
 */
export const priceFormatter = (locale: string): Intl.NumberFormat =>
  new Intl.NumberFormat(locale, PRICE_FORMAT);
