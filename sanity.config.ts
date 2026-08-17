'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {generateDraftAction} from './src/sanity/actions/generateDraftAction'
import {generatePropertyAction} from './src/sanity/actions/generatePropertyAction'
import {generateFichaAction} from './src/sanity/actions/generateFichaAction'
import {ComposerLayout} from './src/sanity/actions/ComposerDialogHost'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  document: {
    // AI composers: "✦ Generar borrador con IA" on Journal posts and
    // "✦ Generar ficha con IA" on Propiedades. Both call /api/ai/draft.
    // "Generar ficha PDF" (Propiedades only) renders the client-facing PDF.
    actions: (prev, context) => {
      if (context.schemaType === 'journalPost') return [...prev, generateDraftAction]
      if (context.schemaType === 'property')
        return [...prev, generatePropertyAction, generateFichaAction]
      return prev
    },
  },
  studio: {
    components: {
      // Hosts the AI composer dialogs outside the document-action lifecycle
      // (actions can be unmounted mid-flight; this layout never is).
      layout: ComposerLayout,
    },
  },
  plugins: [
    structureTool({structure}),
    // Field-level localization (ES primary, EN adaptation) for content fields
    // like property descriptions and neighbourhood blurbs.
    internationalizedArray({
      languages: [
        {id: 'es', title: 'Español'},
        {id: 'en', title: 'English'},
      ],
      defaultLanguages: ['es'],
      fieldTypes: ['string', 'text'],
    }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
