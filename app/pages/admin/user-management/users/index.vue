<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useUsers } from '~/composables/v1/useUsers'

definePageMeta({ layout: 'admin' })

interface ApiUser {
  id: number
  name: string
  email: string
  avatar: string
  createdAt: string
}

const { users, loading, total, fetchUsers, createUser, updateUser, deleteUser } = useUsers()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const showAvatarPicker = ref(false)
const editingUser = ref<ApiUser | null>(null)
const submitting = ref(false)
const form = ref({
  name: '',
  email: '',
  password: '',
  avatar: '',
})

const columns = computed<TableColumn<ApiUser>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'avatar', header: 'Avatar' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingUser.value)
const modalTitle = computed(() => isEditing.value ? 'Edit User' : 'Create User')

function resetForm() {
  form.value = { name: '', email: '', password: '', avatar: '' }
  editingUser.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(user: ApiUser) {
  editingUser.value = user
  form.value = { name: user.name, email: user.email, password: '', avatar: user.avatar }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    if (isEditing.value && editingUser.value) {
      const data: Record<string, unknown> = {
        name: form.value.name,
        email: form.value.email,
        avatar: form.value.avatar,
      }
      if (form.value.password) {
        data.password = form.value.password
      }
      await updateUser(editingUser.value.id, data)
      toast.add({ title: 'User updated', color: 'success' })
    }
    else {
      await createUser({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        avatar: form.value.avatar,
        createdAt: new Date(),
      })
      toast.add({ title: 'User created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchUsers({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save user:', error)
    toast.add({ title: 'Failed to save user', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(user: ApiUser) {
  if (confirm(`Delete user "${user.name}"?`)) {
    try {
      await deleteUser(user.id)
      toast.add({ title: 'User deleted', color: 'success' })
      fetchUsers({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete user:', error)
      toast.add({ title: 'Failed to delete user', color: 'error' })
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => {
  fetchUsers({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchUsers({ limit: limit.value, offset: offset.value })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Users">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="users" :columns="columns" :loading="loading" sticky>
        <template #avatar-cell="{ row }">
          <UAvatar v-if="row.original.avatar" :alt="row.original.name" size="xs" />
          <span v-else class="text-muted">-</span>
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
          <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="Name" required>
              <UInput v-model="form.name" placeholder="Enter name" class="w-full" />
            </UFormField>
            <UFormField label="Email" required>
              <UInput v-model="form.email" type="email" placeholder="Enter email" class="w-full" />
            </UFormField>
            <UFormField label="Password" :required="!isEditing">
              <UInput v-model="form.password" type="password"
                :placeholder="isEditing ? 'Leave blank to keep current' : 'Enter password'" class="w-full" />
            </UFormField>
            <UFormField label="Avatar">
              <div class="flex items-center gap-3 w-full">
                <UAvatar v-if="form.avatar" :src="form.avatar" size="sm" />
                <div class="flex gap-2">
                  <UButton label="Choose" color="primary" variant="outline" size="sm" @click="showAvatarPicker = true" />
                  <UButton v-if="form.avatar" label="Remove" color="neutral" variant="ghost" size="sm" @click="form.avatar = ''" />
                </div>
              </div>
              <ThiingsPicker v-model="form.avatar" v-model:open="showAvatarPicker" />
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
