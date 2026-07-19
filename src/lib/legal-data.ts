// Casa Madre — company legal data.
// Single source of truth for legal/company details used across the legal
// pages, footer, and structured data. Update here; it flows everywhere.
// Fields marked PENDIENTE must be confirmed by the client / their gestoría.

export const LEGAL_DATA = {
  // Trading / brand name shown to users
  brandName: "Casa Madre",

  // Registered legal name (razón social) — PENDIENTE: confirmar
  legalName: "Evelyn Ribera",

  // NIF
  taxId: "38110222G",

  // Registered address — PENDIENTE: confirmar
  address: {
    street: "",
    city: "Barcelona",
    postalCode: "",
    region: "Barcelona",
    country: "España",
  },

  // Contact (reuse env where the site already uses them)
  email: "info@casamadreliving.com",
  phone: "+34619317312",

  // Mercantile registry data, if applicable — PENDIENTE (may not apply if autónoma)
  registry: "",

  // Domain (no protocol)
  domain: "casamadreliving.es",

  // Date these texts were last reviewed — update on each legal change
  lastUpdated: "2026-07-19",

  credentials: {
    aicat: "14044",
    npiff: "2213"
  }
} as const;

/** True for unfilled fields (e.g. "[PENDIENTE: NIF/CIF]"). */
export const isPending = (value: string): boolean =>
  value.startsWith("[PENDIENTE");

/** One-line postal address built from LEGAL_DATA (PENDIENTE parts stay visible). */
export const formatLegalAddress = (): string => {
  const a = LEGAL_DATA.address;
  // return `${a.street}, ${a.postalCode} ${a.city}, ${a.region}, ${a.country}`;
  return (a.street && a.street + ", ") + a.postalCode + " " + a.city + ", " + a.region + ", " + a.country;
};
