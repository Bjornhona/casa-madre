import {useState} from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Select,
  Spinner,
  Stack,
  Text,
  TextArea,
  TextInput,
  useToast,
} from '@sanity/ui'
import {SparklesIcon} from '@sanity/icons'
import {type DocumentActionComponent} from 'sanity'
import {
  clearComposer,
  getComposerField,
  openComposer,
  setComposerField,
} from './composerStore'

/**
 * "✦ Generar borrador con IA" — a document action for the Journal editor.
 *
 * It opens a small dialog (Tema · Notas · Categoría), POSTs to the server-only
 * route /api/ai/draft (contentType "article"), and patches the returned draft
 * into the current document's bilingual fields. The result is a DRAFT: the
 * team reviews, edits and publishes manually.
 *
 * The action itself only opens the dialog via composerStore; the dialog is
 * rendered by ComposerDialogHost at Studio level so it survives Sanity's
 * action-component churn (see composerStore for the full story).
 *
 * ⚠️ The Anthropic API key lives only on the server (the API route). This
 * component never sees it — it just calls the route over fetch. All UI is in
 * Spanish for the Spanish-speaking editorial team.
 */

const CATEGORIES = [
  {value: 'barrios', title: 'Barrios'},
  {value: 'lifestyle', title: 'Lifestyle'},
  {value: 'inversion', title: 'Inversión'},
  {value: 'interiorismo', title: 'Interiorismo'},
  {value: 'guias', title: 'Guías'},
]

const DEFAULT_CATEGORY = 'barrios'
const CATEGORY_VALUES = new Set(CATEGORIES.map((c) => c.value))

/**
 * Keep the <Select> controlled. An article carrying a legacy category that is
 * no longer in the list would otherwise mount the field with no matching
 * option — it renders blank, and generating would write that stale value
 * straight back now that category uses `set`.
 */
const knownCategory = (value: unknown): string =>
  typeof value === 'string' && CATEGORY_VALUES.has(value)
    ? value
    : DEFAULT_CATEGORY

// Short, reasonably-unique keys for array members (_key) — Studio requires them.
const key = () => Math.random().toString(36).slice(2, 10)

type Draft = {
  titleEs: string
  titleEn: string
  excerptEs: string
  excerptEn: string
  bodyEs: string[]
  bodyEn: string[]
}

/** The parts of a journalPost this action reads before overwriting them. */
export type ArticleDoc = {
  category?: string
  title?: {value?: string | null}[] | null
  excerpt?: {value?: string | null}[] | null
  bodyEs?: unknown[] | null
  bodyEn?: unknown[] | null
}

type PatchOperation = {execute: (patches: unknown[]) => void}
type Toast = ReturnType<typeof useToast>

/**
 * Does the document already hold work the generator would destroy?
 *
 * The body arrays count by length alone: a single inserted image or video
 * block is editorial work even when there isn't a word of prose around it.
 */
const hasExistingContent = (doc: ArticleDoc | null): boolean => {
  if (!doc) return false
  if (doc.bodyEs?.length || doc.bodyEn?.length) return true
  return [doc.title, doc.excerpt].some((field) =>
    field?.some((item) => (item?.value ?? '').trim() !== ''),
  )
}

// Build an internationalizedArray (string/text) value keyed + tagged by language.
const intl = (typeName: string, es: string, en: string) => [
  {_key: 'es', _type: typeName, language: 'es', value: es},
  {_key: 'en', _type: typeName, language: 'en', value: en},
]

// Turn plain paragraph strings into Portable Text blocks.
const toBlocks = (paragraphs: string[]) =>
  paragraphs.map((text) => ({
    _key: key(),
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: key(), _type: 'span', text, marks: []}],
  }))

/**
 * Dialog content, rendered by ComposerDialogHost. Owns its form state locally
 * (mirrored to composerStore only as a reopen backup), so typing is fully
 * synchronous and the cursor never jumps.
 */
