<script lang="ts">
import { useEditor } from '~/composables/editor/useEditor'

export default {
    props: {
        modelValue: {
            type: String,
            default: '',
        },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const {
            value,
            itemToolbars,
            mediaTools,
            imageUpload,
            videoUpload,
            resourceInput,
            openMediaPicker,
            handleMediaUpload,
            handleMediaFile,
            isUploading,
        } = useEditor(props.modelValue)

        watch(value, (newValue) => {
            emit('update:modelValue', newValue)
        })

        watch(() => props.modelValue, (newValue) => {
            if (newValue !== value.value) {
                value.value = newValue
            }
        })

        return {
            value,
            itemToolbars,
            mediaTools,
            imageUpload,
            videoUpload,
            resourceInput,
            openMediaPicker,
            handleMediaUpload,
            handleMediaFile,
            isUploading,
        }
    },
}
</script>

<template>
    <UCard :ui="{ body: 'sm:p-0 p-0' }">
        <UEditor v-slot="{ editor }" v-model="value" content-type="markdown" class="w-full min-h-21">
            <div class="flex items-center gap-1 sm:px-8 px-2 overflow-x-auto border-b border-default">
                <UEditorToolbar :editor="editor" :items="itemToolbars" class="border-0 px-0 shrink-0" />

                <USeparator orientation="vertical" class="h-6" />

                <UTooltip v-for="tool in mediaTools" :key="tool.kind" :text="tool.label">
                    <UButton
                        :icon="tool.icon"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        :loading="isUploading(tool.kind)"
                        :aria-label="tool.label"
                        @click="openMediaPicker(tool.kind)"
                    />
                </UTooltip>
            </div>

            <EditorImageUploadNode ref="imageUpload" @select="handleMediaUpload(editor, 'image', $event)" />
            <EditorVideoUpload ref="videoUpload" @select="handleMediaUpload(editor, 'video', $event)" />
            <input
                ref="resourceInput"
                type="file"
                class="hidden"
                @change="handleMediaFile(editor, 'resource', $event)"
            >

            <UEditorDragHandle :editor="editor" />
        </UEditor>
    </UCard>
</template>
