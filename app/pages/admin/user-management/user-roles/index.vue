<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useUserRoles } from '~/composables/v1/useUserRoles'
import { useUsers } from '~/composables/v1/useUsers'
import { useRoles } from '~/composables/v1/useRoles'

definePageMeta({ layout: 'admin' })

interface ApiUserRole {
  userId: number
  roleId: number
}

const { userRoles, loading, total, fetchUserRoles, createUserRole, deleteUserRole } = useUserRoles()
const { users, fetchUsers } = useUsers()
const { roles, fetchRoles } = useRoles()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const submitting = ref(false)
const form = ref({
  userId: undefined as number | undefined,
  roleId: undefined as number | undefined,
})

const columns = computed<TableColumn<ApiUserRole>[]>(() => [
  { accessorKey: 'userId', header: 'User' },
  { accessorKey: 'roleId', header: 'Role' },
  { accessorKey: 'actions', header: 'Actions' },
])

const userOptions = computed(() => users.value.map(u => ({ label: u.name, value: u.id })))
const roleOptions = computed(() => roles.value.map(r => ({ label: r.name, value: r.id })))

function resetForm() {
  form.value = { userId: undefined, roleId: undefined }
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.userId == null || form.value.roleId == null) return
  submitting.value = true
  try {
    await createUserRole(form.value as { userId: number; roleId: number })
    toast.add({ title: 'Role assigned', color: 'success' })
    showCreateModal.value = false
    resetForm()
    fetchUserRoles({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to create user role:', error)
    toast.add({ title: 'Failed to assign role', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(userRole: ApiUserRole) {
  if (confirm('Remove this user role assignment?')) {
    try {
      await deleteUserRole({ userId: userRole.userId, roleId: userRole.roleId })
      toast.add({ title: 'Role removed', color: 'success' })
      fetchUserRoles({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete user role:', error)
      toast.add({ title: 'Failed to remove role', color: 'error' })
    }
  }
}

function getUserName(userId: number) {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : `User #${userId}`
}

function getRoleName(roleId: number) {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : `Role #${roleId}`
}

watch(offset, () => {
  fetchUserRoles({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchUserRoles({ limit: limit.value, offset: offset.value })
  fetchUsers({ limit: 100 })
  fetchRoles({ limit: 100 })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="User Roles">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Assign" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="userRoles" :columns="columns" :loading="loading" sticky>
        <template #userId-cell="{ row }">
          {{ getUserName(row.original.userId) }}
        </template>
        <template #roleId-cell="{ row }">
          {{ getRoleName(row.original.roleId) }}
        </template>
        <template #actions-cell="{ row }">
          <UButton icon="i-lucide-trash" variant="ghost" size="xs" color="error"
            @click="handleDelete(row.original)" />
        </template>
      </UTable>

      <div class="flex justify-end gap-2 mt-4">
        <UButton label="Previous" :disabled="offset === 0" @click="offset -= limit" />
        <UButton label="Next" :disabled="total < limit" @click="offset += limit" />
      </div>

      <UModal v-model:open="showCreateModal" title="Assign Role to User">
        <template #body>
          <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="User" required>
              <USelectMenu v-model="form.userId" :items="userOptions" placeholder="Select user" valueKey="value" labelKey="label" />
            </UFormField>
            <UFormField label="Role" required>
              <USelectMenu v-model="form.roleId" :items="roleOptions" placeholder="Select role" valueKey="value" labelKey="label" />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="outline" @click="showCreateModal = false" />
              <UButton type="submit" label="Assign" color="primary" :loading="submitting" />
            </div>
          </UForm>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
