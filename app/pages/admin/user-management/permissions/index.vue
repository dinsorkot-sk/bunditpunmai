<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiPermission {
    id: number
    name: string
    description: string | null
    createdAt: string
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { permissions, loading, total, fetchPermissions, createPermission, updatePermission, deletePermission } = usePermissions()
        const toast = useToast()
        return {
            permissions,
            loading,
            total,
            fetchPermissions,
            createPermission,
            updatePermission,
            deletePermission,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingPermission: null as ApiPermission | null,
            submitting: false,
            form: {
                name: '',
                description: '',
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiPermission>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'name', header: 'Name' },
                { accessorKey: 'description', header: 'Description' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingPermission
        },
        modalTitle() {
            return this.isEditing ? 'Edit Permission' : 'Create Permission'
        },
    },
    watch: {
        offset() {
            this.fetchPermissions({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchPermissions({ limit: this.limit, offset: this.offset })
    },
    methods: {
        resetForm() {
            this.form = { name: '', description: '' }
            this.editingPermission = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(permission: ApiPermission) {
            this.editingPermission = permission
            this.form = { name: permission.name, description: permission.description || '' }
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            this.submitting = true
            try {
                if (this.isEditing && this.editingPermission) {
                    await this.updatePermission(this.editingPermission.id, {
                        name: this.form.name,
                        description: this.form.description || undefined,
                    })
                    this.toast.add({ title: 'Permission updated', color: 'success' })
                }
                else {
                    await this.createPermission(this.form)
                    this.toast.add({ title: 'Permission created', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchPermissions({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to save permission:', error)
                this.toast.add({ title: 'Failed to save permission', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(permission: { id: number; name: string }) {
            if (confirm(`Delete permission "${permission.name}"?`)) {
                try {
                    await this.deletePermission(permission.id)
                    this.toast.add({ title: 'Permission deleted', color: 'success' })
                    this.fetchPermissions({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete permission:', error)
                    this.toast.add({ title: 'Failed to delete permission', color: 'error' })
                }
            }
        },
    },
}
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
                            <UInput v-model="form.name" placeholder="Enter permission name" class="w-full"/>
                        </UFormField>
                        <UFormField label="Description">
                            <UTextarea v-model="form.description" placeholder="Enter description" class="w-full"/>
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
