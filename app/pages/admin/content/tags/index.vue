<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiTag {
    id: number
    name: string
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { tags, loading, total, fetchTags, createTag, updateTag, deleteTag } = useTags()
        const toast = useToast()
        return {
            tags,
            loading,
            total,
            fetchTags,
            createTag,
            updateTag,
            deleteTag,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingTag: null as ApiTag | null,
            submitting: false,
            form: {
                name: '',
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiTag>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'name', header: 'Name' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingTag
        },
        modalTitle() {
            return this.isEditing ? 'Edit Tag' : 'Create Tag'
        },
    },
    watch: {
        offset() {
            this.fetchTags({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchTags({ limit: this.limit, offset: this.offset })
    },
    methods: {
        resetForm() {
            this.form = { name: '' }
            this.editingTag = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(tag: ApiTag) {
            this.editingTag = tag
            this.form = { name: tag.name }
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            this.submitting = true
            try {
                if (this.isEditing && this.editingTag) {
                    await this.updateTag(this.editingTag.id, { name: this.form.name })
                    this.toast.add({ title: 'Tag updated', color: 'success' })
                }
                else {
                    await this.createTag(this.form)
                    this.toast.add({ title: 'Tag created', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchTags({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to save tag:', error)
                this.toast.add({ title: 'Failed to save tag', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(tag: { id: number; name: string }) {
            if (confirm(`Delete tag "${tag.name}"?`)) {
                try {
                    await this.deleteTag(tag.id)
                    this.toast.add({ title: 'Tag deleted', color: 'success' })
                    this.fetchTags({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete tag:', error)
                    this.toast.add({ title: 'Failed to delete tag', color: 'error' })
                }
            }
        },
    },
}
</script>
<template>
    <UDashboardPanel resizable>
        <template #header>
            <UDashboardNavbar title="Tags">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="tags" :columns="columns" :loading="loading" sticky>
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
                            <UInput v-model="form.name" placeholder="Enter tag name" class="w-full"/>
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
