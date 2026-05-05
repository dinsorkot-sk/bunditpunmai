<script lang="ts">
import { type PropType } from 'vue'
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'

export default {
    components: { NodeViewWrapper },
    emits: ['select'],
    props: {
        editor: { type: Object as PropType<NodeViewProps['editor']>, default: null },
        node: { type: Object as PropType<NodeViewProps['node']>, default: null },
        decorations: { type: Array as PropType<NodeViewProps['decorations']>, default: () => [] },
        selected: { type: Boolean as PropType<NodeViewProps['selected']>, default: false },
        extension: { type: Object as PropType<NodeViewProps['extension']>, default: null },
        getPos: { type: Function as PropType<NodeViewProps['getPos']>, default: null },
        updateAttributes: { type: Function as PropType<NodeViewProps['updateAttributes']>, default: null },
        deleteNode: { type: Function as PropType<NodeViewProps['deleteNode']>, default: null },
    },
    data() {
        return {
            file: null as File | null,
            loading: false,
        }
    },
    computed: {
        isNodeView() {
            return !!this.editor && !!this.getPos
        },
    },
    watch: {
        async file(newFile: File | null) {
            if (!newFile) return
            if (!this.isNodeView) {
                this.$emit('select', newFile)
                this.file = null
                return
            }

            this.loading = true
            const reader = new FileReader()
            reader.onload = async (e) => {
                const dataUrl = e.target?.result as string
                if (!dataUrl) {
                    this.loading = false
                    return
                }
                await new Promise(resolve => setTimeout(resolve, 1000))
                const pos = this.getPos?.()
                if (typeof pos !== 'number') {
                    this.loading = false
                    return
                }
                this.editor!
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
    methods: {
        open() {
            const input = this.$el?.querySelector?.('input[type="file"]') as HTMLInputElement | undefined
            input?.click()
        },
    },
}
</script>

<template>
    <NodeViewWrapper v-if="isNodeView">
        <UFileUpload v-model="file" accept="image/*" label="Upload an image"
            description="SVG, PNG, JPG or GIF (max. 2MB)" :preview="false" class="min-h-48">
            <template #leading>
                <UAvatar :icon="loading ? 'i-lucide-loader-circle' : 'i-lucide-image'" size="xl"
                    :ui="{ icon: [loading && 'animate-spin'] }" />
            </template>
        </UFileUpload>
    </NodeViewWrapper>

    <UFileUpload v-else v-model="file" accept="image/*" :preview="false" class="hidden" />
</template>
