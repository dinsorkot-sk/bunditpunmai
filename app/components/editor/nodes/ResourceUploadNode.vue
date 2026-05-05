<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'
import type { Resource } from '#shared/types/entities/resource'

const props = defineProps<NodeViewProps>()

const { editor, node, getPos } = props

const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const title = ref('')
const description = ref('')
const selectedFile = ref<File | null>(null)

watch(selectedFile, async (file) => {
  if (!file || !editor || typeof getPos !== 'function') return

  if (!title.value || !description.value) {
    uploadError.value = 'Title and description are required'
    selectedFile.value = null
    return
  }

  isUploading.value = true
  uploadError.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title.value)
    formData.append('description', description.value)

    const response = await $fetch<Resource>('/api/v1/resources', {
      method: 'POST',
      body: formData,
    })

    // Replace the upload node with a link to the resource
    const pos = getPos()
    if (typeof pos === 'number') {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContent({
          type: 'text',
          text: response.title,
          marks: [
            {
              type: 'link',
              attrs: {
                href: response.url,
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            },
          ],
        })
        .insertContent({
          type: 'text',
          text: ' ',
        })
        .run()
    }
  } catch (error: any) {
    uploadError.value = error?.data?.statusMessage || error?.message || 'Failed to upload resource'
    console.error('Resource upload failed:', error)
  } finally {
    isUploading.value = false
    selectedFile.value = null
  }
})

const handleCancel = () => {
  if (!editor || typeof getPos !== 'function') return

  const pos = getPos()
  if (typeof pos !== 'number') return

  editor
    .chain()
    .focus()
    .deleteRange({ from: pos, to: pos + node.nodeSize })
    .run()
}
</script>

<template>
  <NodeViewWrapper class="resource-upload-node">
    <div class="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-file" class="w-4 h-4" />
          <span>Resource Upload</span>
        </div>
        
        <div class="flex flex-col gap-2">
          <UInput
            v-model="title"
            placeholder="Title *"
            size="sm"
            :disabled="isUploading"
            required
          />
          <UTextarea
            v-model="description"
            placeholder="Description *"
            size="sm"
            :disabled="isUploading"
            :rows="2"
            required
          />
        </div>
        
        <UFileUpload
          v-model="selectedFile"
          :multiple="false"
          :max-size="32 * 1024 * 1024"
          :disabled="isUploading"
        >
          <template #default>
            <div class="flex flex-col items-center gap-2 py-4">
              <UIcon
                :name="isUploading ? 'i-lucide-loader-2' : 'i-lucide-upload'"
                :class="isUploading ? 'animate-spin' : ''"
                class="w-8 h-8 text-gray-400"
              />
              <span class="text-sm text-gray-500">
                {{ isUploading ? 'Uploading...' : 'Click or drag file here' }}
              </span>
              <span class="text-xs text-gray-400">
                Max size: 32MB
              </span>
            </div>
          </template>
        </UFileUpload>
        
        <UAlert
          v-if="uploadError"
          color="error"
          variant="soft"
          :title="uploadError"
          icon="i-lucide-alert-circle"
          class="mt-2"
        />
        
        <div class="flex justify-end gap-2 mt-2">
          <UButton
            size="sm"
            variant="ghost"
            color="neutral"
            :disabled="isUploading"
            @click="handleCancel"
          >
            Cancel
          </UButton>
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<style scoped>
.resource-upload-node {
  margin: 0.5rem 0;
}
</style>
