import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons'

/**
 * Neighbourhood (Barrio) — powers the editorial "Barrios" section and the
 * property zone filter. Launch set: Sarrià, Sant Gervasi, Turó Park, Eixample,
 * Gràcia, Pedralbes. See build brief §5 / §6.
 */
export const neighbourhood = defineType({
  name: 'neighbourhood',
  title: 'Barrio',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      description: 'Nombre propio tal como se escribe, p. ej. "Gràcia", "Sant Gervasi".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL (slug)',
      description:
      'Identificador en la URL, en inglés para SEO internacional. Se genera desde el título en inglés, pero puede editarse manualmente.',
      type: 'slug',
      options: {
        maxLength: 96,
        // Slug source: prefer the EN title, fall back to ES.
        source: (doc) => {
          const title = doc.title as
            | Array<{language?: string; value?: string}>
            | undefined
          const byLang = (lang: string) =>
            title?.find((t) => t.language === lang)?.value
          return byLang('en') || byLang('es') || ''
        },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blurb',
      title: 'Descripción de estilo de vida',
      description: 'Una línea editorial sobre el carácter del barrio (ES + EN).',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Orden de aparición',
      description: 'Los números más bajos aparecen primero en la sección Barrios.',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Orden de aparición',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', media: 'image'},
  },
})