import {defineField, defineType} from 'sanity'
import {CommentIcon} from '@sanity/icons'

/**
 * Testimonial — client quotes. `isPublished` gates visibility on the site.
 * See build brief §6.
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonio',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Cita',
      description: 'El texto del testimonio (ES + EN).',
      type: 'internationalizedArrayText',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Autor',
      description: 'Quién lo dijo, p. ej. "Marta R., compradora en Gràcia".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isPublished',
      title: 'Publicado',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'attribution', published: 'isPublished'},
    prepare({title, published}) {
      return {
        title: title || 'Testimonio',
        subtitle: published ? 'Publicado' : 'Borrador',
      }
    },
  },
})
