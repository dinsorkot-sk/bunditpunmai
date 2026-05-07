<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useRolePermissions } from '~/composables/v1/useRolePermissions'
import { useRoles } from '~/composables/v1/useRoles'
import { usePermissions } from '~/composables/v1/usePermissions'

definePageMeta({ layout: 'admin' })

interface ApiRolePermission {
  roleId: number
  permissionId: number
}

const { rolePermissions, loading, total, fetchRolePermissions, createRolePermission, deleteRolePermission } = useRolePermissions()
const { roles, fetchRoles } = useRoles()
const { permissions, fetchPermissions } = usePermissions()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const submitting = ref(false)
const form = ref({
  roleId: undefined as number | undefined,
  permissionId: undefined as number | undefined,
})

const columns = computed<TableColumn<ApiRolePermission>[]>(() => [
  { accessorKey: 'roleId', header: 'Role' },
  { accessorKey: 'permissionId', header: 'Permission' },
  { accessorKey: 'actions', header: 'Actions' },
])

const roleOptions = computed(() => roles.value.map(r => ({ label: r.name, value: r.id })))
const permissionOptions = computed(() => permissions.value.map(p => ({ label: p.name, value: p.id })))

function resetForm() {
  form.value = { roleId: undefined, permissionId: undefined }
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.roleId == null || form.value.permissionId == null) return
  submitting.value = true
  try {
    await createRolePermission(form.value as { roleId: number; permissionId: number })
    toast.add({ title: 'Permission assigned', color: 'success' })
    showCreateModal.value = false
    resetForm()
    fetchRolePermissions({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to create role permission:', error)
    toast.add({ title: 'Failed to assign permission', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(rp: ApiRolePermission) {
  if (confirm('Remove this role permission assignment?')) {
    try {
      await deleteRolePermission({ roleId: rp.roleId, permissionId: rp.permissionId })
      toast.add({ title: 'Permission removed', color: 'success' })
      fetchRolePermissions({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete role permission:', error)
      toast.add({ title: 'Failed to remove permission', color: 'error' })
    }
  }
}

function getRoleName(roleId: number) {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : `Role #${roleId}`
}

function getPermissionName(permissionId: number) {
  const permission = permissions.value.find(p => p.id === permissionId)
  return permission ? permission.name : `Permission #${permissionId}`
}

watch(offset, () => {
  fetchRolePermissions({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchRolePermissions({ limit: limit.value, offset: offset.value })
  fetchRoles({ limit: 100 })
  fetchPermissions({ limit: 100 })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Role Permissions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Assign" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="rolePermissions" :columns="columns" :loading="loading" sticky>
        <template #roleId-cell="{ row }">
          {{ getRoleName(row.original.roleId) }}
        </template>
        <template #permissionId-cell="{ row }">
          {{ getPermissionName(row.original.permissionId) }}
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

      <UModal v-model:open="showCreateModal" title="Assign Permission to Role">
        <template #body>
          <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="Role" required>
              <USelectMenu v-model="form.roleId" :items="roleOptions" placeholder="Select role" valueKey="value" labelKey="label" />
            </UFormField>
            <UFormField label="Permission" required>
              <USelectMenu v-model="form.permissionId" :items="permissionOptions"
                placeholder="Select permission" valueKey="value" labelKey="label" />
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
