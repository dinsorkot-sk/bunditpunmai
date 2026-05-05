<script lang="ts">
import { type PropType } from 'vue'
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'

export default {
    components: { NodeViewWrapper },
    props: {
        editor: { type: Object as PropType<NodeViewProps['editor']>, required: true },
        node: { type: Object as PropType<NodeViewProps['node']>, required: true },
        decorations: { type: Array as PropType<NodeViewProps['decorations']>, required: true },
        selected: { type: Boolean as PropType<NodeViewProps['selected']>, required: true },
        extension: { type: Object as PropType<NodeViewProps['extension']>, required: true },
        getPos: { type: Function as PropType<NodeViewProps['getPos']>, required: true },
        updateAttributes: { type: Function as PropType<NodeViewProps['updateAttributes']>, required: true },
        deleteNode: { type: Function as PropType<NodeViewProps['deleteNode']>, required: true },
    },
    data() {
        return {
            file: null as File | null,
            loading: false,
        }
    },
    watch: {
        async file(newFile: File | null) {
            if (!newFile) return
            this.loading = true
            const reader = new FileReader()
            reader.onload = async (e) => {
                const dataUrl = e.target?.result as string
                if (!dataUrl) {
                    this.loading = false
                    return
                }
                await new Promise(resolve => setTimeout(resolve, 1000))
                const pos = this.getPos()
                if (typeof pos !== 'number') {
                    this.loading = false
                    return
                }
                this.editor
                    .chain()
                    .focus()
                    .deleteRange({ from: pos, to: pos + 1 })
                    .setImage({ src: dataUrl })
                    .run()
                this.loading = false
            }
            reader.readAsDataURL(newFile)
        },
    },
}
</script>

<template>
    <NodeViewWrapper>
        <UFileUpload v-model="file" accept="image/*" label="Upload an image"
            description="SVG, PNG, JPG or GIF (max. 2MB)" :preview="false" class="min-h-48">
            <template #leading>
                <UAvatar :icon="loading ? 'i-lucide-loader-circle' : 'i-lucide-image'" size="xl"
                    :ui="{ icon: [loading && 'animate-spin'] }" />
            </template>
        </UFileUpload>
    </NodeViewWrapper>
</template>