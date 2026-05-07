import { Extension } from '@tiptap/core'

export interface CompletionStorage {
  visible: boolean
  position: number | undefined
  suggestion: string
  setSuggestion: (text: string) => void
  clearSuggestion: () => void
}

export const Completion = Extension.create({
  name: 'completion',

  addStorage() {
    return {
      visible: false,
      position: undefined,
      suggestion: '',
      setSuggestion: function(this: CompletionStorage, text: string) {
        this.suggestion = text
      },
      clearSuggestion: function(this: CompletionStorage) {
        this.suggestion = ''
        this.visible = false
        this.position = undefined
      }
    }
  },

  addCommands() {
    return {
      acceptCompletion: () => ({ editor }: { editor: any }) => {
        const storage = editor.storage.completion as CompletionStorage
        if (storage?.suggestion) {
          editor.chain().insertContent(storage.suggestion).run()
          storage.clearSuggestion()
          return true
        }
        return false
      },
      dismissCompletion: () => ({ editor }: { editor: any }) => {
        const storage = editor.storage.completion as CompletionStorage
        storage?.clearSuggestion()
        return true
      }
    } as any
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }: { editor: any }) => {
        const storage = editor.storage.completion as CompletionStorage
        if (storage?.visible && storage?.suggestion) {
          return editor.commands.acceptCompletion()
        }
        return false
      },
      Escape: ({ editor }: { editor: any }) => {
        const storage = editor.storage.completion as CompletionStorage
        if (storage?.visible) {
          return editor.commands.dismissCompletion()
        }
        return false
      }
    } as any
  }
})
