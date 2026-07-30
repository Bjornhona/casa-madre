import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons'

import {type CloudinaryAssetValue} from '../../components/CloudinaryVideoInput'

/**
 * Vídeo — a block for the Journal body (ES + EN). Short vertical interviews
 * with property owners, filmed for Instagram and shown with sound.
 *
 * The file itself lives on Cloudinary, not Sanity, because Cloudinary
 * transcodes on upload — see the `cloudinaryAsset` type, which carries the
 * metadata and the uploader.
 *
 * Deliberately minimal: no layout or playback options — those are derived in
 * the frontend, so the editor only ever sees three things.
 */

const MB = 1024 * 1024
const WARN_BYTES = 25 * MB
const MAX_BYTES = 50 * MB

export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Vídeo',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'video',
      title: 'Vídeo',
      type: 'cloudinaryAsset',
      validation: (rule) => [
        rule.required().error('Sube un vídeo.'),
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
      name: 'caption',
      title: 'Pie de vídeo',
      type: 'string',
    }),
    defineField({
      name: 'poster',
      title: 'Imagen de portada (opcional)',
      description:
        'Déjala vacía para usar un fotograma automático del vídeo.',
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
  ],
  preview: {
    select: {
      caption: 'caption',
      duration: 'video.duration',
      media: 'poster',
    },
    prepare({caption, duration, media}) {
      return {
        title: (caption as string) || 'Vídeo',
        subtitle:
          typeof duration === 'number' ? `${Math.round(duration)} s` : undefined,
        media: media || PlayIcon,
      }
    },
  },
})
