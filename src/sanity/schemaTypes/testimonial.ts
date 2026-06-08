import {defineField, defineType} from 'sanity'
import {CommentIcon} from '@sanity/icons'

/**
 * Testimonial — client quotes. `isPublished` gates visibility on the site.
 * See build brief §6.
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      description: 'The testimonial text (ES + EN).',
      type: 'internationalizedArrayText',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      description: 'Who said it, e.g. "Marta R., compradora en Gràcia".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'attribution', published: 'isPublished'},
    prepare({title, published}) {
      return {
        title: title || 'Testimonial',
        subtitle: published ? 'Published' : 'Draft',
      }
    },
  },
})
