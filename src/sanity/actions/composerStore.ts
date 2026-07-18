import {useCallback, useSyncExternalStore} from 'react'

/**
 * Module-level store driving the AI composer dialogs.
 *
 * Why this exists: Sanity's document-action machinery unmounts action
 * components at will — reliably in the first seconds of a brand-new document,
 * when the eager first draft is persisted. A dialog returned from the action's
 * description dies with it (it can even be torn down before it first renders),
 * which is why the composer dialog used to flash and vanish on new documents.
 *
 * The fix: the dialog is NOT owned by the action. A stable Studio-level layout
 * component (ComposerDialogHost, registered in sanity.config.ts) subscribes to
 * this store and renders the dialog; the action's onHandle only writes here.
 * The host never unmounts, so the dialog survives any action churn.
 *
 * The store also mirrors the dialog's form fields (notes, results…) so closing
 * and reopening a composer — voluntarily or not — restores the agent's input.
 */

export type ComposerKind = 'article' | 'property'

export type ActiveComposer = {
  kind: ComposerKind
  /** Published document id (no `drafts.` prefix), as passed to actions. */
  id: string
  /** Schema type name of the document. */
  type: string
}

let active: ActiveComposer | null = null
const listeners = new Set<() => void>()
const fields = new Map<string, Map<string, unknown>>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function composerKey(doc: {type: string; id: string}): string {
  return `${doc.type}:${doc.id}`
}

export function openComposer(next: ActiveComposer) {
  active = next
  notify()
}

export function closeComposer() {
  active = null
  notify()
}

/** The currently open composer (null when no dialog is shown). */
export function useActiveComposer(): ActiveComposer | null {
  const subscribe = useCallback((callback: () => void) => {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  }, [])
  return useSyncExternalStore(subscribe, () => active)
}

/** Read a mirrored form value (used to seed local state when (re)opening). */
export function getComposerField<T>(key: string, name: string, fallback: T): T {
  const bag = fields.get(key)
  return bag && bag.has(name) ? (bag.get(name) as T) : fallback
}

/** Mirror a form value. Does not trigger renders — local state drives the UI. */
export function setComposerField(key: string, name: string, value: unknown) {
  let bag = fields.get(key)
  if (!bag) {
    bag = new Map()
    fields.set(key, bag)
  }
  bag.set(name, value)
}

/** Forget a document's mirrored fields (after a successful insert + close). */
export function clearComposer(key: string) {
  fields.delete(key)
}
