<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiImage {
    id: number
    url: string
    altText: string
    createdAt: string
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { images, loading, total, fetchImages, createImage, updateImage, deleteImage } = useImages()
        const toast = useToast()
        return {
            images,
            loading,
            total,
            fetchImages,
            createImage,
            updateImage,
            deleteImage,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingImage: null as ApiImage | null,
            submitting: false,
            form: {
                altText: '',
            },
            selectedFile: null as File | null,
        }
    },
    computed: {
        columns(): TableColumn<ApiImage>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'preview', header: 'Preview' },
                { accessorKey: 'altText', header: 'Alt Text' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingImage
        },
        modalTitle() {
            return this.isEditing ? 'Edit Image' : 'Upload Image'
        },
    },
    watch: {
        offset() {
            this.fetchImages({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchImages({ limit: this.limit, offset: this.offset })
    },
    methods: {
        resetForm() {
            this.form = { altText: '' }
            this.selectedFile = null
            this.editingImage = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(image: ApiImage) {
            this.editingImage = image
            this.form = { altText: image.altText }
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
                if (this.isEditing && this.editingImage) {
                    if (this.selectedFile) {
                        const formData = new FormData()
                        formData.append('file', this.selectedFile)
                        formData.append('altText', this.form.altText)
                        await this.updateImage(this.editingImage.id, formData)
                    }
                    else {
                        await this.updateImage(this.editingImage.id, { altText: this.form.altText })
                    }
                    this.toast.add({ title: 'Image updated', color: 'success' })
                }
                else {
                    if (!this.selectedFile) {
                        alert('Please select an image file')
                        this.submitting = false
                        return
                    }
                    const formData = new FormData()
                    formData.append('file', this.selectedFile)
                    formData.append('altText', this.form.altText)
                    await this.createImage(formData)
                    this.toast.add({ title: 'Image uploaded', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchImages({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to save image:', error)
                this.toast.add({ title: 'Failed to save image', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(image: { id: number }) {
            if (confirm('Delete this image?')) {
                try {
                    await this.deleteImage(image.id)
                    this.toast.add({ title: 'Image deleted', color: 'success' })
                    this.fetchImages({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete image:', error)
                    this.toast.add({ title: 'Failed to delete image', color: 'error' })
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
            <UDashboardNavbar title="Images">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Upload" icon="i-lucide-upload" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="images" :columns="columns" :loading="loading" sticky>
                <template #preview-cell="{ row }">
                    <img :src="row.original.url" :alt="row.original.altText" class="h-10 w-10 object-cover rounded" />
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
                            <input type="file" accept="image/*" @change="handleFileChange"
                                class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90" />
                        </UFormField>
                        <UFormField label="Alt Text" required>
                            <UInput v-model="form.altText" placeholder="Enter alt text" class="w-full"/>
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
