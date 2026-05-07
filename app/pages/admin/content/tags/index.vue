<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useTags } from '~/composables/v1/useTags'

definePageMeta({ layout: 'admin' })

interface ApiTag {
  id: number
  name: string
}

const { tags, loading, total, fetchTags, createTag, updateTag, deleteTag } = useTags()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingTag = ref<ApiTag | null>(null)
const submitting = ref(false)
const form = ref({ name: '' })

const columns = computed<TableColumn<ApiTag>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingTag.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Tag' : 'Create Tag')

function resetForm() {
  form.value = { name: '' }
  editingTag.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(tag: ApiTag) {
  editingTag.value = tag
  form.value = { name: tag.name }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    if (isEditing.value && editingTag.value) {
      await updateTag(editingTag.value.id, { name: form.value.name })
      toast.add({ title: 'Tag updated', color: 'success' })
    }
    else {
      await createTag(form.value)
      toast.add({ title: 'Tag created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchTags({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save tag:', error)
    toast.add({ title: 'Failed to save tag', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(tag: { id: number; name: string }) {
  if (confirm(`Delete tag "${tag.name}"?`)) {
    try {
      await deleteTag(tag.id)
      toast.add({ title: 'Tag deleted', color: 'success' })
      fetchTags({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete tag:', error)
      toast.add({ title: 'Failed to delete tag', color: 'error' })
    }
  }
}

watch(offset, () => {
  fetchTags({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchTags({ limit: limit.value, offset: offset.value })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Tags">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="tags" :columns="columns" :loading="loading" sticky>
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
          <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="Name" required>
              <UInput v-model="form.name" placeholder="Enter tag name" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="outline" @click="showCreateModal = false" />
              <UButton type="submit" :label="isEditing ? 'Update' : 'Create'" color="primary" :loading="submitting" />
            </div>
          </UForm>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