export function JournalComposerContent(props: {
  stateKey: string
  doc: ArticleDoc | null
  patch: PatchOperation
  toast: Toast
  onClose: () => void
}) {
  const {stateKey, doc, patch, toast, onClose} = props

  // Local state drives the inputs; the store is only a reopen backup.
  const [topic, setTopicState] = useState(() =>
    getComposerField(stateKey, 'topic', ''),
  )
  const [notes, setNotesState] = useState(() =>
    getComposerField(stateKey, 'notes', ''),
  )
  const [category, setCategoryState] = useState(() =>
    knownCategory(getComposerField(stateKey, 'category', doc?.category)),
  )
  const [loading, setLoading] = useState(false)
  // Deliberately not mirrored to the store: reopening should land on the form,
  // never on a primed "replace everything" screen.
  const [confirming, setConfirming] = useState(false)

  const setTopic = (value: string) => {
    setTopicState(value)
    setComposerField(stateKey, 'topic', value)
  }
  const setNotes = (value: string) => {
    setNotesState(value)
    setComposerField(stateKey, 'notes', value)
  }
  const setCategory = (value: string) => {
    setCategoryState(value)
    setComposerField(stateKey, 'category', value)
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.push({status: 'warning', title: 'Indica un tema para el artículo.'})
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({contentType: 'article', topic, notes, category}),
      })
      const data = (await res.json()) as
        | {ok: true; draft: Draft}
        | {ok: false; error: string}

      if (!res.ok || !data.ok) {
        const message = !data.ok ? data.error : 'Error al generar el borrador.'
        toast.push({status: 'error', title: 'Error al generar', description: message})
        return
      }

      const d = data.draft
      patch.execute([
        {
          set: {
            title: intl('internationalizedArrayStringValue', d.titleEs, d.titleEn),
            excerpt: intl('internationalizedArrayTextValue', d.excerptEs, d.excerptEn),
            bodyEs: toBlocks(d.bodyEs),
            bodyEn: toBlocks(d.bodyEn),
          },
        },
        // `category` is an explicit choice in this dialog, so it must `set`.
        // Under `setIfMissing` it silently no-opped on any article that
        // already had a category — the dropdown looked like it did nothing.
        // `author` stays `setIfMissing`: it's a default, not a choice, and
        // must never clobber a human-set byline.
        {set: {category}},
        {setIfMissing: {author: 'Casa Madre'}},
      ])

      toast.push({
        status: 'success',
        title: 'Borrador generado',
        description: 'Revisa y edita el contenido antes de publicar.',
      })
      clearComposer(stateKey)
      onClose()
    } catch {
      toast.push({
        status: 'error',
        title: 'Error al generar',
        description: 'No se pudo contactar con el servidor.',
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * The guardrail. Generating patches `set` over title, excerpt and both
   * bodies, so on a document that already has content it silently destroys
   * prose, images and videos. Confirm BEFORE generating — there's no point
   * spending a generation on a draft the editor is about to throw away.
   */
  const requestGenerate = () => {
    if (!topic.trim()) {
      toast.push({status: 'warning', title: 'Indica un tema para el artículo.'})
      return
    }
    if (hasExistingContent(doc)) {
      setConfirming(true)
      return
    }
    void handleGenerate()
  }

  const confirmGenerate = () => {
    setConfirming(false)
    void handleGenerate()
  }

  if (confirming) {
    return (
      <Stack space={4}>
        <Card padding={4} radius={2} tone="caution" border>
          <Stack space={4}>
            <Text size={1} weight="semibold">
              Este artículo ya tiene contenido
            </Text>
            <Text size={1}>
              Al generar un borrador nuevo se reemplazará todo lo que hay ahora
              en el título, el extracto y el cuerpo (ES y EN) —el texto que
              hayas escrito y también las imágenes y los vídeos insertados— y
              la categoría.
            </Text>
            <Text size={1} muted>
              Si solo quieres retocar el artículo, cancela y edítalo a mano.
            </Text>
          </Stack>
        </Card>

        <Flex justify="flex-end" gap={3}>
          <Button
            text="Reemplazar contenido"
            mode="ghost"
            tone="critical"
            onClick={confirmGenerate}
          />
          <Button
            text="Cancelar"
            tone="primary"
            autoFocus
            onClick={() => setConfirming(false)}
          />
        </Flex>
      </Stack>
    )
  }

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} tone="primary" border>
        <Text size={1} muted>
          La IA redactará un borrador en la voz de Casa Madre (ES + EN). Después
          podrás revisarlo, editarlo y publicarlo manualmente.
        </Text>
      </Card>

      <Stack space={3}>
        <Text size={1} weight="semibold">
          Tema
        </Text>
        <TextInput
          value={topic}
          placeholder="Ej. Vivir en Gràcia: ritmo, luz y vida de barrio"
          onChange={(e) => setTopic(e.currentTarget.value)}
          disabled={loading}
        />
      </Stack>

      <Stack space={3}>
        <Text size={1} weight="semibold">
          Notas (opcional)
        </Text>
        <TextArea
          value={notes}
          rows={4}
          placeholder="Indicaciones, ángulo, datos a incluir, tono concreto…"
          onChange={(e) => setNotes(e.currentTarget.value)}
          disabled={loading}
        />
      </Stack>

      <Stack space={3}>
        <Text size={1} weight="semibold">
          Categoría
        </Text>
        <Select
          value={category}
          onChange={(e) => setCategory(e.currentTarget.value)}
          disabled={loading}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.title}
            </option>
          ))}
        </Select>
      </Stack>

      <Flex justify="flex-end" gap={3} marginTop={2}>
        <Button text="Cancelar" mode="ghost" onClick={onClose} disabled={loading} />
        <Button
          text={loading ? 'Generando…' : 'Generar borrador'}
          tone="primary"
          icon={loading ? undefined : SparklesIcon}
          onClick={requestGenerate}
          disabled={loading}
        />
      </Flex>

      {loading && (
        <Flex align="center" justify="center" gap={3} paddingY={2}>
          <Spinner muted />
          <Box>
            <Text size={1} muted>
              Generando…
            </Text>
          </Box>
        </Flex>
      )}
    </Stack>
  )
}

// The action itself: a thin trigger. It owns no dialog and no state, so
// Sanity's action-component churn can't take the composer down with it.
const GenerateDraftAction: DocumentActionComponent = (props) => {
  const {id, type, onComplete} = props
  return {
    label: 'Generar borrador con IA',
    icon: SparklesIcon,
    onHandle: () => {
      openComposer({kind: 'article', id, type})
      onComplete()
    },
  }
}

export const generateDraftAction = GenerateDraftAction
