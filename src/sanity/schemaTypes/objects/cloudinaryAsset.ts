import {defineField, defineType} from 'sanity'

import {CloudinaryVideoInput} from '../../components/CloudinaryVideoInput'

/**
 * A media file stored on Cloudinary rather than Sanity.
 *
 * Cloudinary transcodes on upload and Sanity does not, which is why the
 * Journal's owner-interview videos live there. Only the metadata we need to
 * build a delivery URL is copied into Sanity — the file itself never touches
 * the dataset.
 *
 * Every field is written by CloudinaryVideoInput (registered here so any field
 * of this type gets the uploader) and is read-only in the Studio. Editors see
 * the upload button, not these fields.
 *
 * `secureUrl` points at the untransformed original; it's a fallback if the URL
 * helper ever breaks.
 */
export const cloudinaryAsset = defineType({
  name: 'cloudinaryAsset',
  title: 'Archivo de Cloudinary',
  type: 'object',
  components: {input: CloudinaryVideoInput},
  fields: [
    defineField({name: 'publicId', title: 'ID de Cloudinary', type: 'string', readOnly: true}),
    defineField({name: 'secureUrl', title: 'URL original', type: 'url', readOnly: true}),
    defineField({name: 'format', title: 'Formato', type: 'string', readOnly: true}),
    defineField({name: 'width', title: 'Ancho', type: 'number', readOnly: true}),
    defineField({name: 'height', title: 'Alto', type: 'number', readOnly: true}),
    defineField({name: 'duration', title: 'Duración (s)', type: 'number', readOnly: true}),
    defineField({name: 'bytes', title: 'Tamaño (bytes)', type: 'number', readOnly: true}),
  ],
})
