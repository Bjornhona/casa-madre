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
  // The insert targets. Read only to label the buttons honestly — a field that
  // already holds content is replaced, not filled.
  title?: {value?: string | null}[] | null
  description?: {value?: string | null}[] | null
  highlights?: string[] | null
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

/** What a click actually did to a field, recorded at the moment it happened. */
type InsertOutcome = 'inserted' | 'replaced'

/**
 * Captured at click time on purpose. `filled` is read from the live document,
 * so it flips to true the instant the patch lands — reading it afterwards
 * would label every insert as a replacement.
 */
const outcomeOf = (wasFilled: boolean): InsertOutcome =>
  wasFilled ? 'replaced' : 'inserted'

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

// An internationalizedArray field counts as filled if any language has text.
const hasIntlValue = (field?: {value?: string | null}[] | null): boolean =>
  Boolean(field?.some((item) => (item?.value ?? '').trim() !== ''))

const hasHighlights = (field?: string[] | null): boolean =>
  Boolean(field?.some((item) => (item ?? '').trim() !== ''))

function PreviewField(props: {
  label: string
  es: React.ReactNode
  en?: React.ReactNode
  onInsert: () => void
  /** Set once this field has been written; says which it was. */
  outcome?: InsertOutcome
  /** The target field already holds content, so this click overwrites it. */
  replaces: boolean
  /** Nothing to write: the preview explains itself and offers no button, so an
   *  empty result can never be pasted over content the agent wrote. */
  empty?: boolean
}) {
  const {label, es, en, onInsert, outcome, replaces, empty} = props
  const done = Boolean(outcome)
  return (
    <Card padding={3} radius={2} border>
      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Label size={1}>{label}</Label>
          {empty ? null : (
          <Button
            text={
              outcome === 'replaced'
                ? 'Reemplazado ✓'
                : outcome === 'inserted'
                  ? 'Insertado ✓'
                  : replaces
                    ? 'Reemplazar'
                    : 'Insertar'
            }
            mode={done ? 'ghost' : 'default'}
            tone={done ? 'positive' : 'primary'}
            fontSize={1}
            padding={2}
            onClick={onInsert}
          />
          )}
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

  // Which targets already hold content. Read live from the document, so after
  // an insert + "Volver a generar" the buttons correctly say "Reemplazar".
  const filled = {
    title: hasIntlValue(doc?.title),
    description: hasIntlValue(doc?.description),
    highlights: hasHighlights(doc?.highlights),
  }
  const anyFilled = filled.title || filled.description || filled.highlights

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
  const [inserted, setInsertedState] = useState<
    Record<string, InsertOutcome>
  >(() =>
    getComposerField<Record<string, InsertOutcome>>(stateKey, 'inserted', {}),
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
    update: (
      state: Record<string, InsertOutcome>,
    ) => Record<string, InsertOutcome>,
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
    setInserted((s) => ({...s, title: outcomeOf(filled.title)}))
    toast.push({
      status: 'success',
      title: filled.title ? 'Título reemplazado' : 'Título insertado',
    })
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
    setInserted((s) => ({...s, description: outcomeOf(filled.description)}))
    toast.push({
      status: 'success',
      title: filled.description
        ? 'Descripción reemplazada'
        : 'Descripción insertada',
    })
  }

  const insertHighlights = () => {
    if (!result || result.highlights.length === 0) return
    patch.execute([{set: {highlights: result.highlights}}])
    setInserted((s) => ({...s, highlights: outcomeOf(filled.highlights)}))
    toast.push({
      status: 'success',
      title: filled.highlights
        ? 'Destacados reemplazados'
        : 'Destacados insertados',
    })
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
          // An empty result is the generator declining to invent destacados, not
          // an instruction to clear the ones the agent wrote by hand.
          ...(result.highlights.length > 0
            ? {highlights: result.highlights}
            : {}),
        },
      },
    ])
    // Per field, not per click: "Insertar todo" over a ficha that only has a
    // título replaces that one and inserts the other two.
    setInserted(() => ({
      title: outcomeOf(filled.title),
      description: outcomeOf(filled.description),
      ...(result.highlights.length > 0
        ? {highlights: outcomeOf(filled.highlights)}
        : {}),
    }))
    toast.push({
      status: 'success',
      // Matches its own button, which reads "Reemplazar todo" on anyFilled.
      title: anyFilled ? 'Ficha reemplazada' : 'Ficha insertada',
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
              <Text size={1} muted>
                Estos datos se leen de la ficha de la propiedad; si algo no es
                correcto, corrígelo allí. La IA solo puede escribir a partir de
                ellos.
              </Text>
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
            outcome={inserted.title}
            replaces={filled.title}
          />
          <PreviewField
            label="Descripción"
            es={<Paragraphs parts={result.descriptionEs} />}
            en={<Paragraphs parts={result.descriptionEn} />}
            onInsert={insertDescription}
            outcome={inserted.description}
            replaces={filled.description}
          />
          <PreviewField
            label="Destacados"
            es={
              result.highlights.length > 0 ? (
                <Inline space={2}>
                  {result.highlights.map((h) => (
                    <Badge key={h} tone="primary" mode="outline">
                      {h}
                    </Badge>
                  ))}
                </Inline>
              ) : (
                // Not a failure: the destacados are for what the datos table
                // cannot say, so with no notas del agente there is nothing to
                // add. Says so plainly instead of showing an empty row.
                <Text size={1} muted>
                  Sin destacados: los datos estructurados ya lo dicen todo.
                  Añade notas del agente (reformas, terraza, vistas…) y vuelve a
                  generar.
                </Text>
              )
            }
            onInsert={insertHighlights}
            outcome={inserted.highlights}
            replaces={filled.highlights}
            empty={result.highlights.length === 0}
          />
          <Flex justify="flex-end">
            <Button
              text={anyFilled ? 'Reemplazar todo' : 'Insertar todo'}
              tone="positive"
              onClick={insertAll}
            />
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
