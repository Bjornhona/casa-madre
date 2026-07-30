import {useCallback, useEffect, useRef, useState} from 'react'
import {Box, Button, Card, Flex, Spinner, Stack, Text} from '@sanity/ui'
import {UploadIcon} from '@sanity/icons'
import {set, type ObjectInputProps} from 'sanity'

/**
 * Custom input for the `cloudinaryAsset` object type.
 *
 * Videos live on Cloudinary rather than Sanity because Cloudinary transcodes
 * on upload (the source files are vertical phone recordings from owner
 * interviews). Uploading happens through Cloudinary's Upload Widget with an
 * UNSIGNED preset, so editors never need a Cloudinary account and no API
 * secret ever reaches the browser — the preset name and cloud name are both
 * public by design.
 *
 * On success we map Cloudinary's snake_case response to camelCase and write
 * the whole object in a single patch. All UI is in Spanish for the editorial
 * team.
 */

const WIDGET_SRC = 'https://upload-widget.cloudinary.com/latest/global/all.js'

/** Unsigned preset configured in the Cloudinary console. Not a secret. */
const UPLOAD_PRESET = 'casamadre_journal'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

/**
 * Hard ceiling handed to the widget so an editor is told before spending ten
 * minutes uploading. The schema rules in videoBlock.ts remain the backstop for
 * anything that arrives by another route (import, direct patch).
 */
const MAX_BYTES = 50 * 1024 * 1024

export type CloudinaryAssetValue = {
  _type?: 'cloudinaryAsset'
  publicId?: string
  secureUrl?: string
  format?: string
  width?: number
  height?: number
  duration?: number
  bytes?: number
}

type CloudinaryUploadInfo = {
  public_id?: string
  secure_url?: string
  format?: string
  width?: number
  height?: number
  duration?: number | null
  bytes?: number
}

type CloudinaryUploadResult = {event?: string; info?: unknown}

type CloudinaryUploadError = {statusText?: string; message?: string} | string | null

type CloudinaryWidget = {
  open: () => void
  destroy: (options?: {removeThumbnails?: boolean}) => void
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (
          error: CloudinaryUploadError,
          result?: CloudinaryUploadResult
        ) => void
      ) => CloudinaryWidget
    }
  }
}

/**
 * The widget ships English copy only (its text.json exposes just `en`), so the
 * Spanish strings are supplied here. Only the keys reachable with
 * `sources: ['local']` are translated.
 */
const WIDGET_TEXT_ES = {
  or: 'O',
  back: 'Atrás',
  close: 'Cerrar',
  menu: {files: 'Mis archivos'},
  local: {
    browse: 'Examinar',
    dd_title_single: 'Arrastra aquí el vídeo',
    drop_title_single: 'Suelta el archivo para subirlo',
    choose_files_sr: 'o elige un archivo para subir',
  },
  queue: {
    title: 'Subida en curso',
    title_uploading: 'Subiendo vídeo',
    mini_title: 'Subido',
    mini_title_uploading: 'Subiendo',
    mini_title_processing: 'Procesando',
    show_completed: 'Ver completados',
    retry_failed: 'Reintentar',
    abort_all: 'Cancelar todo',
    upload_more: 'Subir otro',
    done: 'Hecho',
    statuses: {
      uploading: 'Subiendo…',
      processing: 'Procesando…',
      timeout:
        'El archivo es grande y puede tardar un poco en estar disponible.',
      error: 'Error',
      uploaded: 'Hecho',
      aborted: 'Cancelado',
    },
  },
  actions: {upload: 'Subir', next: 'Siguiente', clear_all: 'Vaciar'},
}

let widgetScriptPromise: Promise<void> | null = null

function loadWidgetScript(): Promise<void> {
  if (window.cloudinary?.createUploadWidget) return Promise.resolve()

  if (!widgetScriptPromise) {
    widgetScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${WIDGET_SRC}"]`
      )
      const script = existing ?? document.createElement('script')
      script.addEventListener('load', () => resolve())
      script.addEventListener('error', () =>
        reject(new Error('No se pudo cargar el widget de Cloudinary.'))
      )
      if (!existing) {
        script.src = WIDGET_SRC
        script.async = true
        document.body.appendChild(script)
      }
    }).catch((err: unknown) => {
      // Let a later attempt retry instead of caching the failure forever.
      widgetScriptPromise = null
      throw err
    })
  }

  return widgetScriptPromise
}

