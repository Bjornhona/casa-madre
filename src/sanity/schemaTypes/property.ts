import {defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons'

/**
 * Property (Propiedad) — manually entered listings for the Propiedades section.
 * Filters: operation · zone (neighbourhood) · type · price · bedrooms.
 * `isPublic` reserved for off-market / private listings in Phase 2. See brief §6.
 */
export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'content', title: 'Content'},
    {name: 'media', title: 'Media'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'details',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'operation',
      title: 'Operation',
      type: 'string',
      group: 'details',
      options: {
        list: [
          {title: 'Venta (Sale)', value: 'venta'},
          {title: 'Alquiler (Rent)', value: 'alquiler'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'propertyType',
      title: 'Type',
      type: 'string',
      group: 'details',
      options: {
        list: [
          {title: 'Piso (Apartment)', value: 'piso'},
          {title: 'Ático (Penthouse)', value: 'atico'},
          {title: 'Casa / Chalet (House)', value: 'casa'},
          {title: 'Dúplex', value: 'duplex'},
          {title: 'Estudio (Studio)', value: 'estudio'},
          {title: 'Local / Comercial', value: 'local'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'neighbourhood',
      title: 'Neighbourhood',
      type: 'reference',
      group: 'details',
      to: [{type: 'neighbourhood'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (EUR)',
      description: 'Sale price, or monthly rent for alquiler.',
      type: 'number',
      group: 'details',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'surface',
      title: 'Surface (m²)',
      type: 'number',
      group: 'details',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      group: 'details',
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      group: 'details',
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Short editorial description (ES + EN).',
      type: 'internationalizedArrayText',
      group: 'content',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      description: 'Short feature tags, e.g. "Terraza", "Luz natural", "Reformado".',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      group: 'content',
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
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
      ],
      validation: (rule) => rule.min(1).warning('Add at least one image'),
    }),
    defineField({
      name: 'isPublic',
      title: 'Publicly listed',
      description: 'Off when this is an off-market / private listing (Phase 2).',
      type: 'boolean',
      group: 'details',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      operation: 'operation',
      neighbourhood: 'neighbourhood.name',
      media: 'gallery.0',
    },
    prepare({title, operation, neighbourhood, media}) {
      const op = operation === 'alquiler' ? 'Alquiler' : 'Venta'
      return {
        title,
        subtitle: [op, neighbourhood].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
