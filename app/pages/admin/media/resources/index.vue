<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useResources } from '~/composables/v1/useResources'

definePageMeta({ layout: 'admin' })

interface ApiResource {
  id: number
  title: string
  description: string
  url: string
  createdAt: string
}

const { resources, loading, total, fetchResources, createResource, updateResource, deleteResource } = useResources()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingResource = ref<ApiResource | null>(null)
const submitting = ref(false)
const selectedFile = ref<File | null>(null)
const form = ref({ title: '', description: '' })

const columns = computed<TableColumn<ApiResource>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'url', header: 'URL' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingResource.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Resource' : 'Upload Resource')

function resetForm() {
  form.value = { title: '', description: '' }
  selectedFile.value = null
  editingResource.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(resource: ApiResource) {
  editingResource.value = resource
  form.value = { title: resource.title, description: resource.description }
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
    if (isEditing.value && editingResource.value) {
      if (selectedFile.value) {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('title', form.value.title)
        formData.append('description', form.value.description)
        await updateResource(editingResource.value.id, formData)
      }
      else {
        await updateResource(editingResource.value.id, {
          title: form.value.title,
          description: form.value.description,
        })
      }
      toast.add({ title: 'Resource updated', color: 'success' })
    }
    else {
      if (!selectedFile.value) {
        alert('Please select a file')
        submitting.value = false
        return
      }
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('title', form.value.title)
      formData.append('description', form.value.description)
      await createResource(formData)
      toast.add({ title: 'Resource uploaded', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchResources({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save resource:', error)
    toast.add({ title: 'Failed to save resource', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(resource: { id: number; title: string }) {
  if (confirm(`Delete resource "${resource.title}"?`)) {
    try {
      await deleteResource(resource.id)
      toast.add({ title: 'Resource deleted', color: 'success' })
      fetchResources({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete resource:', error)
      toast.add({ title: 'Failed to delete resource', color: 'error' })
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => {
  fetchResources({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchResources({ limit: limit.value, offset: offset.value })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Resources">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Upload" icon="i-lucide-upload" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="resources" :columns="columns" :loading="loading" sticky>
        <template #description-cell="{ row }">
          <span class="line-clamp-1">{{ row.original.description }}</span>
        </template>
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
          <UForm :state="{ title: form.title, description: form.description }" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="File" :required="!isEditing">
              <input type="file" @change="handleFileChange"
                class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90" />
            </UFormField>
            <UFormField label="Title" required>
              <UInput v-model="form.title" placeholder="Enter title" class="w-full" />
            </UFormField>
            <UFormField label="Description" required>
              <UTextarea v-model="form.description" placeholder="Enter description" class="w-full" />
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
