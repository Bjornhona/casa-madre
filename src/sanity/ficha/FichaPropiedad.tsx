"use client";

/* eslint-disable jsx-a11y/alt-text --
   <Image> here is @react-pdf/renderer's PDF primitive, not an HTML <img>. It
   has no `alt` prop, so the rule cannot be satisfied; passing one is a type
   error. PDF accessibility is a separate concern from the DOM rule. */

// Must be imported before anything renders: registration is a module-scope
// side effect, never a call inside a component.
import "./fonts";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { LEGAL_DATA, formatLegalAddress } from "@/lib/legal-data";
import { urlFor } from "@/sanity/lib/image";
import type { FICHA_QUERY_RESULT } from "@/sanity/types.gen";
import { FICHA_COPY, type FichaLocale } from "./copy";

/**
 * Property ficha — A4 portrait, three pages, rendered in the browser inside
 * Sanity Studio.
 *
 * Every static string comes from FICHA_COPY, and every enumerated value
 * (operation, property type) goes through its label map — a raw schema value
 * like "atico" must never reach the page. Localized fields arrive already
 * resolved to plain strings by FICHA_QUERY, so there is no
 * internationalizedArray handling here.
 */

type FichaProperty = NonNullable<FICHA_QUERY_RESULT["property"]>;
type FichaRegistration = FICHA_QUERY_RESULT["registration"];
type GalleryImage = NonNullable<FichaProperty["gallery"]>[number];

export type FichaPropiedadProps = {
  property: FichaProperty;
  registration: FichaRegistration;
  locale: FichaLocale;
  recipientName: string;
};

/** Mirrored from the @theme tokens in globals.css — @react-pdf has no access to
 *  Tailwind. Same approach as the ImageResponse palette in lib/og-font.ts. */
const COLOR = {
  cream: "#FBF6EF",
  bone: "#F2E8DD",
  sand: "#D7C1A8",
  clay: "#915C39",
  brown: "#6B3E21",
  deep: "#2B211B",
  muted: "#6E5C4F",
  line: "#E2D6C8",
} as const;

const PAGE_X = 46;
/** Reserves room for the fixed footer, which is out of flow. */
const FOOTER_RESERVE = 118;
/** Visual separator only — punctuation, not translatable copy. */
const SEP = "  ·  ";

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.cream,
    color: COLOR.deep,
    fontFamily: "Inter",
    fontSize: 9,
    lineHeight: 1.6,
    paddingBottom: FOOTER_RESERVE,
  },
  padded: { paddingHorizontal: PAGE_X },
  pageTop: { paddingTop: 44 },

  hero: { width: "100%", height: 292, objectFit: "cover" },

  kicker: {
    fontSize: 7.5,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: COLOR.clay,
  },
  title: {
    fontFamily: "Cormorant Garamond",
    fontWeight: 600,
    fontSize: 30,
    lineHeight: 1.12,
    color: COLOR.brown,
  },
  heading: {
    fontFamily: "Cormorant Garamond",
    fontWeight: 600,
    fontSize: 18,
    color: COLOR.brown,
  },
  price: {
    fontFamily: "Cormorant Garamond",
    fontWeight: 600,
    fontSize: 22,
    color: COLOR.deep,
  },

  rule: { borderBottomWidth: 0.6, borderBottomColor: COLOR.line },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  energyBadge: {
    borderWidth: 0.6,
    borderColor: COLOR.sand,
    backgroundColor: COLOR.bone,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  energyLabel: {
    fontSize: 6.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLOR.muted,
  },
  energyValue: { fontSize: 11, fontWeight: 600, color: COLOR.brown },

  body: { fontSize: 9.5, lineHeight: 1.75, color: COLOR.muted },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.6,
    borderBottomColor: COLOR.line,
  },
  rowLabel: { color: COLOR.muted },
  rowValue: { fontWeight: 500, color: COLOR.deep },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    borderWidth: 0.6,
    borderColor: COLOR.sand,
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 8,
    color: COLOR.brown,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: { width: "48.5%" },
  gridImage: { width: "100%", height: 128, objectFit: "cover" },

  contact: {
    borderTopWidth: 0.6,
    borderTopColor: COLOR.line,
    paddingTop: 14,
  },

  footer: {
    position: "absolute",
    left: PAGE_X,
    right: PAGE_X,
    bottom: 30,
    borderTopWidth: 0.6,
    borderTopColor: COLOR.line,
    paddingTop: 10,
  },
  footerText: { fontSize: 6.6, lineHeight: 1.5, color: COLOR.muted },
});

