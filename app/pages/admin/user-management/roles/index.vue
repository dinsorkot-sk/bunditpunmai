<script lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useRoles } from '~/composables/v1/useRoles'

interface ApiRole {
    id: number
    name: string
    createdAt: string
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { roles, loading, total, fetchRoles, createRole, updateRole, deleteRole } = useRoles()
        const toast = useToast()
        return {
            roles,
            loading,
            total,
            fetchRoles,
            createRole,
            updateRole,
            deleteRole,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingRole: null as ApiRole | null,
            submitting: false,
            form: {
                name: '',
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiRole>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'name', header: 'Name' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingRole
        },
        modalTitle() {
            return this.isEditing ? 'Edit Role' : 'Create Role'
        },
    },
    watch: {
        offset() {
            this.fetchRoles({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchRoles({ limit: this.limit, offset: this.offset })
    },
    methods: {
        resetForm() {
            this.form = { name: '' }
            this.editingRole = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(role: ApiRole) {
            this.editingRole = role
            this.form = { name: role.name }
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            this.submitting = true
            try {
                if (this.isEditing && this.editingRole) {
                    await this.updateRole(this.editingRole.id, { name: this.form.name })
                    this.toast.add({ title: 'Role updated', color: 'success' })
                }
                else {
                    await this.createRole(this.form)
                    this.toast.add({ title: 'Role created', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchRoles({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to save role:', error)
                this.toast.add({ title: 'Failed to save role', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(role: { id: number; name: string }) {
            if (confirm(`Delete role "${role.name}"?`)) {
                try {
                    await this.deleteRole(role.id)
                    this.toast.add({ title: 'Role deleted', color: 'success' })
                    this.fetchRoles({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete role:', error)
                    this.toast.add({ title: 'Failed to delete role', color: 'error' })
                }
            }
        },
        formatDate(date: string) {
            return new Date(date).toLocaleDateString()
        },
    },
}
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
                            <UInput v-model="form.name" placeholder="Enter role name" class="w-full"/>
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
