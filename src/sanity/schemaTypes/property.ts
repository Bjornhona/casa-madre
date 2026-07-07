import { defineArrayMember, defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";

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
      type: "string",
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
      title: "Superficie (m²)",
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
      neighbourhood: "neighbourhood.name",
      media: "gallery.0",
    },
    prepare({ title, operation, neighbourhood, media }) {
      const op = operation === "alquiler" ? "Alquiler" : "Venta";
      return {
        title,
        subtitle: [op, neighbourhood].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
