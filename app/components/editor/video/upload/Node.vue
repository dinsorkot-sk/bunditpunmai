<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const file = ref<File | null>(null)
const loading = ref(false)

watch(file, async (newFile) => {
  if (!newFile) return

  loading.value = true

  try {
    const formData = new FormData()
    formData.append('file', newFile)

    const response = await $fetch<{ url: string }>('/api/v1/videos', {
      method: 'POST',
      body: formData
    })

    const pos = props.getPos()
    if (typeof pos === 'number') {
      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .setVideo({ src: response.url })
        .run()
    }
  } catch (error) {
    console.error('Video upload failed:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <NodeViewWrapper>
    <UFileUpload
      v-model="file"
      accept="video/*"
      label="Upload a video"
      description="MP4, WebM or Ogg (max. 64MB)"
      :preview="false"
      class="min-h-48"
    >
      <template #leading>
        <UAvatar
          :icon="loading ? 'i-lucide-loader-circle' : 'i-lucide-video'"
          size="xl"
          :ui="{ icon: [loading && 'animate-spin'] }"
        />
      </template>
    </UFileUpload>
  </NodeViewWrapper>
</template>
