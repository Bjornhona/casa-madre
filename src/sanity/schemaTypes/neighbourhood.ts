import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons'

/**
 * Neighbourhood (Barrio) — powers the editorial "Barrios" section and the
 * property zone filter. Launch set: Sarrià, Sant Gervasi, Turó Park, Eixample,
 * Gràcia, Pedralbes. See build brief §5 / §6.
 */
export const neighbourhood = defineType({
  name: 'neighbourhood',
  title: 'Neighbourhood',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Proper name as written, e.g. "Gràcia", "Sant Gervasi".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blurb',
      title: 'Lifestyle blurb',
      description: 'One editorial line on the feel of the neighbourhood (ES + EN).',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers appear first in the Barrios section.',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', media: 'image'},
  },
})
