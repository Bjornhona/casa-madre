// Casa Madre — company legal data.
// Single source of truth for legal/company details used across the legal
// pages, footer, and structured data. Update here; it flows everywhere.
// Fields marked PENDIENTE must be confirmed by the client / their gestoría.

export const LEGAL_DATA = {
  // Trading / brand name shown to users
  brandName: "Casa Madre",

  // Registered legal name (razón social) — PENDIENTE: confirmar
  legalName: process.env.CLIENT_LEGAL_NAME,

  // NIF
  taxId: process.env.CLIENT_TAX_ID,

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
  phone: "+" + process.env.CLIENT_CONTACT_PHONE,

  // Mercantile registry data, if applicable — PENDIENTE (may not apply if autónoma)
  registry: "",

  // Domain (no protocol)
  domain: "casamadreliving.com",

  // Date these texts were last reviewed — update on each legal change
  lastUpdated: "2026-07-19",

  credentials: {
    aicat: process.env.CLIENT_AICAT,
    npiff: process.env.CLIENT_NPIFF
  }
} as const;

/** One-line postal address built from LEGAL_DATA (PENDIENTE parts stay visible). */
export const formatLegalAddress = (): string => {
  const a = LEGAL_DATA.address;
  // return `${a.street}, ${a.postalCode} ${a.city}, ${a.region}, ${a.country}`;
  return (a.street && a.street + ", ") + a.postalCode + " " + a.city + ", " + a.region + ", " + a.country;
};
