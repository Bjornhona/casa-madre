import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

import {type CloudinaryAssetValue} from '../components/CloudinaryVideoInput'

/**
 * Journal article (Artículo del Journal) — editorial content for the Journal
 * section. Studio labels are in Spanish (the team writes in Spanish); the slug
 * is in English for international SEO. Title, excerpt and body are bilingual
 * (ES + EN): ES is the approved text, EN a natural adaptation.
 *
 * An article may carry one owner-interview video (`video`), which sits at
 * document level rather than inside the body: it's the primary content, it's
 * language-independent so the editor uploads it once, and the index/teaser
 * queries can surface its duration on the card without fetching the body.
 *
 * The "✦ Generar borrador con IA" document action (registered in
 * sanity.config.ts) can pre-fill these fields with an AI-drafted article that
 * the team then reviews, edits and publishes manually.
 */

const MB = 1024 * 1024
const WARN_BYTES = 25 * MB
const MAX_BYTES = 50 * MB

/**
 * Does `videoCaption` hold any text? It's an internationalizedArrayString, so
 * the value is one entry per language and an emptied entry can linger with a
 * blank string.
 */
const hasCaptionText = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.some(
    (item) => ((item as {value?: string} | null)?.value ?? '').trim() !== '',
  )

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
      description:
        'La imagen del artículo: se usa en la tarjeta del Journal y al compartirlo en redes. Elige una foto amplia y despejada, que funcione bien en pequeño. Conviene ponerla también en los artículos con vídeo, aunque allí no aparezca en la cabecera. Es opcional cuando hay vídeo: en ese caso se usa un fotograma del vídeo.',
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
      name: 'video',
      title: 'Vídeo (entrevista)',
      description:
        'Opcional. La entrevista con el propietario, que aparece cerca del inicio del artículo. Se sube una sola vez y sirve para las dos versiones (ES y EN).',
      type: 'cloudinaryAsset',
      group: 'content',
      validation: (rule) => [
        rule.custom<CloudinaryAssetValue>((value) => {
          if (typeof value?.bytes === 'number' && value.bytes > MAX_BYTES) {
            return 'El vídeo supera los 50 MB. Recórtalo o vuelve a exportarlo con menos calidad antes de publicarlo.'
          }
          return true
        }),
        rule
          .custom<CloudinaryAssetValue>((value) => {
            if (typeof value?.bytes === 'number' && value.bytes > WARN_BYTES) {
              return 'El vídeo pesa más de 25 MB y tardará en cargar. Considera recortarlo o volver a exportarlo con menos calidad.'
            }
            return true
          })
          .warning(),
      ],
    }),
    defineField({
      name: 'videoCaption',
      title: 'Pie de vídeo',
      description:
        'Texto que acompaña al vídeo (ES + EN). Si quitas el vídeo, este campo sigue visible mientras tenga texto, para que puedas borrarlo o reutilizarlo con el vídeo nuevo.',
      type: 'internationalizedArrayString',
      group: 'content',
      // Stay visible while there's text but no video. Hiding an orphaned
      // caption is what let it reappear silently under a different video
      // later; this way the editor can see it and decide. Covers every route
      // a video can leave by, not just the input's "Quitar" button.
      hidden: ({parent}) =>
        !parent?.video?.publicId && !hasCaptionText(parent?.videoCaption),
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const parent = context.parent as
              | {video?: {publicId?: string}}
              | undefined
            if (hasCaptionText(value) && !parent?.video?.publicId) {
              return 'Este pie quedó sin vídeo. Bórralo o sube un vídeo nuevo.'
            }
            return true
          })
          .warning(),
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
