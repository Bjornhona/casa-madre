import {Box, Dialog, ToastProvider, useToast} from '@sanity/ui'
import {
  useClient,
  useDocumentOperation,
  useEditState,
  type LayoutProps,
} from 'sanity'
import {apiVersion} from '../env'
import {
  closeComposer,
  composerKey,
  useActiveComposer,
  type ActiveComposer,
} from './composerStore'
import {PropertyComposerContent, type PropertyDoc} from './generatePropertyAction'
import {JournalComposerContent} from './generateDraftAction'

/**
 * Studio-level host for the AI composer dialogs (registered as
 * studio.components.layout in sanity.config.ts).
 *
 * The dialogs deliberately do NOT live in the document actions: Sanity can
 * unmount an action component at any moment (reliably in the first seconds of
 * a brand-new document, when its eager first draft is persisted), killing any
 * dialog the action returned — sometimes before it even renders. This host
 * sits outside that machinery and never unmounts, so a composer opened via
 * composerStore stays open until the user closes it.
 */

export function ComposerLayout(props: LayoutProps) {
  return (
    <>
      {props.renderDefault(props)}
      {/* Own ToastProvider: the Studio's sits inside renderDefault's tree. */}
      <ToastProvider paddingY={7} zOffset={[100, 11000]}>
        <ComposerDialogHost />
      </ToastProvider>
    </>
  )
}

function ComposerDialogHost() {
  const active = useActiveComposer()
  if (!active) return null
  // Keyed per document so switching documents never leaks dialog state.
  return <ComposerDialog key={composerKey(active)} active={active} />
}

function ComposerDialog({active}: {active: ActiveComposer}) {
  const {kind, id, type} = active
  const {patch} = useDocumentOperation(id, type)
  const client = useClient({apiVersion})
  const toast = useToast()
  const editState = useEditState(id, type)
  const doc = editState.draft || editState.published
  const stateKey = composerKey(active)

  return (
    <Dialog
      id="ai-composer-dialog"
      header={
        kind === 'property' ? '✦ Generar ficha con IA' : '✦ Generar borrador con IA'
      }
      width={1}
      onClose={closeComposer}
    >
      <Box padding={4}>
        {kind === 'property' ? (
          <PropertyComposerContent
            stateKey={stateKey}
            doc={(doc as PropertyDoc | null) ?? null}
            client={client}
            patch={patch}
            toast={toast}
            onClose={closeComposer}
          />
        ) : (
          <JournalComposerContent
            stateKey={stateKey}
            initialCategory={
              (doc as {category?: string} | null)?.category ?? 'barrios'
            }
            patch={patch}
            toast={toast}
            onClose={closeComposer}
          />
        )}
      </Box>
    </Dialog>
  )
}
