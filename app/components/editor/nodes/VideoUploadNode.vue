<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'
import type { Video } from '#shared/types/entities/video'

const props = defineProps<NodeViewProps>()

const { editor, node, getPos } = props

const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const altText = ref('')
const selectedFile = ref<File | null>(null)

watch(selectedFile, async (file) => {
  if (!file || !editor || typeof getPos !== 'function') return

  isUploading.value = true
  uploadError.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)
    if (altText.value) {
      formData.append('altText', altText.value)
    }

    const response = await $fetch<Video>('/api/v1/videos', {
      method: 'POST',
      body: formData,
    })

    // Replace the upload node with a video element
    // Note: TipTap doesn't have a default video node, so we'll insert a link or custom video node
    // For now, we'll insert the video as a link with video icon
    const pos = getPos()
    if (typeof pos === 'number') {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContent({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '🎥 Video: ',
            },
            {
              type: 'text',
              text: response.altText || altText.value || 'Untitled Video',
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
            },
          ],
        })
        .run()
    }
  } catch (error: any) {
    uploadError.value = error?.data?.statusMessage || error?.message || 'Failed to upload video'
    console.error('Video upload failed:', error)
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
  <NodeViewWrapper class="video-upload-node">
    <div class="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-video" class="w-4 h-4" />
          <span>Video Upload</span>
        </div>
        
        <UFileUpload
          v-model="selectedFile"
          :multiple="false"
          accept="video/*"
          :max-size="64 * 1024 * 1024"
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
                {{ isUploading ? 'Uploading...' : 'Click or drag video here' }}
              </span>
              <span class="text-xs text-gray-400">
                Max size: 64MB
              </span>
            </div>
          </template>
        </UFileUpload>
        
        <UInput
          v-model="altText"
          placeholder="Alt text (optional)"
          size="sm"
          :disabled="isUploading"
          class="w-full"
        />
        
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
.video-upload-node {
  margin: 0.5rem 0;
}
</style>
