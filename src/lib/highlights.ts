import type { Property } from "@/sanity/types.gen";

/**
 * Highlights ("Destacados") are free-text tags the editor writes by hand, so
 * they routinely repeat what the structured fields already say: a five-bedroom
 * house in Sarrià ends up tagged "5 dormitorios", "320 m²" and "Sarrià", each
 * of which is also a row in the datos table and a spec on the property page.
 * This filter removes that overlap wherever highlights render — the property
 * page and the PDF ficha both call it — so the fix is not per-surface.
 *
 * The trade-off is deliberately asymmetric. A tag that survives when it should
 * not is a duplicate on the page; a tag that is dropped when it should not be
 * destroys copy nobody can recover from the rendered output. So the rules below
 * only fire on a whole tag that says nothing but the structured value:
 *
 *   - "<number> <unit>" where the number equals the field and the unit belongs
 *     to it — "5 dormitorios", "320 m²", "4 bathrooms".
 *   - the neighbourhood name, or one half of a compound one, on its own.
 *   - a name for the property type, on its own, in either language.
 *
 * Anything with a word of its own attached keeps it: "5 dormitorios dobles",
 * "320 m² de jardín" and "Casa con jardín" all survive, because each says
 * something the structured field does not.
 *
 * The vocabularies cover both site languages regardless of the locale being
 * rendered: `highlights` is a single non-localized array in the schema, and the
 * editor may well have typed English tags into a ficha generated in Spanish.
 */

type PropertyType = NonNullable<Property["propertyType"]>;

/** The structured fields a highlight can restate. All optional: callers pass
 *  whatever their GROQ projection selected, and an absent field simply never
 *  matches. */
export type PropertyFacts = {
  bedrooms?: number | null;
  bathrooms?: number | null;
  surface?: number | null;
  surfaceUtil?: number | null;
  propertyType?: PropertyType | null;
  neighbourhood?: string | null;
};

/** Longest first, so "metros cuadrados" is matched before "metros" and the
 *  remainder check sees "" rather than a stray "cuadrados". */
const byLengthDesc = (words: readonly string[]) =>
  [...words].sort((a, b) => b.length - a.length);

const AREA_UNITS = byLengthDesc([
  "m2",
  "metros cuadrados",
  "metros",
  "sqm",
  "sq m",
]);

const BEDROOM_UNITS = byLengthDesc([
  "dormitorio",
  "dormitorios",
  "habitacion",
  "habitaciones",
  "hab",
  "bedroom",
  "bedrooms",
  "bed",
  "beds",
]);

const BATHROOM_UNITS = byLengthDesc([
  "bano",
  "banos",
  "bathroom",
  "bathrooms",
  "bath",
  "baths",
]);

/**
 * Words that may follow an area without making it a different measurement.
 * "320 m² construidos" is the built area under its own name; "320 m² de jardín"
 * is a garden that happens to be the same size, and must survive.
 */
const AREA_QUALIFIERS = new Set([
  "construido",
  "construida",
  "construidos",
  "construidas",
  "util",
  "utiles",
  "built",
  "usable",
  "area",
]);

/**
 * Every word that names a property type, per schema value and in both
 * languages — the ES and EN labels used by the ficha and the property page,
 * plus the everyday synonyms an editor is likely to type. Keyed off the schema
 * union, so adding a property type is a compile error here until it has a
 * vocabulary. Deliberately excludes near-synonyms that carry extra meaning
 * ("villa", "loft"): those are real information, not a restatement.
 */
const PROPERTY_TYPE_WORDS: Record<PropertyType, readonly string[]> = {
  piso: ["piso", "apartamento", "apartment", "flat"],
  atico: ["atico", "penthouse"],
  casa: ["casa", "chalet", "chale", "house"],
  duplex: ["duplex"],
  estudio: ["estudio", "studio"],
  local: ["local", "local comercial", "commercial", "commercial unit"],
};

