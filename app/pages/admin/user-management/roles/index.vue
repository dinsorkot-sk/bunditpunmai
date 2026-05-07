<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useRoles } from '~/composables/v1/useRoles'

definePageMeta({ layout: 'admin' })

interface ApiRole {
  id: number
  name: string
  createdAt: string
}

const { roles, loading, total, fetchRoles, createRole, updateRole, deleteRole } = useRoles()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingRole = ref<ApiRole | null>(null)
const submitting = ref(false)
const form = ref({ name: '' })

const columns = computed<TableColumn<ApiRole>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingRole.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Role' : 'Create Role')

function resetForm() {
  form.value = { name: '' }
  editingRole.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(role: ApiRole) {
  editingRole.value = role
  form.value = { name: role.name }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    if (isEditing.value && editingRole.value) {
      await updateRole(editingRole.value.id, { name: form.value.name })
      toast.add({ title: 'Role updated', color: 'success' })
    }
    else {
      await createRole(form.value)
      toast.add({ title: 'Role created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchRoles({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save role:', error)
    toast.add({ title: 'Failed to save role', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(role: { id: number; name: string }) {
  if (confirm(`Delete role "${role.name}"?`)) {
    try {
      await deleteRole(role.id)
      toast.add({ title: 'Role deleted', color: 'success' })
      fetchRoles({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete role:', error)
      toast.add({ title: 'Failed to delete role', color: 'error' })
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => {
  fetchRoles({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchRoles({ limit: limit.value, offset: offset.value })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Roles">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="roles" :columns="columns" :loading="loading" sticky>
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
          <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="Name" required>
              <UInput v-model="form.name" placeholder="Enter role name" class="w-full" />
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
