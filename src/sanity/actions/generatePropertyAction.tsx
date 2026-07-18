import {useState} from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Inline,
  Label,
  Spinner,
  Stack,
  Text,
  TextArea,
  useToast,
} from '@sanity/ui'
import {EditIcon, SparklesIcon} from '@sanity/icons'
import {type DocumentActionComponent, type SanityClient} from 'sanity'
import {
  clearComposer,
  getComposerField,
  openComposer,
  setComposerField,
} from './composerStore'

/**
 * "✦ Generar ficha con IA" — a document action for Propiedades.
 *
 * The agent fills the structured fields first (operación, tipo, barrio, precio,
 * superficie, dormitorios, baños), optionally adds free-text notes ("Notas del
 * agente"), and generates. The AI writes ONLY from those facts and notes —
 * the server prompt forbids inventing features. The result is previewed in the
 * dialog and nothing touches the document until the agent explicitly inserts
 * each field (título / descripción / destacados) or all at once.
 *
 * The action itself only opens the dialog via composerStore; the dialog is
 * rendered by ComposerDialogHost at Studio level so it survives Sanity's
 * action-component churn (see composerStore for the full story).
 *
 * ⚠️ The Anthropic API key lives only on the server (/api/ai/draft). This
 * component never sees it — it just calls the route over fetch. All UI is in
 * Spanish for the Spanish-speaking team.
 */

export type PropertyDoc = {
  operation?: string
  propertyType?: string
  neighbourhood?: {_ref?: string}
  price?: number
  surface?: number
  bedrooms?: number
  bathrooms?: number
}

type PropertyDraft = {
  titleEs: string
  titleEn: string
  descriptionEs: string[]
  descriptionEn: string[]
  highlights: string[]
}

type PatchOperation = {execute: (patches: unknown[]) => void}
type Toast = ReturnType<typeof useToast>

const OPERATION_LABELS: Record<string, string> = {
  venta: 'Venta',
  alquiler: 'Alquiler',
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  piso: 'Piso',
  atico: 'Ático',
  casa: 'Casa / Chalet',
  duplex: 'Dúplex',
  estudio: 'Estudio',
  local: 'Local / Comercial',
}

// Build an internationalizedArray (string/text) value keyed + tagged by language.
const intl = (typeName: string, es: string, en: string) => [
  {_key: 'es', _type: typeName, language: 'es', value: es},
  {_key: 'en', _type: typeName, language: 'en', value: en},
]

// Join generated paragraphs into the single text value the schema stores.
const paragraphs = (parts: string[]) => parts.join('\n\n')