/**
 * Sanity CDN URL for a gallery image, or null when the item has no asset.
 *
 * Format is pinned to jpg on purpose: @react-pdf/renderer decodes only JPEG and
 * PNG, so `auto=format` (which serves WebP to modern browsers) would produce
 * images the renderer cannot read.
 *
 * TODO(next session): these are cdn.sanity.io URLs fetched by the browser from
 * the Studio origin, which may fail CORS. Out of scope here — the fix belongs
 * with the document action.
 */
const imageSrc = (image: GalleryImage | undefined): string | null => {
  if (!image?.asset) return null;
  return urlFor(image).width(1400).format("jpg").quality(82).url();
};

/** A datos row renders only if it has a real value. `0` is a real value — a
 *  studio with 0 bedrooms must print, so this tests for null/undefined/"" and
 *  never for truthiness. */
const hasValue = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== "";

function FichaFooter({
  copy,
  registration,
  recipientName,
  preparedOn,
}: {
  copy: (typeof FICHA_COPY)[FichaLocale];
  registration: FichaRegistration;
  recipientName: string;
  preparedOn: string;
}) {
  // Only when we have both halves of the line — never a bare label. The
  // document action gates generation on this separately; here it just omits.
  const aicat =
    registration && registration.aicat
      ? copy.aicatLine({
          agentName: registration.name,
          aicat: registration.aicat,
        })
      : null;

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {LEGAL_DATA.legalName}
        {SEP}
        {formatLegalAddress()}
      </Text>
      {aicat && <Text style={styles.footerText}>{aicat}</Text>}
      <Text style={styles.footerText}>{copy.disclaimer}</Text>
      <Text style={styles.footerText}>
        {copy.confidentiality({ recipient: recipientName, date: preparedOn })}
      </Text>
    </View>
  );
}

