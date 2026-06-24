import {defineArrayMember, defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons'

/**
 * Neighbourhood (Barrio) — powers the editorial "Barrios" section, the
 * individual barrio pages and the property zone filter. Launch set: Sarrià,
 * Sant Gervasi, Turó Park, Eixample, Gràcia, Pedralbes. See build brief §5 / §6.
 *
 * Studio labels are in Spanish; field `name` keys are English; the slug is
 * English for international SEO. Localized text is bilingual ES/EN via the
 * internationalizedArray pattern (locale in `language`), and the page body
 * mirrors journalPost's bodyEs / bodyEn block arrays.
 */
export const neighbourhood = defineType({
  name: 'neighbourhood',
  title: 'Barrio',
  type: 'document',
  icon: PinIcon,
  groups: [
    {name: 'content', title: 'Contenido', default: true},
    {name: 'media', title: 'Imágenes'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      description: 'Nombre propio tal como se escribe, p. ej. "Gràcia", "Sant Gervasi".',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL (slug)',
      description:
        'Identificador en la URL, en inglés para SEO internacional. Se genera desde el nombre, pero puede editarse manualmente.',
      type: 'slug',
      group: 'content',
      options: {
        maxLength: 96,
        source: 'name',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blurb',
      title: 'Descripción de estilo de vida',
      description: 'Una línea editorial sobre el carácter del barrio (ES + EN). Aparece en las tarjetas.',
      type: 'internationalizedArrayText',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      title: 'Introducción',
      description: 'Un párrafo editorial que transmite el "feel" del barrio (ES + EN).',
      type: 'internationalizedArrayText',
      group: 'content',
    }),
    defineField({
      name: 'highlights',
      title: 'Aspectos destacados',
      description:
        'Detalles editoriales del barrio (p. ej. Ambiente, Ideal para, Colegios, Ritmo). Etiqueta y texto, ambos ES + EN.',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'highlight',
          title: 'Aspecto',
          fields: [
            defineField({
              name: 'label',
              title: 'Etiqueta',
              type: 'internationalizedArrayString',
            }),
            defineField({
              name: 'value',
              title: 'Texto',
              type: 'internationalizedArrayString',
            }),
          ],
          preview: {
            select: {label: 'label', value: 'value'},
            prepare({label, value}) {
              const pick = (arr: unknown) => {
                const a = arr as Array<{language?: string; value?: string}> | undefined
                return a?.find((x) => x.language === 'es')?.value || a?.[0]?.value || ''
              }
              return {title: pick(label) || 'Aspecto', subtitle: pick(value)}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'bodyEs',
      title: 'Contenido (ES)',
      description: 'Cuerpo editorial del barrio en español.',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Texto alternativo', type: 'string'})],
        }),
      ],
    }),
    defineField({
      name: 'bodyEn',
      title: 'Contenido (EN)',
      description: 'Cuerpo editorial del barrio en inglés (adaptación natural).',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Texto alternativo', type: 'string'})],
        }),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Imagen (tarjeta)',
      description: 'Imagen pequeña para la tarjeta en la sección Barrios.',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Texto alternativo', type: 'string'})],
    }),
    defineField({
      name: 'heroImage',
      title: 'Imagen principal',
      description: 'Imagen grande de cabecera para la página del barrio.',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Texto alternativo', type: 'string'})],
    }),
    defineField({
      name: 'gallery',
      title: 'Galería',
      description: 'Imágenes editoriales del barrio (2–3 recomendadas).',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Texto alternativo', type: 'string'})],
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Orden de aparición',
      description: 'Los números más bajos aparecen primero en la sección Barrios.',
      type: 'number',
      group: 'content',
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
