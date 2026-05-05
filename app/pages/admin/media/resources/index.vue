<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiResource {
    id: number
    title: string
    description: string
    url: string
    createdAt: string
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { resources, loading, total, fetchResources, createResource, updateResource, deleteResource } = useResources()
        const toast = useToast()
        return {
            resources,
            loading,
            total,
            fetchResources,
            createResource,
            updateResource,
            deleteResource,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingResource: null as ApiResource | null,
            submitting: false,
            form: {
                title: '',
                description: '',
            },
            selectedFile: null as File | null,
        }
    },
    computed: {
        columns(): TableColumn<ApiResource>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'title', header: 'Title' },
                { accessorKey: 'description', header: 'Description' },
                { accessorKey: 'url', header: 'URL' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingResource
        },
        modalTitle() {
            return this.isEditing ? 'Edit Resource' : 'Upload Resource'
        },
    },
    watch: {
        offset() {
            this.fetchResources({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchResources({ limit: this.limit, offset: this.offset })
    },
    methods: {
        resetForm() {
            this.form = { title: '', description: '' }
            this.selectedFile = null
            this.editingResource = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(resource: ApiResource) {
            this.editingResource = resource
            this.form = { title: resource.title, description: resource.description }
            this.selectedFile = null
            this.showCreateModal = true
        },
        handleFileChange(event: Event) {
            const target = event.target as HTMLInputElement
            if (target.files && target.files.length > 0) {
                this.selectedFile = target.files[0] as File | null
            }
        },
        async handleSubmit() {
            if (this.submitting) return
            this.submitting = true
            try {
                if (this.isEditing && this.editingResource) {
                    if (this.selectedFile) {
                        const formData = new FormData()
                        formData.append('file', this.selectedFile)
                        formData.append('title', this.form.title)
                        formData.append('description', this.form.description)
                        await this.updateResource(this.editingResource.id, formData)
                    }
                    else {
                        await this.updateResource(this.editingResource.id, {
                            title: this.form.title,
                            description: this.form.description,
                        })
                    }
                    this.toast.add({ title: 'Resource updated', color: 'success' })
                }
                else {
                    if (!this.selectedFile) {
                        alert('Please select a file')
                        this.submitting = false
                        return
                    }
                    const formData = new FormData()
                    formData.append('file', this.selectedFile)
                    formData.append('title', this.form.title)
                    formData.append('description', this.form.description)
                    await this.createResource(formData)
                    this.toast.add({ title: 'Resource uploaded', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchResources({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to save resource:', error)
                this.toast.add({ title: 'Failed to save resource', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(resource: { id: number; title: string }) {
            if (confirm(`Delete resource "${resource.title}"?`)) {
                try {
                    await this.deleteResource(resource.id)
                    this.toast.add({ title: 'Resource deleted', color: 'success' })
                    this.fetchResources({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete resource:', error)
                    this.toast.add({ title: 'Failed to delete resource', color: 'error' })
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
            <UDashboardNavbar title="Resources">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Upload" icon="i-lucide-upload" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="resources" :columns="columns" :loading="loading" sticky>
                <template #description-cell="{ row }">
                    <span class="line-clamp-1">{{ row.original.description }}</span>
                </template>
                <template #url-cell="{ row }">
                    <a :href="row.original.url" target="_blank" class="text-primary hover:underline truncate block max-w-xs">
                        {{ row.original.url }}
                    </a>
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
                        <UFormField label="File" :required="!isEditing">
                            <input type="file" @change="handleFileChange"
                                class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90" />
                        </UFormField>
                        <UFormField label="Title" required>
                            <UInput v-model="form.title" placeholder="Enter title" class="w-full"/>
                        </UFormField>
                        <UFormField label="Description" required>
                            <UTextarea v-model="form.description" placeholder="Enter description" class="w-full"/>
                        </UFormField>
                        <div class="flex justify-end gap-2">
                            <UButton label="Cancel" variant="outline" @click="showCreateModal = false" />
                            <UButton type="submit" :label="isEditing ? 'Update' : 'Upload'" color="primary" :loading="submitting" />
                        </div>
                    </UForm>
                </template>
            </UModal>
        </template>
    </UDashboardPanel>
</template>