/**
 * Case-, accent- and punctuation-insensitive form used for every comparison.
 * "²" is not a diacritic, so NFD leaves it alone and it is mapped explicitly —
 * without that, "320 m²" and "320 m2" would not compare equal.
 */
const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/²/g, "2")
    .replace(/\^2/g, "2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[.,;:!¡?¿'"«»·]+|[.,;:!¡?¿'"«»·]+$/g, "")
    .trim();

/**
 * Leading number and whatever follows it, or null when the text does not start
 * with one. Handles a thousands separator ("1.200 m²", "1,200 sqm") as well as
 * a decimal comma, which is how areas are written in Spanish.
 */
const splitLeadingNumber = (
  text: string,
): { value: number; rest: string } | null => {
  const match = /^(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(.*)$/.exec(text);
  if (!match) return null;

  const [, digits, rest] = match;
  const grouped = /^\d{1,3}(?:[.,]\d{3})+$/.test(digits);
  const value = Number(
    grouped ? digits.replace(/[.,]/g, "") : digits.replace(",", "."),
  );

  return Number.isFinite(value) ? { value, rest } : null;
};

/** What is left after the unit, or null when the text does not start with one
 *  of them. An empty string means the unit was the whole remainder. */
const stripUnit = (rest: string, units: readonly string[]): string | null => {
  for (const unit of units) {
    if (rest === unit) return "";
    if (rest.startsWith(`${unit} `)) return rest.slice(unit.length + 1);
  }
  return null;
};

const isQualifierOnly = (rest: string, qualifiers: Set<string>): boolean =>
  rest.split(" ").every((word) => qualifiers.has(word));

/** A tag of the form "<number> <unit>" whose number and unit both belong to the
 *  same structured field. */
const restatesMeasurement = (
  normalized: string,
  facts: PropertyFacts,
): boolean => {
  const parsed = splitLeadingNumber(normalized);
  if (!parsed) return false;

  const fields: Array<{
    value: number | null | undefined;
    units: readonly string[];
    qualifiers?: Set<string>;
  }> = [
    { value: facts.bedrooms, units: BEDROOM_UNITS },
    { value: facts.bathrooms, units: BATHROOM_UNITS },
    { value: facts.surface, units: AREA_UNITS, qualifiers: AREA_QUALIFIERS },
    { value: facts.surfaceUtil, units: AREA_UNITS, qualifiers: AREA_QUALIFIERS },
  ];

  return fields.some((field) => {
    if (field.value == null || field.value !== parsed.value) return false;
    const remainder = stripUnit(parsed.rest, field.units);
    if (remainder === null) return false;
    if (remainder === "") return true;
    return field.qualifiers ? isQualifierOnly(remainder, field.qualifiers) : false;
  });
};

/** A tag that is nothing but the neighbourhood name or the property type. */
const restatesName = (normalized: string, facts: PropertyFacts): boolean => {
  if (facts.propertyType) {
    const words = PROPERTY_TYPE_WORDS[facts.propertyType];
    if (words?.some((word) => normalize(word) === normalized)) return true;
  }

  if (facts.neighbourhood) {
    const name = normalize(facts.neighbourhood);
    if (name === normalized) return true;
    // Compound districts ("Sarrià-Sant Gervasi") are commonly tagged by half.
    return name
      .split(/[-–—/,]/)
      .map((part) => part.trim())
      .some((part) => part.length > 1 && part === normalized);
  }

  return false;
};

/**
 * `highlights` minus the tags that only restate `facts`, in the original order
 * and as the original strings. Blank tags are dropped too — they render as an
 * empty pill either way.
 */
export function dropRestatedHighlights(
  highlights: readonly string[] | null | undefined,
  facts: PropertyFacts,
): string[] {
  if (!highlights) return [];

  return highlights.filter((highlight) => {
    const normalized = normalize(highlight);
    if (normalized === "") return false;
    return (
      !restatesMeasurement(normalized, facts) && !restatesName(normalized, facts)
    );
  });
}
