/**
 * Placeholder property data for Phase 1.
 *
 * This shape mirrors the planned Sanity `property` document so it can be swapped
 * for a GROQ query later with minimal change at the call site:
 *
 *   export async function getProperties(): Promise<Property[]> {
 *     return sanityClient.fetch(groq`*[_type == "property" && isPublic == true]{ ... }`)
 *   }
 *
 * For now it's a synchronous constant; consumers should treat it as the data source
 * and not assume it stays local.
 */

export type Operation = "venta" | "alquiler";

/** Localized free text — matches Sanity's localized-field convention. */
export type LocalizedText = { es: string; en: string };

export interface Property {
  id: string;
  title: LocalizedText;
  operation: Operation;
  /** Neighbourhood name; aligns with the Barrios set so filters stay coherent. */
  neighbourhood: string;
  /** Property type (e.g. Piso, Ático). Kept for parity with Sanity; not filtered in Phase 1. */
  type: string;
  /** EUR. For `alquiler` this is the monthly figure. */
  price: number;
  /** Built surface in m². */
  surface: number;
  bedrooms: number;
  bathrooms: number;
  description: LocalizedText;
  /** Primary image (Sanity will supply a gallery; we use the first asset). */
  image: string;
  /** Public listings only; off-market handling comes later via this flag. */
  isPublic: boolean;
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=85`;

export const properties: Property[] = [
  {
    id: "cm-001",
    title: {
      es: "Piso señorial en el Eixample",
      en: "Stately apartment in the Eixample",
    },
    operation: "venta",
    neighbourhood: "Eixample",
    type: "Piso",
    price: 1_250_000,
    surface: 168,
    bedrooms: 4,
    bathrooms: 2,
    description: {
      es: "Techos altos, suelos de mosaico originales y una galería bañada de luz sobre una de las calles más serenas del Eixample.",
      en: "High ceilings, original mosaic floors and a light-filled gallery over one of the Eixample's most serene streets.",
    },
    image: img("1600585154340-be6161a56a0c"),
    isPublic: true,
  },
  {
    id: "cm-002",
    title: {
      es: "Ático con terraza en Gràcia",
      en: "Penthouse with terrace in Gràcia",
    },
    operation: "venta",
    neighbourhood: "Gràcia",
    type: "Ático",
    price: 845_000,
    surface: 112,
    bedrooms: 3,
    bathrooms: 2,
    description: {
      es: "Un refugio luminoso sobre los tejados del barrio, con terraza propia para las tardes largas y la vida tranquila de Gràcia.",
      en: "A bright retreat above the rooftops, with a private terrace for long afternoons and the easy rhythm of Gràcia.",
    },
    image: img("1600566753086-00f18fb6b3ea"),
    isPublic: true,
  },
  {
    id: "cm-003",
    title: {
      es: "Casa familiar en Sarrià",
      en: "Family house in Sarrià",
    },
    operation: "venta",
    neighbourhood: "Sarrià",
    type: "Casa",
    price: 1_980_000,
    surface: 245,
    bedrooms: 5,
    bathrooms: 3,
    description: {
      es: "Una casa con jardín en el corazón del antiguo pueblo de Sarrià: espacio, calma y la sensación de que cada rincón tiene nombre.",
      en: "A house with a garden in the heart of old Sarrià: space, calm and the feeling that every corner still has a name.",
    },
    image: img("1551836022-d5d88e9218df"),
    isPublic: true,
  },
  {
    id: "cm-004",
    title: {
      es: "Vivienda de temporada en Sant Gervasi",
      en: "Seasonal home in Sant Gervasi",
    },
    operation: "alquiler",
    neighbourhood: "Sant Gervasi",
    type: "Piso",
    price: 2_600,
    surface: 96,
    bedrooms: 2,
    bathrooms: 2,
    description: {
      es: "Interiorismo cálido y equipamiento cuidado para una estancia entre la ciudad y la calma, lista para vivir desde el primer día.",
      en: "Warm interiors and considered furnishings for a stay between city and calm — ready to live in from day one.",
    },
    image: img("1618220179428-22790b461013"),
    isPublic: true,
  },
  {
    id: "cm-005",
    title: {
      es: "Apartamento de inversión en Turó Park",
      en: "Investment apartment in Turó Park",
    },
    operation: "venta",
    neighbourhood: "Turó Park",
    type: "Piso",
    price: 1_450_000,
    surface: 134,
    bedrooms: 3,
    bathrooms: 2,
    description: {
      es: "Una ubicación inmejorable junto al parque, con sólido potencial de revalorización en uno de los enclaves más exclusivos de la ciudad.",
      en: "An unbeatable position beside the park, with solid upside in one of the city's most exclusive enclaves.",
    },
    image: img("1454165804606-c3d57bc86b40"),
    isPublic: true,
  },
  {
    id: "cm-006",
    title: {
      es: "Larga estancia en Pedralbes",
      en: "Long-term home in Pedralbes",
    },
    operation: "alquiler",
    neighbourhood: "Pedralbes",
    type: "Casa",
    price: 4_200,
    surface: 210,
    bedrooms: 4,
    bathrooms: 3,
    description: {
      es: "Privacidad, verde y luz en una vivienda pensada para la vida hacia dentro, cerca de colegios internacionales y zonas tranquilas.",
      en: "Privacy, greenery and light in a home made for living inward, near international schools and quiet streets.",
    },
    image: img("1589829545856-d10d557cf95f"),
    isPublic: true,
  },
];