export function FichaPropiedad({
  property,
  registration,
  locale,
  recipientName,
}: FichaPropiedadProps) {
  const copy = FICHA_COPY[locale];

  const preparedOn = new Intl.DateTimeFormat(copy.dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // ocultarPrecio is the caller's business — the ficha prints the real figure.
  // Grouping is forced: es-ES drops the separator on four-digit numbers, which
  // reads as an inconsistency next to a six-figure sale price, and property
  // listings group them regardless of the RAE prose rule.
  const price = new Intl.NumberFormat(copy.dateLocale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    useGrouping: "always",
  }).format(property.price);

  // A–G print as stored; only the prose states are translated.
  const energyStates: Record<string, string> = copy.energyStates;
  const energyRating = property.energyRating;
  const energyLabel =
    energyRating === null
      ? null
      : (energyStates[energyRating] ?? energyRating);

  const gallery = property.gallery ?? [];
  const heroSrc = imageSrc(gallery[0]);
  // gallery[0] is the hero on page 1; the grid shows everything after it.
  const rest = gallery.slice(1);

  const datos = [
    { label: copy.labels.superficieConstruida, value: property.surface },
    { label: copy.labels.superficieUtil, value: property.surfaceUtil },
    { label: copy.labels.dormitorios, value: property.bedrooms },
    { label: copy.labels.banos, value: property.bathrooms },
    { label: copy.labels.tipo, value: copy.propertyTypes[property.propertyType] },
    { label: copy.labels.barrio, value: property.neighbourhood?.name },
    {
      label: copy.labels.referenciaCatastral,
      value: property.referenciaCatastral,
    },
    {
      label: copy.labels.cedulaHabitabilidad,
      value: property.cedulaHabitabilidad,
    },
  ].filter((row) => hasValue(row.value));

  const footer = (
    <FichaFooter
      copy={copy}
      registration={registration}
      recipientName={recipientName}
      preparedOn={preparedOn}
    />
  );

  return (
    <Document
      title={property.title ?? undefined}
      author={LEGAL_DATA.brandName}
      language={locale}
    >
      {/* Page 1 — hero, identity, price */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        {heroSrc && <Image src={heroSrc} style={styles.hero} />}

        <View style={[styles.padded, { paddingTop: 26 }]}>
          <Text style={styles.kicker}>
            {property.neighbourhood?.name}
            {SEP}
            {copy.operations[property.operation]}
          </Text>

          {property.title && (
            <Text style={[styles.title, { marginTop: 8 }]}>
              {property.title}
            </Text>
          )}

          <View style={[styles.rule, { marginTop: 20 }]} />

          <View style={[styles.priceRow, { marginTop: 16 }]}>
            <View>
              <Text style={styles.kicker}>{copy.labels.precio}</Text>
              <Text style={[styles.price, { marginTop: 4 }]}>{price}</Text>
            </View>

            {energyLabel && (
              <View style={styles.energyBadge}>
                <Text style={styles.energyLabel}>
                  {copy.labels.calificacionEnergetica}
                </Text>
                <Text style={styles.energyValue}>{energyLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {footer}
      </Page>

      {/* Page 2 — description, datos, highlights */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={[styles.padded, styles.pageTop]}>
          {property.description && (
            <View>
              <Text style={styles.heading}>{copy.sections.descripcion}</Text>
              <Text style={[styles.body, { marginTop: 10 }]}>
                {property.description}
              </Text>
            </View>
          )}

          {datos.length > 0 && (
            <View style={{ marginTop: property.description ? 28 : 0 }}>
              <Text style={styles.heading}>{copy.sections.datos}</Text>
              <View style={{ marginTop: 8 }}>
                {datos.map((row) => (
                  <View key={row.label} style={styles.row}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={styles.rowValue}>{String(row.value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {property.highlights && property.highlights.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <View style={styles.tags}>
                {property.highlights.map((highlight) => (
                  <Text key={highlight} style={styles.tag}>
                    {highlight}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {footer}
      </Page>

      {/* Page 3 — gallery and the shared contact channel */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={[styles.padded, styles.pageTop]}>
          {rest.length > 0 && (
            <View>
              <Text style={styles.heading}>{copy.sections.galeria}</Text>
              <View style={[styles.grid, { marginTop: 12 }]}>
                {rest.map((image) => {
                  const src = imageSrc(image);
                  if (!src) return null;
                  return (
                    <View key={image._key} style={styles.gridItem}>
                      <Image src={src} style={styles.gridImage} />
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* One shared channel on purpose: no individual agent details. */}
          <View
            style={[styles.contact, { marginTop: rest.length > 0 ? 30 : 0 }]}
          >
            <Text style={styles.heading}>{copy.sections.contacto}</Text>
            <Text style={[styles.rowValue, { marginTop: 10, fontSize: 11 }]}>
              {LEGAL_DATA.brandName}
            </Text>
            {LEGAL_DATA.phone !== "" && (
              <Text style={[styles.body, { marginTop: 2 }]}>
                {LEGAL_DATA.phone}
              </Text>
            )}
            {LEGAL_DATA.email !== "" && (
              <Text style={styles.body}>{LEGAL_DATA.email}</Text>
            )}
          </View>
        </View>

        {footer}
      </Page>
    </Document>
  );
}
