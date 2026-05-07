<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useImages } from '~/composables/v1/useImages'

definePageMeta({ layout: 'admin' })

interface ApiImage {
  id: number
  url: string
  altText: string
  createdAt: string
}

const { images, loading, total, fetchImages, createImage, updateImage, deleteImage } = useImages()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingImage = ref<ApiImage | null>(null)
const submitting = ref(false)
const selectedFile = ref<File | null>(null)
const form = ref({ altText: '' })

const columns = computed<TableColumn<ApiImage>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'preview', header: 'Preview' },
  { accessorKey: 'altText', header: 'Alt Text' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingImage.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Image' : 'Upload Image')

function resetForm() {
  form.value = { altText: '' }
  selectedFile.value = null
  editingImage.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(image: ApiImage) {
  editingImage.value = image
  form.value = { altText: image.altText }
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
    if (isEditing.value && editingImage.value) {
      if (selectedFile.value) {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('altText', form.value.altText)
        await updateImage(editingImage.value.id, formData)
      }
      else {
        await updateImage(editingImage.value.id, { altText: form.value.altText })
      }
      toast.add({ title: 'Image updated', color: 'success' })
    }
    else {
      if (!selectedFile.value) {
        toast.add({ title: 'Please select an image file', color: 'error' })
        submitting.value = false
        return
      }
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('altText', form.value.altText)
      await createImage(formData)
      toast.add({ title: 'Image uploaded', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchImages({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save image:', error)
    toast.add({ title: 'Failed to save image', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(image: { id: number }) {
  if (confirm('Delete this image?')) {
    try {
      await deleteImage(image.id)
      fetchImages({ limit: limit.value, offset: offset.value })
      toast.add({ title: 'Image deleted', color: 'success' })
    }
    catch (error: unknown) {
      console.error('Failed to delete image:', error)
      toast.add({ title: 'Failed to delete image', color: 'error' })
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => {
  fetchImages({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchImages({ limit: limit.value, offset: offset.value })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Images">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Upload" icon="i-lucide-upload" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="images" :columns="columns" :loading="loading" sticky>
        <template #preview-cell="{ row }">
          <img :src="row.original.url" :alt="row.original.altText" class="h-10 w-10 object-cover rounded" />
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
              <input type="file" accept="image/*" @change="handleFileChange"
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
