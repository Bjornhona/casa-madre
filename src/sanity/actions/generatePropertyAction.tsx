import {useCallback, useMemo, useState} from 'react'
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
import {SparklesIcon} from '@sanity/icons'
import {useClient, useDocumentOperation, type DocumentActionComponent} from 'sanity'
import {apiVersion} from '../env'

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
 * ⚠️ The Anthropic API key lives only on the server (/api/ai/draft). This
 * component never sees it — it just calls the route over fetch. All UI is in
 * Spanish for the Spanish-speaking team.
 */

type PropertyDoc = {
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

// A small preview block: field label + ES and EN values side by side.
function PreviewField(props: {
  label: string
  es: React.ReactNode
  en?: React.ReactNode
  onInsert: () => void
  inserted: boolean
  disabled: boolean
}) {
  const {label, es, en, onInsert, inserted, disabled} = props
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
            disabled={disabled}
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

// Uppercase name so eslint's rules-of-hooks recognises this as a component
// (Sanity renders document actions as components, so calling hooks here is
// valid). Exported below under the name the config imports.
const GeneratePropertyAction: DocumentActionComponent = (props) => {
  const {id, type, draft, published} = props
  const {patch} = useDocumentOperation(id, type)
  const client = useClient({apiVersion})
  const toast = useToast()

  const doc = (draft || published) as PropertyDoc | null

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<PropertyDraft | null>(null)
  const [inserted, setInserted] = useState<Record<string, boolean>>({})

  // The facts the generator is grounded on. Required ones gate the button.
  const missing = useMemo(() => {
    const m: string[] = []
    if (!doc?.operation) m.push('Operación')
    if (!doc?.propertyType) m.push('Tipo')
    if (!doc?.neighbourhood?._ref) m.push('Barrio')
    if (doc?.price == null) m.push('Precio')
    return m
  }, [doc])

  const factsLine = useMemo(() => {
    if (!doc) return ''
    return [
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
  }, [doc])

  const close = useCallback(() => {
    if (loading) return
    setOpen(false)
  }, [loading])

  const handleGenerate = useCallback(async () => {
    if (!doc || missing.length > 0) {
      toast.push({
        status: 'warning',
        title: 'Faltan datos de la propiedad',
        description: `Completa primero: ${missing.join(', ')}.`,
      })
      return
    }
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
      setInserted({})
    } catch {
      toast.push({
        status: 'error',
        title: 'Error al generar',
        description: 'No se pudo contactar con el servidor.',
      })
    } finally {
      setLoading(false)
    }
  }, [doc, missing, notes, client, toast])

  const insertTitle = useCallback(() => {
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
  }, [result, patch, toast])

  const insertDescription = useCallback(() => {
    if (!result) return
    patch.execute([
      {
        set: {
          description: intl(
            'internationalizedArrayTextValue',
            result.descriptionEs.join('\n\n'),
            result.descriptionEn.join('\n\n'),
          ),
        },
      },
    ])
    setInserted((s) => ({...s, description: true}))
    toast.push({status: 'success', title: 'Descripción insertada'})
  }, [result, patch, toast])

  const insertHighlights = useCallback(() => {
    if (!result) return
    patch.execute([{set: {highlights: result.highlights}}])
    setInserted((s) => ({...s, highlights: true}))
    toast.push({status: 'success', title: 'Destacados insertados'})
  }, [result, patch, toast])

  const insertAll = useCallback(() => {
    if (!result) return
    patch.execute([
      {
        set: {
          title: intl('internationalizedArrayStringValue', result.titleEs, result.titleEn),
          description: intl(
            'internationalizedArrayTextValue',
            result.descriptionEs.join('\n\n'),
            result.descriptionEn.join('\n\n'),
          ),
          highlights: result.highlights,
        },
      },
    ])
    setInserted({title: true, description: true, highlights: true})
    toast.push({
      status: 'success',
      title: 'Ficha insertada',
      description: 'Revisa y edita el contenido antes de publicar.',
    })
  }, [result, patch, toast])

  return {
    label: 'Generar ficha con IA',
    icon: SparklesIcon,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'dialog',
      onClose: close,
      header: '✦ Generar ficha con IA',
      width: 'medium',
      content: (
        <Stack space={4} padding={1}>
          <Card padding={3} radius={2} tone="primary" border>
            <Text size={1} muted>
              La IA redactará título, descripción y destacados (ES + EN) usando
              únicamente los datos de la propiedad y tus notas. Nada se guarda
              hasta que lo insertes tú.
            </Text>
          </Card>

          {factsLine ? (
            <Card padding={3} radius={2} tone="transparent" border>
              <Stack space={2}>
                <Label size={0} muted>
                  Datos de la propiedad
                </Label>
                <Text size={1}>{factsLine}</Text>
              </Stack>
            </Card>
          ) : null}

          {missing.length > 0 && (
            <Card padding={3} radius={2} tone="caution" border>
              <Text size={1}>Completa primero: {missing.join(', ')}.</Text>
            </Card>
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

          <Flex justify="flex-end" gap={3}>
            <Button text="Cerrar" mode="ghost" onClick={close} disabled={loading} />
            <Button
              text={
                loading
                  ? 'Generando…'
                  : result
                    ? 'Volver a generar'
                    : 'Generar ficha'
              }
              tone="primary"
              icon={loading ? undefined : SparklesIcon}
              onClick={handleGenerate}
              disabled={loading || missing.length > 0}
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

          {result && !loading && (
            <Stack space={3}>
              <PreviewField
                label="Título"
                es={result.titleEs}
                en={result.titleEn}
                onInsert={insertTitle}
                inserted={Boolean(inserted.title)}
                disabled={loading}
              />
              <PreviewField
                label="Descripción"
                es={result.descriptionEs.map((p, i) => (
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
                en={result.descriptionEn.map((p, i) => (
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
                onInsert={insertDescription}
                inserted={Boolean(inserted.description)}
                disabled={loading}
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
                disabled={loading}
              />
              <Flex justify="flex-end">
                <Button
                  text="Insertar todo"
                  tone="positive"
                  onClick={insertAll}
                  disabled={loading}
                />
              </Flex>
            </Stack>
          )}
        </Stack>
      ),
    },
  }
}

export const generatePropertyAction = GeneratePropertyAction
