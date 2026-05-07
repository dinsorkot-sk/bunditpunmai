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

    const response = await $fetch('/api/v1/images', {
      method: 'POST',
      body: formData
    }) as { url: string }

    const pos = props.getPos()
    if (typeof pos === 'number') {
      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .setImage({ src: response.url })
        .run()
    }
  } catch (error) {
    console.error('Image upload failed:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <NodeViewWrapper>
    <UFileUpload
      v-model="file"
      accept="image/*"
      label="Upload an image"
      description="SVG, PNG, JPG or GIF (max. 8MB)"
      :preview="false"
      class="min-h-48"
    >
      <template #leading>
        <UAvatar
          :icon="loading ? 'i-lucide-loader-circle' : 'i-lucide-image'"
          size="xl"
          :ui="{ icon: [loading && 'animate-spin'] }"
        />
      </template>
    </UFileUpload>
  </NodeViewWrapper>
</template>
