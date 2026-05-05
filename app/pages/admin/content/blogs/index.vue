<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiBlog {
    id: number
    title: string
    description: string
    content: string
    status: string
    likes: number
    authorId: number
    createdAt: string
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { blogs, loading, total, fetchBlogs, createBlog, updateBlog, deleteBlog } = useBlogs()
        const { users, fetchUsers } = useUsers()
        const toast = useToast()
        return {
            blogs,
            loading,
            total,
            fetchBlogs,
            createBlog,
            updateBlog,
            deleteBlog,
            users,
            fetchUsers,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingBlog: null as ApiBlog | null,
            submitting: false,
            form: {
                title: '',
                description: '',
                content: '',
                status: 'draft',
                authorId: undefined as number | undefined,
            },
            statusOptions: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
            ],
        }
    },
    computed: {
        columns(): TableColumn<ApiBlog>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'title', header: 'Title' },
                { accessorKey: 'description', header: 'Description' },
                { accessorKey: 'status', header: 'Status' },
                { accessorKey: 'likes', header: 'Likes' },
                { accessorKey: 'authorId', header: 'Author' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingBlog
        },
        modalTitle() {
            return this.isEditing ? 'Edit Blog' : 'Create Blog'
        },
        authorOptions() {
            return this.users.map(u => ({ label: u.name, value: u.id }))
        },
    },
    watch: {
        offset() {
            this.fetchBlogs({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchBlogs({ limit: this.limit, offset: this.offset })
        this.fetchUsers({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { title: '', description: '', content: '', status: 'draft', authorId: undefined }
            this.editingBlog = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(blog: ApiBlog) {
            this.editingBlog = blog
            this.form = {
                title: blog.title,
                description: blog.description,
                content: blog.content,
                status: blog.status,
                authorId: blog.authorId,
            }
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.authorId == null) return

            this.submitting = true
            try {
                if (this.isEditing && this.editingBlog) {
                    await this.updateBlog(this.editingBlog.id, this.form as { title: string; description: string; content: string; status: string; authorId: number; likes?: number })
                    this.toast.add({ title: 'Blog updated', color: 'success' })
                } else {
                    await this.createBlog(this.form as { title: string; description: string; content: string; status: string; authorId: number; likes?: number })
                    this.toast.add({ title: 'Blog created', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchBlogs({ limit: this.limit, offset: this.offset })
            } catch (error: unknown) {
                console.error('Failed to save blog:', error)
                this.toast.add({ title: 'Failed to save blog', color: 'error' })
            } finally {
                this.submitting = false
            }
        },
        async handleDelete(blog: { id: number; title: string }) {
            if (confirm(`Delete blog "${blog.title}"?`)) {
                try {
                    await this.deleteBlog(blog.id)
                    this.toast.add({ title: 'Blog deleted', color: 'success' })
                    this.fetchBlogs({ limit: this.limit, offset: this.offset })
                } catch (error: unknown) {
                    console.error('Failed to delete blog:', error)
                    this.toast.add({ title: 'Failed to delete blog', color: 'error' })
                }
            }
        },
        getAuthorName(authorId: number) {
            const user = this.users.find(u => u.id === authorId)
            return user ? user.name : `User #${authorId}`
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
            <UDashboardNavbar title="Blogs">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="blogs" :columns="columns" :loading="loading" sticky>
                <template #description-cell="{ row }">
                    <span class="line-clamp-1">{{ row.original.description }}</span>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :label="row.original.status"
                        :color="row.original.status === 'published' ? 'success' : 'neutral'" />
                </template>
                <template #authorId-cell="{ row }">
                    {{ getAuthorName(row.original.authorId) }}
                </template>
                <template #createdAt-cell="{ row }">
                    {{ formatDate(row.original.createdAt) }}
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex gap-1">
                        <UButton icon="i-lucide-pencil" variant="ghost" size="xs"
                            @click="openEditModal(row.original)" />
                        <UButton icon="i-lucide-trash" variant="ghost" size="xs" color="error"
                            @click="handleDelete(row.original)" />
                    </div>
                </template>
            </UTable>

            <div class="flex justify-end gap-2 mt-4">
                <UButton label="Previous" :disabled="offset === 0" @click="offset -= limit" />
                <UButton label="Next" :disabled="total < limit" @click="offset += limit" />
            </div>

            <UModal v-model:open="showCreateModal" :title="modalTitle" fullscreen>
                <template #body>
                    <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
                        <UFormField label="Title" required>
                            <UInput v-model="form.title" placeholder="Enter title" class="w-full" />
                        </UFormField>
                        <UFormField label="Description" required>
                            <UInput v-model="form.description" placeholder="Enter description" class="w-full" />
                        </UFormField>
                        <UFormField label="Content" required>
                            <UTextarea v-model="form.content" placeholder="Write your blog content..." :rows="12"
                                class="w-full" />
                        </UFormField>
                        <UFormField label="Status" required>
                            <USelectMenu v-model="form.status" :items="statusOptions" valueKey="value"
                                labelKey="label" />
                        </UFormField>
                        <UFormField label="Author" required>
                            <USelectMenu v-model="form.authorId" :items="authorOptions" placeholder="Select author"
                                valueKey="value" labelKey="label" />
                        </UFormField>
                        <div class="flex justify-end gap-2">
                            <UButton label="Cancel" variant="outline" @click="showCreateModal = false" />
                            <UButton type="submit" :label="isEditing ? 'Update' : 'Create'" color="primary"
                                :loading="submitting" />
                        </div>
                    </UForm>
                </template>
            </UModal>
        </template>
    </UDashboardPanel>
</template>