import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons'
import {warnIfEmpty} from './validation'

/**
 * Agent (Agente) — team members shown as personal contact cards on the
 * contact page ("Equipo" in the Studio). Each card exposes the agent's
 * direct channels (email · phone · WhatsApp); the generic env-var contact
 * rows on the page are only a fallback while this collection is empty.
 */
export const agent = defineType({
  name: 'agent',
  title: 'Agente',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Cargo',
      description: 'Cargo o rol mostrado bajo el nombre (ES + EN).',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      description:
        'Canal de contacto del agente. Aparece en la ficha PDF de las propiedades, por lo que no puede quedar vacío.',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Teléfono',
      description:
        'Formato internacional, solo dígitos, p. ej. +34123456789. Se usa para WhatsApp.',
      type: 'string',
      validation: (rule) =>
        rule
          .required()
          .regex(/^\+?\d{7,15}$/, {name: 'número internacional, solo dígitos'}),
    }),
    defineField({
      name: 'aicat',
      title: 'Número AICAT',
      description:
        "Número de registro en el Registre d'Agents Immobiliaris de Catalunya. Debe aparecer en la publicidad de las propiedades.",
      type: 'string',
      validation: (rule) =>
        rule
          .custom(
            warnIfEmpty(
              'El número AICAT es obligatorio en la publicidad de propiedades en Catalunya.',
            ),
          )
          .warning(),
    }),
    defineField({
      name: 'photo',
      title: 'Foto',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      description: 'Posición en la página (menor = primero).',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Orden',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'photo',
    },
    prepare({title, subtitle, media}) {
      const subtitleArr = subtitle as
        | Array<{language?: string; value?: string}>
        | undefined
      return {
        title,
        subtitle:
          subtitleArr?.find((t) => t.language === 'es')?.value ||
          subtitleArr?.[0]?.value,
        media,
      }
    },
  },
})
