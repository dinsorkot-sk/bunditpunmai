<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiVideo {
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
        const { videos, loading, total, fetchVideos, createVideo, updateVideo, deleteVideo } = useVideos()
        const toast = useToast()
        return {
            videos,
            loading,
            total,
            fetchVideos,
            createVideo,
            updateVideo,
            deleteVideo,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingVideo: null as ApiVideo | null,
            submitting: false,
            form: {
                altText: '',
            },
            selectedFile: null as File | null,
        }
    },
    computed: {
        columns(): TableColumn<ApiVideo>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'url', header: 'URL' },
                { accessorKey: 'altText', header: 'Alt Text' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingVideo
        },
        modalTitle() {
            return this.isEditing ? 'Edit Video' : 'Upload Video'
        },
    },
    watch: {
        offset() {
            this.fetchVideos({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchVideos({ limit: this.limit, offset: this.offset })
    },
    methods: {
        resetForm() {
            this.form = { altText: '' }
            this.selectedFile = null
            this.editingVideo = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(video: ApiVideo) {
            this.editingVideo = video
            this.form = { altText: video.altText }
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
                if (this.isEditing && this.editingVideo) {
                    if (this.selectedFile) {
                        const formData = new FormData()
                        formData.append('file', this.selectedFile)
                        formData.append('altText', this.form.altText)
                        await this.updateVideo(this.editingVideo.id, formData)
                    }
                    else {
                        await this.updateVideo(this.editingVideo.id, { altText: this.form.altText })
                    }
                    this.toast.add({ title: 'Video updated', color: 'success' })
                }
                else {
                    if (!this.selectedFile) {
                        alert('Please select a video file')
                        this.submitting = false
                        return
                    }
                    const formData = new FormData()
                    formData.append('file', this.selectedFile)
                    formData.append('altText', this.form.altText)
                    await this.createVideo(formData)
                    this.toast.add({ title: 'Video uploaded', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchVideos({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to save video:', error)
                this.toast.add({ title: 'Failed to save video', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(video: { id: number }) {
            if (confirm('Delete this video?')) {
                try {
                    await this.deleteVideo(video.id)
                    this.toast.add({ title: 'Video deleted', color: 'success' })
                    this.fetchVideos({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete video:', error)
                    this.toast.add({ title: 'Failed to delete video', color: 'error' })
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
            <UDashboardNavbar title="Videos">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Upload" icon="i-lucide-upload" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="videos" :columns="columns" :loading="loading" sticky>
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
                            <input type="file" accept="video/*" @change="handleFileChange"
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