/** Poster frame Cloudinary derives from the video itself (`so_auto`). */
function thumbnailUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_auto,c_fit,h_180,q_auto,f_jpg/${publicId}.jpg`
}

function errorMessage(error: CloudinaryUploadError): string {
  if (typeof error === 'string') return error
  return error?.statusText || error?.message || 'Error desconocido.'
}

export function CloudinaryVideoInput(props: ObjectInputProps<CloudinaryAssetValue>) {
  const {value, onChange, readOnly} = props

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const widgetRef = useRef<CloudinaryWidget | null>(null)

  // The Studio can unmount the field while the widget is open; tear it down so
  // no orphaned iframe is left behind.
  useEffect(() => {
    return () => {
      widgetRef.current?.destroy({removeThumbnails: true})
      widgetRef.current = null
    }
  }, [])

  const openWidget = useCallback(async () => {
    setError(null)

    if (!CLOUD_NAME) {
      setError(
        'Falta la variable NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME. Avisa al equipo técnico.'
      )
      return
    }

    try {
      await loadWidgetScript()
    } catch {
      setError(
        'No se pudo cargar el widget de Cloudinary. Comprueba tu conexión e inténtalo de nuevo.'
      )
      return
    }

    const cloudinary = window.cloudinary
    if (!cloudinary) {
      setError('No se pudo iniciar el widget de Cloudinary. Recarga la página.')
      return
    }

    if (!widgetRef.current) {
      widgetRef.current = cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          resourceType: 'video',
          sources: ['local'],
          multiple: false,
          maxFileSize: MAX_BYTES,
          clientAllowedFormats: ['mp4', 'mov', 'm4v', 'webm'],
          language: 'es',
          text: {es: WIDGET_TEXT_ES},
        },
        (uploadError, result) => {
          if (uploadError) {
            setUploading(false)
            setError(`No se pudo subir el vídeo: ${errorMessage(uploadError)}`)
            return
          }

          if (!result) return

          if (result.event === 'upload-added' || result.event === 'queues-start') {
            setUploading(true)
            return
          }

          if (result.event === 'success') {
            const info = result.info as CloudinaryUploadInfo | undefined
            if (!info?.public_id) {
              setUploading(false)
              setError('Cloudinary no devolvió el vídeo. Inténtalo de nuevo.')
              return
            }

            onChange(
              set({
                // Named object type, so the value must carry its own _type.
                _type: 'cloudinaryAsset',
                publicId: info.public_id,
                secureUrl: info.secure_url,
                format: info.format,
                width: info.width,
                height: info.height,
                duration: info.duration ?? undefined,
                bytes: info.bytes,
              })
            )
            setError(null)
            return
          }

          if (
            result.event === 'queues-end' ||
            result.event === 'abort' ||
            result.event === 'close'
          ) {
            setUploading(false)
          }
        }
      )
    }

    widgetRef.current.open()
  }, [onChange])

  const publicId = value?.publicId

  return (
    <Stack gap={3}>
      {publicId && (
        <Card padding={2} radius={2} border>
          <Flex align="center" gap={3}>
            {/* Cloudinary-derived poster frame; next/image doesn't apply inside the Studio. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl(publicId)}
              alt=""
              style={{
                height: 90,
                width: 'auto',
                borderRadius: 3,
                display: 'block',
              }}
            />
            <Stack gap={2} flex={1}>
              <Text size={1} weight="medium" textOverflow="ellipsis">
                {publicId}
              </Text>
              <Text size={1} muted>
                {[
                  value?.format?.toUpperCase(),
                  value?.width && value?.height
                    ? `${value.width}×${value.height}`
                    : null,
                  typeof value?.duration === 'number'
                    ? `${Math.round(value.duration)} s`
                    : null,
                  typeof value?.bytes === 'number'
                    ? `${(value.bytes / (1024 * 1024)).toFixed(1)} MB`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </Stack>
          </Flex>
        </Card>
      )}

      <Flex align="center" gap={3}>
        <Button
          icon={UploadIcon}
          text={publicId ? 'Reemplazar' : 'Subir vídeo'}
          mode="ghost"
          tone="primary"
          disabled={readOnly || uploading}
          onClick={openWidget}
        />
        {uploading && (
          <Flex align="center" gap={2}>
            <Spinner muted size={1} />
            <Text size={1} muted>
              Subiendo vídeo…
            </Text>
          </Flex>
        )}
      </Flex>

      {error && (
        <Card padding={3} radius={2} tone="critical" border>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {!publicId && !error && (
        <Box>
          <Text size={1} muted>
            Formatos aceptados: MP4, MOV, M4V y WEBM. Máximo 50 MB.
          </Text>
        </Box>
      )}
    </Stack>
  )
}
