import {useCallback, useState} from 'react'
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
import {useDocumentOperation, type DocumentActionComponent} from 'sanity'

/**
 * "✦ Generar borrador con IA" — a document action for the Journal editor.
 *
 * It opens a small dialog (Tema · Notas · Categoría), POSTs to the server-only
 * route /api/ai/draft (contentType "article"), and patches the returned draft
 * into the current document's bilingual fields. The result is a DRAFT: the team reviews, edits
 * and publishes manually.
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

// Uppercase name so eslint's rules-of-hooks recognises this as a component
// (Sanity renders document actions as components, so calling hooks here is
// valid). Exported below under the name the config imports.
const GenerateDraftAction: DocumentActionComponent = (props) => {
  const {id, type, draft, published} = props
  const {patch} = useDocumentOperation(id, type)
  const toast = useToast()

  const doc = (draft || published) as {category?: string} | null

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState(doc?.category ?? 'barrios')

  const close = useCallback(() => {
    if (loading) return
    setOpen(false)
  }, [loading])

  const handleGenerate = useCallback(async () => {
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
        {setIfMissing: {category, author: 'Casa Madre'}},
      ])

      toast.push({
        status: 'success',
        title: 'Borrador generado',
        description: 'Revisa y edita el contenido antes de publicar.',
      })
      setOpen(false)
      setTopic('')
      setNotes('')
    } catch {
      toast.push({
        status: 'error',
        title: 'Error al generar',
        description: 'No se pudo contactar con el servidor.',
      })
    } finally {
      setLoading(false)
    }
  }, [topic, notes, category, patch, toast])

  return {
    label: 'Generar borrador con IA',
    icon: SparklesIcon,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'dialog',
      onClose: close,
      header: '✦ Generar borrador con IA',
      width: 'medium',
      content: (
        <Stack space={4} padding={1}>
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
            <Button
              text="Cancelar"
              mode="ghost"
              onClick={close}
              disabled={loading}
            />
            <Button
              text={loading ? 'Generando…' : 'Generar borrador'}
              tone="primary"
              icon={loading ? undefined : SparklesIcon}
              onClick={handleGenerate}
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
      ),
    },
  }
}

export const generateDraftAction = GenerateDraftAction
