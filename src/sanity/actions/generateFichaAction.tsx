import {useState} from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Radio,
  Spinner,
  Stack,
  Text,
  TextInput,
  type ToastContextValue,
} from '@sanity/ui'
import {DocumentPdfIcon, WarningOutlineIcon} from '@sanity/icons'
import type {SanityClient} from 'sanity'
import {type DocumentActionComponent} from 'sanity'
import {assertLegalDataComplete} from '../../lib/legal-data'
import {FICHA_QUERY} from '../ficha/query'
import type {FichaLocale} from '../ficha/copy'
import {openComposer} from './composerStore'

/**
 * "Generar ficha PDF" — document action for Propiedades.
 *
 * Order matters: dialog → fetch → render → download. FICHA_QUERY takes $locale
 * and resolves title/description server-side, so the language must be chosen
 * before the fetch runs. Nothing is fetched when the action mounts.
 *
 * As with the AI composers, the action is only a trigger: the dialog is
 * rendered by ComposerDialogHost at Studio level, because Sanity unmounts
 * action components at will and this flow stays open for several seconds while
 * images download and the PDF renders. See composerStore for the full story.
 *
 * PRIVACY: the recipient's name is render-only. It lives in local component
 * state for exactly one generation — it is never patched into Sanity, never
 * mirrored into composerStore (unlike the composer fields), never logged, and
 * never sent anywhere but the PDF in the editor's own browser.
 *
 * UI is Spanish, like the rest of the Studio.
 */

const RECIPIENT_MAX = 60

const LOCALES: {value: FichaLocale; title: string}[] = [
  {value: 'es', title: 'Español'},
  {value: 'en', title: 'English'},
]

/** The parts of a property this flow reads. */
export type FichaDoc = {
  _id?: string
  slug?: {current?: string} | null
  energyRating?: string | null
  ocultarPrecio?: boolean | null
}

