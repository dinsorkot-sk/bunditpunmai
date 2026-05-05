<script lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useRolePermissions } from '~/composables/v1/useRolePermissions'
import { useRoles } from '~/composables/v1/useRoles'
import { usePermissions } from '~/composables/v1/usePermissions'

interface ApiRolePermission {
    roleId: number
    permissionId: number
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { rolePermissions, loading, total, fetchRolePermissions, createRolePermission, deleteRolePermission } = useRolePermissions()
        const { roles, fetchRoles } = useRoles()
        const { permissions, fetchPermissions } = usePermissions()
        const toast = useToast()
        return {
            rolePermissions,
            loading,
            total,
            fetchRolePermissions,
            createRolePermission,
            deleteRolePermission,
            roles,
            fetchRoles,
            permissions,
            fetchPermissions,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            submitting: false,
            form: {
                roleId: undefined as number | undefined,
                permissionId: undefined as number | undefined,
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiRolePermission>[] {
            return [
                { accessorKey: 'roleId', header: 'Role' },
                { accessorKey: 'permissionId', header: 'Permission' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        roleOptions() {
            return this.roles.map(r => ({ label: r.name, value: r.id }))
        },
        permissionOptions() {
            return this.permissions.map(p => ({ label: p.name, value: p.id }))
        },
    },
    watch: {
        offset() {
            this.fetchRolePermissions({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchRolePermissions({ limit: this.limit, offset: this.offset })
        this.fetchRoles({ limit: 100 })
        this.fetchPermissions({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { roleId: undefined, permissionId: undefined }
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.roleId == null || this.form.permissionId == null) return
            this.submitting = true
            try {
                await this.createRolePermission(this.form as { roleId: number; permissionId: number })
                this.toast.add({ title: 'Permission assigned', color: 'success' })
                this.showCreateModal = false
                this.resetForm()
                this.fetchRolePermissions({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to create role permission:', error)
                this.toast.add({ title: 'Failed to assign permission', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(rp: ApiRolePermission) {
            if (confirm('Remove this role permission assignment?')) {
                try {
                    await this.deleteRolePermission({ roleId: rp.roleId, permissionId: rp.permissionId })
                    this.toast.add({ title: 'Permission removed', color: 'success' })
                    this.fetchRolePermissions({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete role permission:', error)
                    this.toast.add({ title: 'Failed to remove permission', color: 'error' })
                }
            }
        },
        getRoleName(roleId: number) {
            const role = this.roles.find(r => r.id === roleId)
            return role ? role.name : `Role #${roleId}`
        },
        getPermissionName(permissionId: number) {
            const permission = this.permissions.find(p => p.id === permissionId)
            return permission ? permission.name : `Permission #${permissionId}`
        },
    },
}
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
                            <USelectMenu v-model="form.roleId" :items="roleOptions" placeholder="Select role" valueKey="value" labelKey="label"/>
                        </UFormField>
                        <UFormField label="Permission" required>
                            <USelectMenu v-model="form.permissionId" :items="permissionOptions"
                                placeholder="Select permission" valueKey="value" labelKey="label"/>
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
