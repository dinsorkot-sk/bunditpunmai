<script lang="ts">
import type { TableColumn } from '@nuxt/ui'
export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { users, loading, total, fetchUsers, createUser, updateUser, deleteUser } = useUsers()
        const toast = useToast()
        return {
            users,
            loading,
            total,
            fetchUsers,
            createUser,
            updateUser,
            deleteUser,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingUser: null as { id: number; name: string; email: string; avatar: string; createdAt: string } | null,
            submitting: false,
            form: {
                name: '',
                email: '',
                password: '',
                avatar: '',
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiUser>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'name', header: 'Name' },
                { accessorKey: 'email', header: 'Email' },
                { accessorKey: 'avatar', header: 'Avatar' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingUser
        },
        modalTitle() {
            return this.isEditing ? 'Edit User' : 'Create User'
        },
    },
    watch: {
        offset() {
            this.fetchUsers({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchUsers({ limit: this.limit, offset: this.offset })
    },
    methods: {
        resetForm() {
            this.form = { name: '', email: '', password: '', avatar: '' }
            this.editingUser = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(user: { id: number; name: string; email: string; avatar: string; createdAt: string }) {
            this.editingUser = user
            this.form = { name: user.name, email: user.email, password: '', avatar: user.avatar }
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            this.submitting = true
            try {
                if (this.isEditing && this.editingUser) {
                    const data: Record<string, unknown> = {
                        name: this.form.name,
                        email: this.form.email,
                        avatar: this.form.avatar,
                    }
                    if (this.form.password) {
                        data.password = this.form.password
                    }
                    await this.updateUser(this.editingUser.id, data)
                    this.toast.add({ title: 'User updated', color: 'success' })
                }
                else {
                    await this.createUser({
                        name: this.form.name,
                        email: this.form.email,
                        password: this.form.password,
                        avatar: this.form.avatar,
                        createdAt: new Date(),
                    })
                    this.toast.add({ title: 'User created', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchUsers({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to save user:', error)
                this.toast.add({ title: 'Failed to save user', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(user: { id: number }) {
            if (confirm(`Delete user "${(user as Record<string, unknown>).name}"?`)) {
                try {
                    await this.deleteUser(user.id)
                    this.toast.add({ title: 'User deleted', color: 'success' })
                    this.fetchUsers({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete user:', error)
                    this.toast.add({ title: 'Failed to delete user', color: 'error' })
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
                            <UInput v-model="form.name" placeholder="Enter name" class="w-full"/>
                        </UFormField>
                        <UFormField label="Email" required>
                            <UInput v-model="form.email" type="email" placeholder="Enter email" class="w-full"/>
                        </UFormField>
                        <UFormField label="Password" :required="!isEditing">
                            <UInput v-model="form.password" type="password"
                                :placeholder="isEditing ? 'Leave blank to keep current' : 'Enter password'" class="w-full"/>
                        </UFormField>
                        <UFormField label="Avatar URL">
                            <UInput v-model="form.avatar" placeholder="Enter avatar URL" class="w-full"/>
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
