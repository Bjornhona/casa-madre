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
import { dropRestatedHighlights } from "@/lib/highlights";
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
  /** Top margin for the text pages. This belongs on the Page, not on an inner
   *  View: when content wraps onto a further page, only Page padding is
   *  reapplied, so an inner padding would leave continuation pages starting
   *  ~22pt from the paper edge. */
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
  /** Same block with no separator, for when nothing precedes it on the page. */
  contactAlone: {},

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
 * Print widths, in pixels. Deliberately not full resolution: a ficha is emailed
 * and sent over WhatsApp, so total file size matters more than pixel-peeping.
 *
 * The hero spans the full 595pt page (~8.3in) and the thumbnails ~244pt each,
 * so these land around 145 DPI and 290 DPI respectively — past what matters on
 * screen, and comfortable in print.
 */
const HERO_WIDTH = 1200;
const THUMB_WIDTH = 700;

/**
 * Sanity CDN URL for a gallery image, or null when the item has no asset.
 *
 * `format("jpg")` is the load-bearing part, not a preference. @react-pdf
 * decodes only JPEG and PNG, and Sanity's `auto=format` serves WebP to any
 * browser that advertises support — which every modern browser does. That would
 * render fine nowhere and fail in every environment equally, but the failure is
 * silent (a missing image, not an exception), so it is the kind of bug that
 * reaches a client's inbox. Pinning the format removes the negotiation
 * entirely: the CDN returns JPEG regardless of who asks.
 *
 * `quality` trades a few KB against artefacts on photographic content; 80/72 is
 * conservative for the hero and unnoticeable at thumbnail scale.
 */
const imageSrc = (
  image: GalleryImage | undefined,
  width: number,
  quality: number,
): string | null => {
  if (!image?.asset) return null;
  return urlFor(image).width(width).format("jpg").quality(quality).url();
};

/** A datos row renders only if it has a real value. `0` is a real value — a
 *  studio with 0 bedrooms must print, so this tests for null/undefined/"" and
 *  never for truthiness. */
const hasValue = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== "";

function FichaFooter({
  copy,
  registration,
  propertyTitle,
  recipientName,
  preparedOn,
}: {
  copy: (typeof FICHA_COPY)[FichaLocale];
  registration: FichaRegistration;
  propertyTitle: string | null;
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
      {/* Which property, then for whom — the two identification facts together,
          and never a bare label when the title is missing. */}
      {propertyTitle && (
        <Text style={styles.footerText}>
          {copy.propertyReference({ title: propertyTitle })}
        </Text>
      )}
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

  // A–G print as stored; only the prose states are translated. It reads as a
  // datos row like any other certificate — the badge it used to have on page 1
  // gave a legally required disclosure the weight of a selling point.
  const energyStates: Record<string, string> = copy.energyStates;
  const energyRating = property.energyRating;
  const energyLabel =
    energyRating === null
      ? null
      : (energyStates[energyRating] ?? energyRating);

  const gallery = property.gallery ?? [];
  const heroSrc = imageSrc(gallery[0], HERO_WIDTH, 80);
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
    { label: copy.labels.calificacionEnergetica, value: energyLabel },
  ].filter((row) => hasValue(row.value));

  // Tags that only repeat a row of the table above them are noise on a page
  // whose whole job is to be scanned; the shared filter keeps that judgement
  // identical here and on the website.
  const highlights = dropRestatedHighlights(property.highlights, {
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    surface: property.surface,
    surfaceUtil: property.surfaceUtil,
    propertyType: property.propertyType,
    neighbourhood: property.neighbourhood?.name,
  });

  const footer = (
    <FichaFooter
      copy={copy}
      registration={registration}
      propertyTitle={property.title}
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

        {/* Without a hero the identity block would otherwise start 26pt from
            the paper edge, tighter than any other page. */}
        <View style={[styles.padded, { paddingTop: heroSrc ? 26 : 56 }]}>
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

          <View style={{ marginTop: 16 }}>
            <Text style={styles.kicker}>
              {copy.labels.precio[property.operation]}
            </Text>
            <Text style={[styles.price, { marginTop: 4 }]}>{price}</Text>
          </View>
        </View>

        {footer}
      </Page>

      {/* Page 2 — description, datos, highlights */}
      <Page
        size="A4"
        orientation="portrait"
        style={[styles.page, styles.pageTop]}
      >
        <View style={styles.padded}>
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

          {highlights.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <View style={styles.tags}>
                {highlights.map((highlight) => (
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
      <Page
        size="A4"
        orientation="portrait"
        style={[styles.page, styles.pageTop]}
      >
        <View style={styles.padded}>
          {rest.length > 0 && (
            <View>
              <Text style={styles.heading}>{copy.sections.galeria}</Text>
              <View style={[styles.grid, { marginTop: 12 }]}>
                {rest.map((image) => {
                  const src = imageSrc(image, THUMB_WIDTH, 72);
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

          {/* One shared channel on purpose: no individual agent details.
              The rule above it separates it from the grid, so with a
              single-image gallery (no grid) it would be an orphan hairline
              across the top of an otherwise empty page. */}
          <View
            style={
              rest.length > 0
                ? [styles.contact, { marginTop: 30 }]
                : styles.contactAlone
            }
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