export function FichaComposerContent({
  id,
  doc,
  client,
  toast,
  onClose,
}: {
  id: string
  doc: FichaDoc | null
  client: SanityClient
  toast: ToastContextValue
  onClose: () => void
}) {
  // Deliberately NOT mirrored into composerStore: see the privacy note above.
  const [recipientName, setRecipientName] = useState('')
  const [locale, setLocale] = useState<FichaLocale>('es')
  const [priceAcknowledged, setPriceAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)

  const hiddenPrice = doc?.ocultarPrecio === true
  const recipient = recipientName.trim()
  const canConfirm =
    recipient !== '' && !loading && (!hiddenPrice || priceAcknowledged)

  const generate = async () => {
    // Guard again here: a double click must not fire two renders even if the
    // disabled state has not repainted yet.
    if (!canConfirm) return
    setLoading(true)

    try {
      // `perspective: raw` is required, not incidental: the query matches
      // `_id in [$id, "drafts." + $id]`, and under a published perspective the
      // draft form is invisible — an off-market listing that has never been
      // published would resolve to nothing at all.
      const data = await client.fetch(
        FICHA_QUERY,
        {id, locale},
        {perspective: 'raw'},
      )

      if (!data?.property) {
        throw new Error(
          'No se ha encontrado la propiedad. Guarda los cambios e inténtalo de nuevo.',
        )
      }

      if (!data.registration?.aicat) {
        throw new Error(
          'Ningún agente tiene número AICAT en el Studio. El pie de la ficha no puede ' +
            'generarse sin la línea de registro, obligatoria en la publicidad inmobiliaria ' +
            'en Catalunya. Añádelo en Equipo y vuelve a intentarlo.',
        )
      }

      // Loaded on demand: @react-pdf/renderer is heavy and nothing else in the
      // Studio needs it, so it stays out of the initial bundle.
      const [{pdf}, {FichaPropiedad}] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../ficha/FichaPropiedad'),
      ])

      const blob = await pdf(
        <FichaPropiedad
          property={data.property}
          registration={data.registration}
          locale={locale}
          recipientName={recipient}
        />,
      ).toBlob()

      const slug = data.property.slug || doc?.slug?.current || id
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `casa-madre-${slug}-${locale}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Revoking synchronously can abort the download in some browsers, so let
      // it start first.
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      toast.push({
        status: 'success',
        title: 'Ficha generada',
        description: `casa-madre-${slug}-${locale}.pdf`,
      })
      onClose()
    } catch (error) {
      // Surface the real reason — never a silent failure or a console-only log.
      toast.push({
        status: 'error',
        title: 'No se ha podido generar la ficha',
        description: error instanceof Error ? error.message : String(error),
        duration: 20000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack space={4}>
      <Stack space={3}>
        <Text size={1} weight="medium">
          Destinatario
        </Text>
        <TextInput
          value={recipientName}
          maxLength={RECIPIENT_MAX}
          disabled={loading}
          placeholder="Nombre de quien recibe la ficha"
          onChange={(event) =>
            setRecipientName(event.currentTarget.value.slice(0, RECIPIENT_MAX))
          }
        />
        <Text size={1} muted>
          Aparece en el pie de confidencialidad. Solo se usa para generar este
          PDF: no se guarda en Sanity ni en ningún otro sitio.
        </Text>
      </Stack>

      <Stack space={3}>
        <Text size={1} weight="medium">
          Idioma
        </Text>
        <Flex gap={4}>
          {LOCALES.map((option) => (
            <Flex key={option.value} align="center" gap={2}>
              <Radio
                id={`ficha-locale-${option.value}`}
                name="ficha-locale"
                checked={locale === option.value}
                disabled={loading}
                onChange={() => setLocale(option.value)}
              />
              <Text as="label" htmlFor={`ficha-locale-${option.value}`} size={1}>
                {option.title}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Stack>

      {hiddenPrice && (
        <Card padding={3} radius={2} shadow={1} tone="caution">
          <Stack space={3}>
            <Flex gap={2} align="flex-start">
              <Text size={1}>
                <WarningOutlineIcon />
              </Text>
              <Text size={1}>
                Esta propiedad tiene el precio oculto en la web, pero la ficha
                imprime el precio real.
              </Text>
            </Flex>
            <Flex gap={2} align="center">
              <Checkbox
                id="ficha-price-ack"
                checked={priceAcknowledged}
                disabled={loading}
                onChange={(event) =>
                  setPriceAcknowledged(event.currentTarget.checked)
                }
              />
              <Text as="label" htmlFor="ficha-price-ack" size={1}>
                Lo entiendo, incluir el precio real
              </Text>
            </Flex>
          </Stack>
        </Card>
      )}

      <Flex justify="flex-end" gap={3} marginTop={2}>
        <Button
          text="Cancelar"
          mode="ghost"
          onClick={onClose}
          disabled={loading}
        />
        <Button
          text={loading ? 'Generando…' : 'Generar ficha'}
          tone="primary"
          icon={loading ? undefined : DocumentPdfIcon}
          onClick={generate}
          disabled={!canConfirm}
        />
      </Flex>

      {loading && (
        <Flex align="center" justify="center" gap={3} paddingY={2}>
          <Spinner muted />
          <Box>
            <Text size={1} muted>
              Descargando imágenes y componiendo el PDF…
            </Text>
          </Box>
        </Flex>
      )}
    </Stack>
  )
}

/**
 * The action: a thin trigger that owns no dialog and no state, plus the
 * pre-flight checks. Both blocks disable the button and explain themselves in
 * the tooltip, so nothing fails after the editor has typed a name.
 */
const GenerateFichaAction: DocumentActionComponent = (props) => {
  const {id, type, draft, published, onComplete} = props
  const doc = (draft ?? published) as FichaDoc | null

  const missingLegal = assertLegalDataComplete()
  const missingEnergy = !doc?.energyRating

  const blocked =
    missingLegal.length > 0
      ? `La ficha lleva un bloque de identificación legal que no puede ir incompleto. ` +
        `Faltan estos datos de la empresa: ${missingLegal.join(', ')}.`
      : missingEnergy
        ? 'Añade la calificación energética antes de generar la ficha: el RD 390/2021 ' +
          'la exige en toda publicidad de venta y alquiler.'
        : null

  return {
    label: 'Generar ficha PDF',
    icon: DocumentPdfIcon,
    disabled: blocked !== null,
    title: blocked ?? undefined,
    onHandle: () => {
      openComposer({kind: 'ficha', id, type})
      onComplete()
    },
  }
}

export const generateFichaAction = GenerateFichaAction
