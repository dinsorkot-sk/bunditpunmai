<script lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useComments } from '~/composables/v1/useComments'
import { useUsers } from '~/composables/v1/useUsers'
import { usePosts } from '~/composables/v1/usePosts'

interface ApiComment {
    id: number
    content: string
    status: string
    postId: number
    authorId: number
    createdAt: string
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { comments, loading, total, fetchComments, createComment, updateComment, deleteComment } = useComments()
        const { users, fetchUsers } = useUsers()
        const { posts, fetchPosts } = usePosts()
        const toast = useToast()
        return {
            comments,
            loading,
            total,
            fetchComments,
            createComment,
            updateComment,
            deleteComment,
            users,
            fetchUsers,
            posts,
            fetchPosts,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            editingComment: null as ApiComment | null,
            submitting: false,
            form: {
                content: '',
                status: 'active',
                postId: undefined as number | undefined,
                authorId: undefined as number | undefined,
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiComment>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'content', header: 'Content' },
                { accessorKey: 'status', header: 'Status' },
                { accessorKey: 'postId', header: 'Post' },
                { accessorKey: 'authorId', header: 'Author' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingComment
        },
        modalTitle() {
            return this.isEditing ? 'Edit Comment' : 'Create Comment'
        },
        authorOptions() {
            return this.users.map(u => ({ label: u.name, value: u.id }))
        },
        postOptions() {
            return this.posts.map(p => ({ label: p.title, value: p.id }))
        },
        statusOptions() {
            return [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Spam', value: 'spam' },
            ]
        },
    },
    watch: {
        offset() {
            this.fetchComments({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchComments({ limit: this.limit, offset: this.offset })
        this.fetchUsers({ limit: 100 })
        this.fetchPosts({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { content: '', status: 'active', postId: undefined, authorId: undefined }
            this.editingComment = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(comment: ApiComment) {
            this.editingComment = comment
            this.form = { content: comment.content, status: comment.status, postId: comment.postId, authorId: comment.authorId }
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.postId == null || this.form.authorId == null) return
            this.submitting = true
            try {
                if (this.isEditing && this.editingComment) {
                    await this.updateComment(this.editingComment.id, this.form as { content: string; status: string; postId: number; authorId: number })
                    this.toast.add({ title: 'Comment updated', color: 'success' })
                }
                else {
                    await this.createComment(this.form as { content: string; status: string; postId: number; authorId: number })
                    this.toast.add({ title: 'Comment created', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchComments({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to save comment:', error)
                this.toast.add({ title: 'Failed to save comment', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(comment: { id: number }) {
            if (confirm('Delete this comment?')) {
                try {
                    await this.deleteComment(comment.id)
                    this.toast.add({ title: 'Comment deleted', color: 'success' })
                    this.fetchComments({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete comment:', error)
                    this.toast.add({ title: 'Failed to delete comment', color: 'error' })
                }
            }
        },
        getAuthorName(authorId: number) {
            const user = this.users.find(u => u.id === authorId)
            return user ? user.name : `User #${authorId}`
        },
        getPostTitle(postId: number) {
            const post = this.posts.find(p => p.id === postId)
            return post ? post.title : `Post #${postId}`
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
            <UDashboardNavbar title="Comments">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="comments" :columns="columns" :loading="loading" sticky>
                <template #content-cell="{ row }">
                    <span class="line-clamp-1">{{ row.original.content }}</span>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :label="row.original.status"
                        :color="row.original.status === 'active' ? 'success' : row.original.status === 'spam' ? 'error' : 'neutral'" />
                </template>
                <template #postId-cell="{ row }">
                    {{ getPostTitle(row.original.postId) }}
                </template>
                <template #authorId-cell="{ row }">
                    {{ getAuthorName(row.original.authorId) }}
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
                        <UFormField label="Content" required>
                            <UTextarea v-model="form.content" placeholder="Enter comment" :rows="3" class="w-full"/>
                        </UFormField>
                        <UFormField label="Status" required>
                            <USelectMenu v-model="form.status" :items="statusOptions" valueKey="value" labelKey="label"/>
                        </UFormField>
                        <UFormField label="Post" required>
                            <USelectMenu v-model="form.postId" :items="postOptions" placeholder="Select post" valueKey="value" labelKey="label"/>
                        </UFormField>
                        <UFormField label="Author" required>
                            <USelectMenu v-model="form.authorId" :items="authorOptions" placeholder="Select author" valueKey="value" labelKey="label"/>
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
