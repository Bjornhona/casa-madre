// Casa Madre — company legal data.
// Single source of truth for legal/company details used across the legal
// pages, footer, and structured data. Update here; it flows everywhere.
// Fields marked PENDIENTE must be confirmed by the client / their gestoría.

// Every env var here is NEXT_PUBLIC_*: the Sanity Studio runs in the browser,
// where server-only vars are undefined, and the ficha is generated there. These
// are published disclosures on /legal anyway, so there is nothing to leak.
// NEXT_PUBLIC_* is inlined at build time — restart `next dev` after a change.

import { formatAgentPhone } from "@/lib/format-phone";

/** Reads a required legal env var. Empty string rather than undefined, so
 *  consumers get a value they can render and validate — no `string | undefined`
 *  leaking into pages (that mismatch broke the /legal build once already). */
const requireEnv = (value: string | undefined): string => value ?? "";

export const LEGAL_DATA = {
  // Trading / brand name shown to users
  brandName: "Casa Madre",

  // Registered legal name (razón social) — PENDIENTE: confirmar
  // legalName: process.env.NEXT_PUBLIC_CLIENT_LEGAL_NAME,
  legalName: requireEnv(process.env.NEXT_PUBLIC_CLIENT_LEGAL_NAME),

  // NIF
  // taxId: process.env.NEXT_PUBLIC_CLIENT_TAX_ID,
  taxId: requireEnv(process.env.NEXT_PUBLIC_CLIENT_TAX_ID),

  // Registered address. Street and postcode come from env like the rest of the
  // client's data; city/region/country are fixed for this firm. Unset means
  // empty, which formatLegalAddress() drops from the line and
  // assertLegalDataComplete() reports — and that gate is what blocks ficha
  // generation, so a ficha can never carry a half-written legal address.
  address: {
    street: requireEnv(process.env.NEXT_PUBLIC_CLIENT_ADDRESS_STREET),
    city: "Barcelona",
    postalCode: requireEnv(process.env.NEXT_PUBLIC_CLIENT_ADDRESS_POSTAL_CODE),
    region: "Barcelona",
    country: "España",
  },

  // Contact (reuse env where the site already uses them)
  email: requireEnv(process.env.NEXT_PUBLIC_CLIENT_CONTACT_EMAIL),
  // Normalised through the shared helper: the env var may or may not carry a
  // leading "+", and may be unset entirely.
  phone: formatAgentPhone(requireEnv(process.env.NEXT_PUBLIC_CLIENT_CONTACT_PHONE)),

  // Mercantile registry data, if applicable — PENDIENTE (may not apply if autónoma)
  registry: "",

  // Domain (no protocol)
  domain: "casamadreliving.com",

  // Date these texts were last reviewed — update on each legal change
  lastUpdated: "2026-07-19",

  // AICAT is deliberately absent: both agents hold their own individual
  // registration and there is no company-level one, so the numbers live on the
  // `agent` documents in Sanity and are rendered from there.
  credentials: {
    npiff: requireEnv(process.env.NEXT_PUBLIC_CLIENT_NPIFF)
  }
} as const;

/** One-line postal address built from LEGAL_DATA. Empty segments drop out
 *  entirely, so an unset street or postcode shortens the line instead of
 *  leaving ", ," or a stray leading space behind. */
export const formatLegalAddress = (): string => {
  const a = LEGAL_DATA.address;
  // Postcode and city form one segment ("08001 Barcelona"), so a missing
  // postcode must not leave the city orphaned behind a space.
  const locality = [a.postalCode, a.city].filter(Boolean).join(" ");
  return [a.street, locality, a.region, a.country].filter(Boolean).join(", ");
};

/**
 * Completeness of the legal identification block, in two tiers.
 *
 * ⚠️ The split is a temporary commercial decision, not a legal finding. The
 * client does not have their domicilio fiscal confirmed yet and asked to keep
 * issuing fichas in the meantime, so the address warns instead of blocking.
 * It is NOT optional: LSSI Art. 10 requires the provider's registered domicile
 * in commercial communications, and a ficha is one. As soon as the address
 * arrives, move `address.street` and `address.postalCode` back into
 * missingRequiredLegalData() and delete this note.
 *
 * Everything here reports the same dotted field names either tier, so callers
 * can print them without knowing which tier they came from.
 */

/** Missing fields that must block ficha generation: without them the document
 *  cannot identify who issued it at all. Empty array means clear to generate. */
export const missingRequiredLegalData = (): string[] => {
  const missing: string[] = [];
  if (!LEGAL_DATA.legalName) missing.push("legalName");
  if (!LEGAL_DATA.taxId) missing.push("taxId");
  if (!LEGAL_DATA.email) missing.push("email");
  if (!LEGAL_DATA.phone) missing.push("phone");
  return missing;
};

/** Missing fields that warn but do not block — see the tier note above. */
export const missingRecommendedLegalData = (): string[] => {
  const missing: string[] = [];
  if (!LEGAL_DATA.address.street) missing.push("address.street");
  if (!LEGAL_DATA.address.postalCode) missing.push("address.postalCode");
  return missing;
};

/** Every missing field, both tiers. For pages that just want to know whether
 *  the legal data is complete, with no view on what blocks what. */
export const assertLegalDataComplete = (): string[] => [
  ...missingRequiredLegalData(),
  ...missingRecommendedLegalData(),
];