// Casa Madre — company legal data.
// Single source of truth for legal/company details used across the legal
// pages, footer, and structured data. Update here; it flows everywhere.
// Fields marked PENDIENTE must be confirmed by the client / their gestoría.

export const LEGAL_DATA = {
  // Trading / brand name shown to users
  brandName: "Casa Madre",

  // Registered legal name (razón social) — PENDIENTE: confirmar
  legalName: "[PENDIENTE: razón social / nombre fiscal]",

  // NIF / CIF — PENDIENTE: confirmar
  taxId: "[PENDIENTE: NIF/CIF]",

  // Registered address — PENDIENTE: confirmar
  address: {
    street: "[PENDIENTE: dirección]",
    city: "Barcelona",
    postalCode: "[PENDIENTE: CP]",
    region: "Barcelona",
    country: "España",
  },

  // Contact (reuse env where the site already uses them)
  email: "[PENDIENTE: hola@casamadre…]",
  phone: "[PENDIENTE: teléfono]",

  // Mercantile registry data, if applicable — PENDIENTE (may not apply if autónoma)
  registry: "[PENDIENTE: datos registrales si aplica]",

  // Domain (no protocol)
  domain: "casamadre.es", // PENDIENTE: confirmar dominio final

  // Date these texts were last reviewed — update on each legal change
  lastUpdated: "2026-06-25",
} as const;

/** True for unfilled fields (e.g. "[PENDIENTE: NIF/CIF]"). */
export const isPending = (value: string): boolean =>
  value.startsWith("[PENDIENTE");

/** One-line postal address built from LEGAL_DATA (PENDIENTE parts stay visible). */
export const formatLegalAddress = (): string => {
  const a = LEGAL_DATA.address;
  return `${a.street}, ${a.postalCode} ${a.city}, ${a.region}, ${a.country}`;
};