function PreviewField(props: {
  label: string
  es: React.ReactNode
  en?: React.ReactNode
  onInsert: () => void
  inserted: boolean
}) {
  const {label, es, en, onInsert, inserted} = props
  return (
    <Card padding={3} radius={2} border>
      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Label size={1}>{label}</Label>
          <Button
            text={inserted ? 'Insertado ✓' : 'Insertar'}
            mode={inserted ? 'ghost' : 'default'}
            tone={inserted ? 'positive' : 'primary'}
            fontSize={1}
            padding={2}
            onClick={onInsert}
          />
        </Flex>
        <Stack space={2}>
          <Text size={1}>{es}</Text>
          {en ? (
            <Text size={1} muted>
              {en}
            </Text>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  )
}

const Paragraphs = ({parts}: {parts: string[]}) => (
  <>
    {parts.map((p, i) => (
      <span key={i}>
        {i > 0 && (
          <>
            <br />
            <br />
          </>
        )}
        {p}
      </span>
    ))}
  </>
)

/**
 * Dialog content, rendered by ComposerDialogHost. Owns its form state locally
 * (mirrored to composerStore only as a reopen backup), so typing is fully
 * synchronous and the cursor never jumps.
 */
export function PropertyComposerContent(props: {
  stateKey: string
  doc: PropertyDoc | null
  client: SanityClient
  patch: PatchOperation
  toast: Toast
  onClose: () => void
}) {
  const {stateKey, doc, client, patch, toast, onClose} = props

  // The facts the generator is grounded on. Required ones gate the button.
  const missing: string[] = []
  if (!doc?.operation) missing.push('Operación')
  if (!doc?.propertyType) missing.push('Tipo')
  if (!doc?.neighbourhood?._ref) missing.push('Barrio')
  if (doc?.price == null) missing.push('Precio')

  const factsLine = doc
    ? [
        doc.operation && (OPERATION_LABELS[doc.operation] ?? doc.operation),
        doc.propertyType &&
          (PROPERTY_TYPE_LABELS[doc.propertyType] ?? doc.propertyType),
        doc.price != null &&
          `${new Intl.NumberFormat('es-ES').format(doc.price)} €${
            doc.operation === 'alquiler' ? '/mes' : ''
          }`,
        doc.surface != null && `${doc.surface} m²`,
        doc.bedrooms != null && `${doc.bedrooms} dorm.`,
        doc.bathrooms != null && `${doc.bathrooms} baños`,
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  // Local state drives the inputs; the store is only a reopen backup.
  const [notes, setNotesState] = useState(() =>
    getComposerField(stateKey, 'notes', ''),
  )
  const [result, setResultState] = useState<PropertyDraft | null>(() =>
    getComposerField(stateKey, 'result', null),
  )
  const [inserted, setInsertedState] = useState<Record<string, boolean>>(() =>
    getComposerField(stateKey, 'inserted', {}),
  )
  const [loading, setLoading] = useState(false)

  const setNotes = (value: string) => {
    setNotesState(value)
    setComposerField(stateKey, 'notes', value)
  }
  const setResult = (value: PropertyDraft | null) => {
    setResultState(value)
    setComposerField(stateKey, 'result', value)
  }
  const setInserted = (
    update: (state: Record<string, boolean>) => Record<string, boolean>,
  ) => {
    setInsertedState((state) => {
      const next = update(state)
      setComposerField(stateKey, 'inserted', next)
      return next
    })
  }

  const handleGenerate = async () => {
    if (!doc || missing.length > 0) return
    setLoading(true)
    try {
      // Dereference the neighbourhood to its name — the generator receives
      // plain facts, never Sanity internals.
      const neighbourhoodName: string | null = await client.fetch(
        `*[_type == "neighbourhood" && _id == $id][0].name`,
        {id: doc.neighbourhood!._ref},
      )
      if (!neighbourhoodName) {
        toast.push({status: 'warning', title: 'No se encontró el barrio seleccionado.'})
        return
      }

      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contentType: 'property',
          notes,
          facts: {
            operation: doc.operation,
            propertyType: doc.propertyType,
            neighbourhood: neighbourhoodName,
            price: doc.price,
            surface: doc.surface ?? undefined,
            bedrooms: doc.bedrooms ?? undefined,
            bathrooms: doc.bathrooms ?? undefined,
          },
        }),
      })
      const data = (await res.json()) as
        | {ok: true; draft: PropertyDraft}
        | {ok: false; error: string}

      if (!res.ok || !data.ok) {
        const message = !data.ok ? data.error : 'Error al generar la ficha.'
        toast.push({status: 'error', title: 'Error al generar', description: message})
        return
      }

      setResult(data.draft)
      setInserted(() => ({}))
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

  const insertTitle = () => {
    if (!result) return
    patch.execute([
      {
        set: {
          title: intl('internationalizedArrayStringValue', result.titleEs, result.titleEn),
        },
      },
    ])
    setInserted((s) => ({...s, title: true}))
    toast.push({status: 'success', title: 'Título insertado'})
  }

  const insertDescription = () => {
    if (!result) return
    patch.execute([
      {
        set: {
          description: intl(
            'internationalizedArrayTextValue',
            paragraphs(result.descriptionEs),
            paragraphs(result.descriptionEn),
          ),
        },
      },
    ])
    setInserted((s) => ({...s, description: true}))
    toast.push({status: 'success', title: 'Descripción insertada'})
  }

  const insertHighlights = () => {
    if (!result) return
    patch.execute([{set: {highlights: result.highlights}}])
    setInserted((s) => ({...s, highlights: true}))
    toast.push({status: 'success', title: 'Destacados insertados'})
  }

  const insertAll = () => {
    if (!result) return
    patch.execute([
      {
        set: {
          title: intl('internationalizedArrayStringValue', result.titleEs, result.titleEn),
          description: intl(
            'internationalizedArrayTextValue',
            paragraphs(result.descriptionEs),
            paragraphs(result.descriptionEn),
          ),
          highlights: result.highlights,
        },
      },
    ])
    setInserted(() => ({title: true, description: true, highlights: true}))
    toast.push({
      status: 'success',
      title: 'Ficha insertada',
      description: 'Revisa y edita el contenido antes de publicar.',
    })
    clearComposer(stateKey)
    onClose()
  }

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} tone="primary" border>
        <Text size={1} muted>
          La IA redactará título, descripción y destacados (ES + EN) usando
          únicamente los datos de la propiedad y tus notas. Nada se guarda
          hasta que lo insertes tú.
        </Text>
      </Card>

      {missing.length > 0 ? (
        <Card padding={4} radius={2} tone="caution" border>
          <Stack space={4}>
            <Text size={1} weight="semibold">
              Para generar la ficha, completa primero estos campos en la
              propiedad:
            </Text>
            <Stack space={3}>
              {missing.map((field) => (
                <Flex key={field} align="center" gap={3}>
                  <Text size={1} muted>
                    <EditIcon />
                  </Text>
                  <Text size={1}>{field}</Text>
                </Flex>
              ))}
            </Stack>
          </Stack>
        </Card>
      ) : (
        factsLine && (
          <Card padding={3} radius={2} tone="transparent" border>
            <Stack space={2}>
              <Label size={0} muted>
                Datos de la propiedad
              </Label>
              <Text size={1}>{factsLine}</Text>
            </Stack>
          </Card>
        )
      )}

      <Stack space={3}>
        <Text size={1} weight="semibold">
          Notas del agente (opcional)
        </Text>
        <TextArea
          value={notes}
          rows={4}
          placeholder="Ej. reformado 2023, terraza 20m², muy luminoso, junto al mercado…"
          onChange={(e) => setNotes(e.currentTarget.value)}
          disabled={loading}
        />
      </Stack>

      <Stack space={3}>
        <Flex justify="flex-end" gap={3}>
          <Button text="Cerrar" mode="ghost" onClick={onClose} disabled={loading} />
          <Button
            text={
              loading ? 'Generando…' : result ? 'Volver a generar' : 'Generar ficha'
            }
            tone="primary"
            icon={loading ? undefined : SparklesIcon}
            onClick={handleGenerate}
            disabled={loading || missing.length > 0}
          />
        </Flex>
        {missing.length > 0 && (
          <Text size={1} muted align="right">
            Los datos se leen de la ficha de la propiedad, no se escriben aquí.
          </Text>
        )}
      </Stack>

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

      {result && !loading && (
        <Stack space={3}>
          <PreviewField
            label="Título"
            es={result.titleEs}
            en={result.titleEn}
            onInsert={insertTitle}
            inserted={Boolean(inserted.title)}
          />
          <PreviewField
            label="Descripción"
            es={<Paragraphs parts={result.descriptionEs} />}
            en={<Paragraphs parts={result.descriptionEn} />}
            onInsert={insertDescription}
            inserted={Boolean(inserted.description)}
          />
          <PreviewField
            label="Destacados"
            es={
              <Inline space={2}>
                {result.highlights.map((h) => (
                  <Badge key={h} tone="primary" mode="outline">
                    {h}
                  </Badge>
                ))}
              </Inline>
            }
            onInsert={insertHighlights}
            inserted={Boolean(inserted.highlights)}
          />
          <Flex justify="flex-end">
            <Button text="Insertar todo" tone="positive" onClick={insertAll} />
          </Flex>
        </Stack>
      )}
    </Stack>
  )
}

// The action itself: a thin trigger. It owns no dialog and no state, so
// Sanity's action-component churn can't take the composer down with it.
const GeneratePropertyAction: DocumentActionComponent = (props) => {
  const {id, type, onComplete} = props
  return {
    label: 'Generar ficha con IA',
    icon: SparklesIcon,
    onHandle: () => {
      openComposer({kind: 'property', id, type})
      onComplete()
    },
  }
}

export const generatePropertyAction = GeneratePropertyAction
