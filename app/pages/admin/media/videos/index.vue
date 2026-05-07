<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useVideos } from '~/composables/v1/useVideos'

definePageMeta({ layout: 'admin' })

interface ApiVideo {
  id: number
  url: string
  altText: string
  createdAt: string
}

const { videos, loading, total, fetchVideos, createVideo, updateVideo, deleteVideo } = useVideos()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingVideo = ref<ApiVideo | null>(null)
const submitting = ref(false)
const selectedFile = ref<File | null>(null)
const form = ref({ altText: '' })

const columns = computed<TableColumn<ApiVideo>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'url', header: 'URL' },
  { accessorKey: 'altText', header: 'Alt Text' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingVideo.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Video' : 'Upload Video')

function resetForm() {
  form.value = { altText: '' }
  selectedFile.value = null
  editingVideo.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(video: ApiVideo) {
  editingVideo.value = video
  form.value = { altText: video.altText }
  selectedFile.value = null
  showCreateModal.value = true
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] ?? null
  }
}

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    if (isEditing.value && editingVideo.value) {
      if (selectedFile.value) {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('altText', form.value.altText)
        await updateVideo(editingVideo.value.id, formData)
      }
      else {
        await updateVideo(editingVideo.value.id, { altText: form.value.altText })
      }
      toast.add({ title: 'Video updated', color: 'success' })
    }
    else {
      if (!selectedFile.value) {
        alert('Please select a video file')
        submitting.value = false
        return
      }
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('altText', form.value.altText)
      await createVideo(formData)
      toast.add({ title: 'Video uploaded', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchVideos({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save video:', error)
    toast.add({ title: 'Failed to save video', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(video: { id: number }) {
  if (confirm('Delete this video?')) {
    try {
      await deleteVideo(video.id)
      toast.add({ title: 'Video deleted', color: 'success' })
      fetchVideos({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete video:', error)
      toast.add({ title: 'Failed to delete video', color: 'error' })
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => {
  fetchVideos({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchVideos({ limit: limit.value, offset: offset.value })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Videos">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Upload" icon="i-lucide-upload" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="videos" :columns="columns" :loading="loading" sticky>
        <template #url-cell="{ row }">
          <a :href="row.original.url" target="_blank" class="text-primary hover:underline truncate block max-w-xs">
            {{ row.original.url }}
          </a>
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click="openEditModal(row.original)" />
            <UButton icon="i-lucide-trash" variant="ghost" size="xs" color="error"
              @click="handleDelete(row.original)" />
          </div>
        </template>
      </UTable>

      <div class="flex justify-end gap-2 mt-4">
        <UButton label="Previous" :disabled="offset === 0" @click="offset -= limit" />
        <UButton label="Next" :disabled="total < limit" @click="offset += limit" />
      </div>

      <UModal v-model:open="showCreateModal" :title="modalTitle">
        <template #body>
          <UForm :state="{ altText: form.altText }" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="File" :required="!isEditing">
              <input type="file" accept="video/*" @change="handleFileChange"
                class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90" />
            </UFormField>
            <UFormField label="Alt Text" required>
              <UInput v-model="form.altText" placeholder="Enter alt text" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="outline" @click="showCreateModal = false" />
              <UButton type="submit" :label="isEditing ? 'Update' : 'Upload'" color="primary" :loading="submitting" />
            </div>
          </UForm>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
