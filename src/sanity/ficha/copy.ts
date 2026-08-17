import type { Property } from "@/sanity/types.gen";

/**
 * Static copy for the property ficha (PDF).
 *
 * Deliberately not in the next-intl catalogs: the ficha is rendered from the
 * Studio, outside the request scope where `useTranslations`/`getTranslations`
 * are available. Keeping it here also means the ficha's legal wording is
 * reviewed as one block rather than scattered through a 600-line catalog.
 *
 * ES is the approved wording; EN is a natural adaptation, not a literal
 * translation.
 */

export type FichaLocale = "es" | "en";

/** `Intl` locale used to format dates and numbers in each language. */
type IntlLocale = {
  es: "es-ES";
  en: "en-GB";
};

/** Energy ratings that are a bare letter: the same in every language. */
type EnergyLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/**
 * The energy ratings that are prose rather than a letter, derived from the
 * schema by subtracting the letters. Adding an option to `energyRating` in
 * `property.ts` widens this union and breaks `energyStates` below until both
 * languages have a label — the same guarantee `propertyTypes` gives.
 */
export type EnergyState = Exclude<
  NonNullable<Property["energyRating"]>,
  EnergyLetter
>;

/**
 * Every string the ficha needs, all required. The operation and property-type
 * dictionaries are keyed off the generated schema types, so adding a value in
 * `property.ts` (a new property type, say) fails the build here until both
 * languages have a label for it.
 */
type FichaCopy<L extends FichaLocale> = {
  dateLocale: IntlLocale[L];

  /** Section headings, in ficha order. */
  sections: {
    descripcion: string;
    datos: string;
    galeria: string;
    contacto: string;
  };

  /** Row labels in the "datos" table. Area units live in the label, as they do
   *  in the Studio field titles, so values stay bare numbers. */
  labels: {
    precio: string;
    barrio: string;
    tipo: string;
    superficieConstruida: string;
    superficieUtil: string;
    dormitorios: string;
    banos: string;
    referenciaCatastral: string;
    cedulaHabitabilidad: string;
    calificacionEnergetica: string;
  };

  operations: Record<Property["operation"], string>;
  propertyTypes: Record<Property["propertyType"], string>;

  /** Only the non-letter ratings need translating; A–G print as stored. */
  energyStates: Record<EnergyState, string>;

  /** Registration line in the footer. Required in property advertising in
   *  Catalunya, hence its own template rather than free text. */
  aicatLine: (params: { agentName: string; aicat: string }) => string;

  /** Non-contractual notice. */
  disclaimer: string;

  /** Confidentiality footer, addressed to the recipient. `date` is
   *  pre-formatted by the caller using `dateLocale`. */
  confidentiality: (params: { recipient: string; date: string }) => string;
};

/**
 * Mapped over the locale union, so adding a language to `FichaLocale` is a
 * compile error here until every string in `FichaCopy` is translated.
 */
export const FICHA_COPY: { [L in FichaLocale]: FichaCopy<L> } = {
  es: {
    dateLocale: "es-ES",

    sections: {
      descripcion: "Descripción",
      datos: "Datos",
      galeria: "Galería",
      contacto: "Contacto",
    },

    labels: {
      precio: "Precio",
      barrio: "Barrio",
      tipo: "Tipo",
      superficieConstruida: "Superficie construida (m²)",
      superficieUtil: "Superficie útil (m²)",
      dormitorios: "Dormitorios",
      banos: "Baños",
      referenciaCatastral: "Referencia catastral",
      cedulaHabitabilidad: "Cédula de habitabilidad",
      calificacionEnergetica: "Calificación energética",
    },

    operations: {
      venta: "Venta",
      alquiler: "Alquiler",
    },

    propertyTypes: {
      piso: "Piso",
      atico: "Ático",
      casa: "Casa / Chalet",
      duplex: "Dúplex",
      estudio: "Estudio",
      local: "Local comercial",
    },

    energyStates: {
      "En trámite": "En trámite",
      Exento: "Exento",
    },

    aicatLine: ({ agentName, aicat }) =>
      `${agentName} — Agente inmobiliaria inscrita en el Registre d'Agents Immobiliaris de Catalunya, núm. AICAT ${aicat}.`,

    disclaimer:
      "Este documento tiene carácter meramente informativo y no forma parte de ningún contrato. Las superficies indicadas son aproximadas. El certificado de eficiencia energética está disponible previa solicitud.",

    confidentiality: ({ recipient, date }) =>
      `Documento preparado para ${recipient} el ${date}. Información confidencial: no se autoriza su difusión ni su reproducción a terceros.`,
  },

  en: {
    dateLocale: "en-GB",

    sections: {
      descripcion: "Description",
      datos: "Details",
      galeria: "Gallery",
      contacto: "Contact",
    },

    labels: {
      precio: "Price",
      barrio: "Neighbourhood",
      tipo: "Type",
      superficieConstruida: "Built area (m²)",
      superficieUtil: "Usable area (m²)",
      dormitorios: "Bedrooms",
      banos: "Bathrooms",
      referenciaCatastral: "Cadastral reference",
      cedulaHabitabilidad: "Habitability certificate",
      calificacionEnergetica: "Energy rating",
    },

    operations: {
      venta: "Sale",
      alquiler: "Rental",
    },

    propertyTypes: {
      piso: "Apartment",
      atico: "Penthouse",
      casa: "House",
      duplex: "Duplex",
      estudio: "Studio",
      local: "Commercial unit",
    },

    energyStates: {
      "En trámite": "In progress",
      Exento: "Exempt",
    },

    aicatLine: ({ agentName, aicat }) =>
      `${agentName} — Estate agent registered in the Register of Real Estate Agents of Catalonia (AICAT), no. ${aicat}.`,

    disclaimer:
      "This document is for information purposes only and does not form part of any contract. The surface areas shown are approximate. The energy performance certificate is available on request.",

    confidentiality: ({ recipient, date }) =>
      `Prepared for ${recipient} on ${date}. Confidential: it may not be circulated or reproduced without authorisation.`,
  },
};
