import { defineArrayMember, defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";
import { warnIfEmpty } from "./validation";

/**
 * Property (Propiedad) — manually entered listings for the Propiedades section.
 * Filters: operation · zone (neighbourhood) · type · price · bedrooms.
 * `isPublic` reserved for off-market / private listings in Phase 2. See brief §6.
 */
export const property = defineType({
  name: "property",
  title: "Propiedad",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "details", title: "Detalles", default: true },
    { name: "content", title: "Contenido" },
    { name: "media", title: "Medios" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      description: "Título de la propiedad (ES + EN).",
      type: "internationalizedArrayString",
      group: "details",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL (slug)",
      description:
        "Identificador en la URL, en inglés para SEO internacional. Se genera desde el título en inglés, pero puede editarse manualmente.",
      type: "slug",
      group: "details",
      options: {
        maxLength: 96,
        // Slug source: prefer the EN title, fall back to ES.
        source: (doc) => {
          const title = doc.title as
            | Array<{ language?: string; value?: string }>
            | undefined;
          const byLang = (lang: string) =>
            title?.find((t) => t.language === lang)?.value;
          return byLang("en") || byLang("es") || "";
        },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "operation",
      title: "Operación",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "Venta (Sale)", value: "venta" },
          { title: "Alquiler (Rent)", value: "alquiler" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "propertyType",
      title: "Tipo",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "Piso (Apartment)", value: "piso" },
          { title: "Ático (Penthouse)", value: "atico" },
          { title: "Casa / Chalet (House)", value: "casa" },
          { title: "Dúplex", value: "duplex" },
          { title: "Estudio (Studio)", value: "estudio" },
          { title: "Local / Comercial", value: "local" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "neighbourhood",
      title: "Barrio",
      type: "reference",
      group: "details",
      to: [{ type: "neighbourhood" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Precio (EUR)",
      description: "Precio de venta, o alquiler mensual para alquiler.",
      type: "number",
      group: "details",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "surface",
      title: "Superficie construida (m²)",
      description:
        "Superficie construida: incluye muros, tabiques y la parte proporcional de zonas comunes. Es la que se muestra en el listado y en los filtros. La superficie útil (solo el interior pisable) se indica aparte.",
      type: "number",
      group: "details",
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: "surfaceUtil",
      title: "Superficie útil (m²)",
      description:
        "Superficie interior pisable, sin muros ni zonas comunes. Siempre menor que la construida.",
      type: "number",
      group: "details",
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: "bedrooms",
      title: "Dormitorios",
      type: "number",
      group: "details",
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "bathrooms",
      title: "Baños",
      type: "number",
      group: "details",
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "agent",
      title: "Agente responsable",
      description:
        "Determina el bloque de contacto y el número AICAT que aparecen en la ficha PDF de esta propiedad.",
      type: "reference",
      group: "details",
      to: [{ type: "agent" }],
      // Warning, not required: the existing listings predate this field and
      // must not become invalid documents overnight.
      validation: (rule) =>
        rule
          .custom(
            warnIfEmpty(
              "Sin agente responsable, la ficha PDF se queda sin datos de contacto ni número AICAT.",
            ),
          )
          .warning(),
    }),
    defineField({
      name: "energyRating",
      title: "Certificado energético",
      description:
        "Calificación de eficiencia energética. El RD 390/2021 obliga a mostrarla en toda publicidad de venta y alquiler.",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "A", value: "A" },
          { title: "B", value: "B" },
          { title: "C", value: "C" },
          { title: "D", value: "D" },
          { title: "E", value: "E" },
          { title: "F", value: "F" },
          { title: "G", value: "G" },
          { title: "En trámite", value: "En trámite" },
          { title: "Exento", value: "Exento" },
        ],
      },
      validation: (rule) =>
        rule
          .custom(
            warnIfEmpty(
              "El RD 390/2021 exige indicar la calificación energética en la publicidad de venta y alquiler.",
            ),
          )
          .warning(),
    }),
    defineField({
      name: "energyCertNumber",
      title: "Nº registro certificado",
      description:
        "Número de registro del certificado de eficiencia energética (ICAEN). Opcional.",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "referenciaCatastral",
      title: "Referencia catastral",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "cedulaHabitabilidad",
      title: "Cédula de habitabilidad",
      description: "Número de la cédula de habitabilidad, si está disponible.",
      type: "string",
      group: "details",
    }),
    defineField({
      name: "description",
      title: "Descripción",
      description: "Descripción editorial (ES + EN).",
      type: "internationalizedArrayText",
      group: "content",
    }),
    defineField({
      name: "highlights",
      title: "Destacados",
      description:
        'Etiquetas de características, p. ej. "Terraza", "Luz natural", "Reformado".',
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({
      name: "gallery",
      title: "Galería",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "string",
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1).warning("Añade al menos una imagen"),
    }),
    defineField({
      name: "status",
      title: "Estado",
      description:
        "Controla la etiqueta que se muestra sobre la foto en el listado. Una propiedad vendida sigue visible a propósito, como parte del historial de operaciones. Para retirar una propiedad por completo, desactiva «Publicado».",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "Disponible (Available)", value: "disponible" },
          { title: "Reservado (Reserved)", value: "reservado" },
          { title: "Vendido o alquilado (Sold or rented)", value: "vendido" },
        ],
        layout: "radio",
      },
      initialValue: "disponible",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ocultarPrecio",
      title: "Ocultar el precio",
      description:
        "El precio de una operación cerrada es información comercial sensible. Marca esta casilla para mostrar «Precio no disponible» en lugar de la cifra.",
      type: "boolean",
      group: "details",
      initialValue: false,
      // Only meaningful once an operation is closed or under offer.
      hidden: ({ parent }) =>
        parent?.status !== "reservado" && parent?.status !== "vendido",
    }),
    defineField({
      name: "isPublic",
      title: "Publicado",
      description: "Desactivado cuando es una propiedad privada.",
      type: "boolean",
      group: "details",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      operation: "operation",
      status: "status",
      neighbourhood: "neighbourhood.name",
      media: "gallery.0",
    },
    prepare({ title, operation, status, neighbourhood, media }) {
      const titleArr = title as
        | Array<{ language?: string; value?: string }>
        | undefined;
      const label =
        titleArr?.find((t) => t.language === "es")?.value ||
        titleArr?.[0]?.value ||
        "Propiedad sin título";
      const op = operation === "alquiler" ? "Alquiler" : "Venta";
      // Only a closed or reserved operation is worth calling out in the list.
      const statusLabel =
        status === "reservado"
          ? "Reservado"
          : status === "vendido"
            ? operation === "alquiler"
              ? "Alquilado"
              : "Vendido"
            : null;
      return {
        title: label,
        subtitle: [op, neighbourhood, statusLabel].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
