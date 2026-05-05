<script lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

export default {
    setup() {
        return {
        }
    },
    data() {
        return {
            value: `# Drag Handle\nHover over the left side of this block to see the drag handle appear and reorder blocks.`,
            itemToolbars: [
                // History controls
                [{
                    kind: 'undo',
                    icon: 'i-lucide-undo',
                    tooltip: { text: 'Undo' }
                }, {
                    kind: 'redo',
                    icon: 'i-lucide-redo',
                    tooltip: { text: 'Redo' }
                }],
                // Block types
                [{
                    icon: 'i-lucide-heading',
                    tooltip: { text: 'Headings' },
                    content: {
                        align: 'start'
                    },
                    items: [{
                        kind: 'heading',
                        level: 1,
                        icon: 'i-lucide-heading-1',
                        label: 'Heading 1'
                    }, {
                        kind: 'heading',
                        level: 2,
                        icon: 'i-lucide-heading-2',
                        label: 'Heading 2'
                    }, {
                        kind: 'heading',
                        level: 3,
                        icon: 'i-lucide-heading-3',
                        label: 'Heading 3'
                    }, {
                        kind: 'heading',
                        level: 4,
                        icon: 'i-lucide-heading-4',
                        label: 'Heading 4'
                    }]
                }, {
                    icon: 'i-lucide-list',
                    tooltip: { text: 'Lists' },
                    content: {
                        align: 'start'
                    },
                    items: [{
                        kind: 'bulletList',
                        icon: 'i-lucide-list',
                        label: 'Bullet List'
                    }, {
                        kind: 'orderedList',
                        icon: 'i-lucide-list-ordered',
                        label: 'Ordered List'
                    }]
                }, {
                    kind: 'blockquote',
                    icon: 'i-lucide-text-quote',
                    tooltip: { text: 'Blockquote' }
                }, {
                    kind: 'codeBlock',
                    icon: 'i-lucide-square-code',
                    tooltip: { text: 'Code Block' }
                }, {
                    kind: 'horizontalRule',
                    icon: 'i-lucide-separator-horizontal',
                    tooltip: { text: 'Horizontal Rule' }
                }],
                // Text formatting
                [{
                    kind: 'mark',
                    mark: 'bold',
                    icon: 'i-lucide-bold',
                    tooltip: { text: 'Bold' }
                }, {
                    kind: 'mark',
                    mark: 'italic',
                    icon: 'i-lucide-italic',
                    tooltip: { text: 'Italic' }
                }, {
                    kind: 'mark',
                    mark: 'underline',
                    icon: 'i-lucide-underline',
                    tooltip: { text: 'Underline' }
                }, {
                    kind: 'mark',
                    mark: 'strike',
                    icon: 'i-lucide-strikethrough',
                    tooltip: { text: 'Strikethrough' }
                }, {
                    kind: 'mark',
                    mark: 'code',
                    icon: 'i-lucide-code',
                    tooltip: { text: 'Code' }
                }],
                // Link
                [{
                    kind: 'link',
                    icon: 'i-lucide-link',
                    tooltip: { text: 'Link' }
                }],
                // Text alignment
                [{
                    icon: 'i-lucide-align-justify',
                    tooltip: { text: 'Text Align' },
                    content: {
                        align: 'end'
                    },
                    items: [{
                        kind: 'textAlign',
                        align: 'left',
                        icon: 'i-lucide-align-left',
                        label: 'Align Left'
                    }, {
                        kind: 'textAlign',
                        align: 'center',
                        icon: 'i-lucide-align-center',
                        label: 'Align Center'
                    }, {
                        kind: 'textAlign',
                        align: 'right',
                        icon: 'i-lucide-align-right',
                        label: 'Align Right'
                    }, {
                        kind: 'textAlign',
                        align: 'justify',
                        icon: 'i-lucide-align-justify',
                        label: 'Align Justify'
                    }]
                }]
            ] as EditorToolbarItem[][] 
        }
    },
}
</script>
<template>
    <UCard :ui="{ body: 'sm:p-0 p-0' }">
        <UEditor v-slot="{ editor }" v-model="value" content-type="markdown" class="w-full min-h-21">
            <UEditorToolbar :editor="editor" :items="itemToolbars" class="sm:px-8 overflow-x-auto" />
            <UEditorDragHandle :editor="editor" />
        </UEditor>
    </UCard>
</template>