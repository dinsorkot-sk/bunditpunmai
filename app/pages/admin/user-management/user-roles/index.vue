<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiUserRole {
    userId: number
    roleId: number
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { userRoles, loading, total, fetchUserRoles, createUserRole, deleteUserRole } = useUserRoles()
        const { users, fetchUsers } = useUsers()
        const { roles, fetchRoles } = useRoles()
        const toast = useToast()
        return {
            userRoles,
            loading,
            total,
            fetchUserRoles,
            createUserRole,
            deleteUserRole,
            users,
            fetchUsers,
            roles,
            fetchRoles,
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
                userId: undefined as number | undefined,
                roleId: undefined as number | undefined,
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiUserRole>[] {
            return [
                { accessorKey: 'userId', header: 'User' },
                { accessorKey: 'roleId', header: 'Role' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        userOptions() {
            return this.users.map(u => ({ label: u.name, value: u.id }))
        },
        roleOptions() {
            return this.roles.map(r => ({ label: r.name, value: r.id }))
        },
    },
    watch: {
        offset() {
            this.fetchUserRoles({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchUserRoles({ limit: this.limit, offset: this.offset })
        this.fetchUsers({ limit: 100 })
        this.fetchRoles({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { userId: undefined, roleId: undefined }
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.userId == null || this.form.roleId == null) return
            this.submitting = true
            try {
                await this.createUserRole(this.form as { userId: number; roleId: number })
                this.toast.add({ title: 'Role assigned', color: 'success' })
                this.showCreateModal = false
                this.resetForm()
                this.fetchUserRoles({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to create user role:', error)
                this.toast.add({ title: 'Failed to assign role', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(userRole: ApiUserRole) {
            if (confirm('Remove this user role assignment?')) {
                try {
                    await this.deleteUserRole({ userId: userRole.userId, roleId: userRole.roleId })
                    this.toast.add({ title: 'Role removed', color: 'success' })
                    this.fetchUserRoles({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete user role:', error)
                    this.toast.add({ title: 'Failed to remove role', color: 'error' })
                }
            }
        },
        getUserName(userId: number) {
            const user = this.users.find(u => u.id === userId)
            return user ? user.name : `User #${userId}`
        },
        getRoleName(roleId: number) {
            const role = this.roles.find(r => r.id === roleId)
            return role ? role.name : `Role #${roleId}`
        },
    },
}
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
                            <USelectMenu v-model="form.userId" :items="userOptions" placeholder="Select user" valueKey="value" labelKey="label"/>
                        </UFormField>
                        <UFormField label="Role" required>
                            <USelectMenu v-model="form.roleId" :items="roleOptions" placeholder="Select role" valueKey="value" labelKey="label"/>
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
