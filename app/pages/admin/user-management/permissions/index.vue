<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { usePermissions } from '~/composables/v1/usePermissions'

definePageMeta({ layout: 'admin' })

interface ApiPermission {
  id: number
  name: string
  description: string | null
}

const { permissions, loading, total, fetchPermissions, createPermission, updatePermission, deletePermission } = usePermissions()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingPermission = ref<ApiPermission | null>(null)
const submitting = ref(false)
const form = ref({ name: '', description: '' })

const columns = computed<TableColumn<ApiPermission>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
  { id: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingPermission.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Permission' : 'Create Permission')

function resetForm() {
  form.value = { name: '', description: '' }
  editingPermission.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(permission: ApiPermission) {
  editingPermission.value = permission
  form.value = { name: permission.name, description: permission.description || '' }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    if (isEditing.value && editingPermission.value) {
      await updatePermission(editingPermission.value.id, {
        name: form.value.name,
        description: form.value.description || undefined,
      })
      toast.add({ title: 'Permission updated', color: 'success' })
    }
    else {
      await createPermission(form.value)
      toast.add({ title: 'Permission created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchPermissions({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save permission:', error)
    toast.add({ title: 'Failed to save permission', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(permission: ApiPermission) {
  if (confirm(`Delete permission "${permission.name}"?`)) {
    try {
      await deletePermission(permission.id)
      toast.add({ title: 'Permission deleted', color: 'success' })
      fetchPermissions({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete permission:', error)
      toast.add({ title: 'Failed to delete permission', color: 'error' })
    }
  }
}

watch(offset, () => {
  fetchPermissions({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchPermissions({ limit: limit.value, offset: offset.value })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Permissions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="permissions" :columns="columns" :loading="loading" sticky>
        <template #description-cell="{ row }">
          <span v-if="row.original.description">{{ row.original.description }}</span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" size="xs"
              @click="openEditModal(row.original)" />
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
              <UInput v-model="form.name" placeholder="Enter permission name" class="w-full" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="form.description" placeholder="Enter description" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="outline" @click="showCreateModal = false" />
              <UButton type="submit" :label="isEditing ? 'Update' : 'Create'" color="primary"
                :loading="submitting" />
            </div>
          </UForm>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
