// Casa Madre — company legal data.
// Single source of truth for legal/company details used across the legal
// pages, footer, and structured data. Update here; it flows everywhere.
// Fields marked PENDIENTE must be confirmed by the client / their gestoría.

import { formatAgentPhone } from "@/lib/format-phone";

/** Reads a required legal env var. Empty string rather than undefined,
 *  so consumers get a value they can render and validate. */
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

  // Registered address — PENDIENTE: confirmar
  address: {
    street: "",
    city: "Barcelona",
    postalCode: "",
    region: "Barcelona",
    country: "España",
  },

  // Contact (reuse env where the site already uses them)
  email: process.env.CLIENT_CONTACT_EMAIL,
  // Normalised through the shared helper: the env var may or may not carry a
  // leading "+", and may be unset entirely.
  phone: formatAgentPhone(process.env.CLIENT_CONTACT_PHONE),

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
    npiff: process.env.CLIENT_NPIFF
  }
} as const;

/** One-line postal address built from LEGAL_DATA (PENDIENTE parts stay visible). */
export const formatLegalAddress = (): string => {
  const a = LEGAL_DATA.address;
  // return `${a.street}, ${a.postalCode} ${a.city}, ${a.region}, ${a.country}`;
  return (a.street && a.street + ", ") + a.postalCode + " " + a.city + ", " + a.region + ", " + a.country;
};

/** Returns the names of any legal fields that are missing.
 *  Empty array means the data is complete enough to publish. */
export const assertLegalDataComplete = (): string[] => {
  const missing: string[] = [];
  if (!LEGAL_DATA.legalName) missing.push("legalName");
  if (!LEGAL_DATA.taxId) missing.push("taxId");
  if (!LEGAL_DATA.address.street) missing.push("address.street");
  if (!LEGAL_DATA.address.postalCode) missing.push("address.postalCode");
  if (!LEGAL_DATA.email) missing.push("email");
  return missing;
};