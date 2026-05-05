import type { Editor } from '@tiptap/vue-3'
import type { Ref } from 'vue'

/**
 * Interface for custom editor handlers
 */
export interface EditorCustomHandler {
  canExecute: () => boolean
  execute: () => void
  isActive: () => boolean
  isDisabled: () => boolean
}

/**
 * Interface for all custom editor handlers
 */
export interface EditorCustomHandlers {
  imageUpload: EditorCustomHandler
  videoUpload: EditorCustomHandler
  resourceUpload: EditorCustomHandler
}

/**
 * Composable that provides custom media handlers for the TipTap editor
 */
export function useEditorMediaHandlers(editor: Ref<Editor | undefined>): EditorCustomHandlers {
  const imageUpload: EditorCustomHandler = {
    canExecute: () => {
      if (!editor.value) return false
      return editor.value.can().insertContent({ type: 'imageUpload' })
    },
    execute: () => {
      if (!editor.value) return
      editor.value.chain().focus().insertImageUpload().run()
    },
    isActive: () => {
      if (!editor.value) return false
      return editor.value.isActive('imageUpload')
    },
    isDisabled: () => {
      if (!editor.value) return true
      return !editor.value.can().insertContent({ type: 'imageUpload' })
    },
  }

  const videoUpload: EditorCustomHandler = {
    canExecute: () => {
      if (!editor.value) return false
      return editor.value.can().insertContent({ type: 'videoUpload' })
    },
    execute: () => {
      if (!editor.value) return
      editor.value.chain().focus().insertVideoUpload().run()
    },
    isActive: () => {
      if (!editor.value) return false
      return editor.value.isActive('videoUpload')
    },
    isDisabled: () => {
      if (!editor.value) return true
      return !editor.value.can().insertContent({ type: 'videoUpload' })
    },
  }

  const resourceUpload: EditorCustomHandler = {
    canExecute: () => {
      if (!editor.value) return false
      return editor.value.can().insertContent({ type: 'resourceUpload' })
    },
    execute: () => {
      if (!editor.value) return
      editor.value.chain().focus().insertResourceUpload().run()
    },
    isActive: () => {
      if (!editor.value) return false
      return editor.value.isActive('resourceUpload')
    },
    isDisabled: () => {
      if (!editor.value) return true
      return !editor.value.can().insertContent({ type: 'resourceUpload' })
    },
  }

  return {
    imageUpload,
    videoUpload,
    resourceUpload,
  } satisfies EditorCustomHandlers
}
