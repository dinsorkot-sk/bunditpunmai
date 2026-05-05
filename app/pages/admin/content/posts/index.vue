<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiPost {
    id: number
    title: string
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
        const { posts, loading, total, fetchPosts, createPost, updatePost, deletePost } = usePosts()
        const { users, fetchUsers } = useUsers()
        const toast = useToast()
        return {
            posts,
            loading,
            total,
            fetchPosts,
            createPost,
            updatePost,
            deletePost,
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
            editingPost: null as ApiPost | null,
            submitting: false,
            form: {
                title: '',
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
        columns(): TableColumn<ApiPost>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'title', header: 'Title' },
                { accessorKey: 'status', header: 'Status' },
                { accessorKey: 'likes', header: 'Likes' },
                { accessorKey: 'authorId', header: 'Author' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingPost
        },
        modalTitle() {
            return this.isEditing ? 'Edit Post' : 'Create Post'
        },
        authorOptions() {
            return this.users.map(u => ({ label: u.name, value: u.id }))
        },
    },
    watch: {
        offset() {
            this.fetchPosts({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchPosts({ limit: this.limit, offset: this.offset })
        this.fetchUsers({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { title: '', content: '', status: 'draft', authorId: undefined }
            this.editingPost = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(post: ApiPost) {
            this.editingPost = post
            this.form = {
                title: post.title,
                content: post.content,
                status: post.status,
                authorId: post.authorId
            }
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.authorId == null) return

            this.submitting = true
            try {
                if (this.isEditing && this.editingPost) {
                    await this.updatePost(this.editingPost.id, this.form as any)
                    this.toast.add({ title: 'Post updated', color: 'success' })
                } else {
                    await this.createPost(this.form as any)
                    this.toast.add({ title: 'Post created', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchPosts({ limit: this.limit, offset: this.offset })
            } catch (error: unknown) {
                console.error('Failed to save post:', error)
                this.toast.add({ title: 'Failed to save post', color: 'error' })
            } finally {
                this.submitting = false
            }
        },
        async handleDelete(post: ApiPost) {
            if (confirm(`Delete post "${post.title}"?`)) {
                try {
                    await this.deletePost(post.id)
                    this.toast.add({ title: 'Post deleted', color: 'success' })
                    this.fetchPosts({ limit: this.limit, offset: this.offset })
                } catch (error: unknown) {
                    console.error('Failed to delete post:', error)
                    this.toast.add({ title: 'Failed to delete post', color: 'error' })
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
            <UDashboardNavbar title="Posts">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="posts" :columns="columns" :loading="loading" sticky>
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
                        <UFormField label="Content" required>
                            <UTextarea v-model="form.content" placeholder="Write your post content..." :rows="12"
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