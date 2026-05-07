<script setup lang="ts">
import { ref } from 'vue'
import type { EditorCustomHandlers, EditorToolbarItem } from '@nuxt/ui'
import type { Editor } from '@tiptap/vue-3'
import { Node } from '@tiptap/core'

// Define the ImageUpload TipTap extension
const ImageUpload = Node.create({
    name: 'imageUpload',
    group: 'block',
    atom: true,

    parseHTML() {
        return [{ tag: 'image-upload' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['image-upload', HTMLAttributes]
    }
})

const value = ref(`# Image Upload
...
`)

const customHandlers = {
    imageUpload: {
        canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
        execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
        isActive: (editor: Editor) => editor.isActive('imageUpload'),
        isDisabled: undefined
    }
} satisfies EditorCustomHandlers

const items = [[{
    kind: 'imageUpload',
    icon: 'i-lucide-image',
    variant: 'soft'
}], [{
    icon: 'i-lucide-heading',
    content: { align: 'start' },
    items: [{
        kind: 'heading', level: 1, icon: 'i-lucide-heading-1', label: 'Heading 1'
    }, {
        kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Heading 2'
    }, {
        kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Heading 3'
    }, {
        kind: 'heading', level: 4, icon: 'i-lucide-heading-4', label: 'Heading 4'
    }]
}], [{
    kind: 'mark', mark: 'bold', icon: 'i-lucide-bold'
}, {
    kind: 'mark', mark: 'italic', icon: 'i-lucide-italic'
}, {
    kind: 'mark', mark: 'underline', icon: 'i-lucide-underline'
}, {
    kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough'
}, {
    kind: 'mark', mark: 'code', icon: 'i-lucide-code'
}]] satisfies EditorToolbarItem<typeof customHandlers>[][]
</script>

<template>
    <UCard :ui="{ body: 'sm:p-0 p-0' }">
        <UEditor v-slot="{ editor }" v-model="value" :extensions="[ImageUpload]" :handlers="customHandlers"
            content-type="markdown" :ui="{ base: 'p-8 sm:px-16' }" class="w-full min-h-74">
            <UEditorToolbar :editor="editor" :items="items"
                class="border-b border-muted py-2 px-8 sm:px-16 overflow-x-auto" />
        </UEditor>
    </UCard>
</template>