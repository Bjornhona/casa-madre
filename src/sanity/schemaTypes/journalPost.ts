import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

/**
 * Journal article (Artículo del Journal) — editorial content for the Journal
 * section. Studio labels are in Spanish (the team writes in Spanish); the slug
 * is in English for international SEO. Title, excerpt and body are bilingual
 * (ES + EN): ES is the approved text, EN a natural adaptation.
 *
 * The "✦ Generar borrador con IA" document action (registered in
 * sanity.config.ts) can pre-fill these fields with an AI-drafted article that
 * the team then reviews, edits and publishes manually.
 */
export const journalPost = defineType({
  name: 'journalPost',
  title: 'Artículos del Journal',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Contenido', default: true},
    {name: 'meta', title: 'Detalles'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      description: 'Título del artículo (ES + EN).',
      type: 'internationalizedArrayString',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL (slug)',
      description:
        'Identificador en la URL, en inglés para SEO internacional. Se genera desde el título en inglés, pero puede editarse manualmente.',
      type: 'slug',
      group: 'meta',
      options: {
        maxLength: 96,
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
      name: 'excerpt',
      title: 'Resumen',
      description: 'Un breve resumen para tarjetas y metadatos (ES + EN).',
      type: 'internationalizedArrayText',
      group: 'content',
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          {title: 'Barrios', value: 'barrios'},
          {title: 'Lifestyle', value: 'lifestyle'},
          {title: 'Inversión', value: 'inversion'},
          {title: 'Interiorismo', value: 'interiorismo'},
          {title: 'Guías', value: 'guias'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Imagen de portada',
      type: 'image',
      group: 'content',
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
      name: 'bodyEs',
      title: 'Contenido (ES)',
      description: 'Cuerpo del artículo en español.',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Texto alternativo', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'bodyEn',
      title: 'Contenido (EN)',
      description: 'Cuerpo del artículo en inglés (adaptación natural).',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Texto alternativo', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'string',
      group: 'meta',
      initialValue: 'Casa Madre',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha de publicación',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'isPublished',
      title: 'Publicado',
      description: 'Actívalo para que el artículo aparezca en la web.',
      type: 'boolean',
      group: 'meta',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Fecha de publicación (reciente primero)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      published: 'isPublished',
      media: 'coverImage',
    },
    prepare({title, category, published, media}) {
      const titleArr = title as
        | Array<{language?: string; value?: string}>
        | undefined
      const label =
        titleArr?.find((t) => t.language === 'es')?.value ||
        titleArr?.[0]?.value ||
        'Artículo sin título'
      const categoryLabels: Record<string, string> = {
        barrios: 'Barrios',
        lifestyle: 'Lifestyle',
        inversion: 'Inversión',
        interiorismo: 'Interiorismo',
        guias: 'Guías',
      }
      return {
        title: label,
        subtitle: [categoryLabels[category as string], published ? 'Publicado' : 'Borrador']
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
