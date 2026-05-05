<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiPostTag {
    postId: number
    tagId: number
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { postTags, loading, total, fetchPostTags, createPostTag, deletePostTag } = usePostTags()
        const { posts, fetchPosts } = usePosts()
        const { tags, fetchTags } = useTags()
        const toast = useToast()
        return {
            postTags,
            loading,
            total,
            fetchPostTags,
            createPostTag,
            deletePostTag,
            posts,
            fetchPosts,
            tags,
            fetchTags,
            toast,
        }
    },
    data() {
        return {
            limit: 20,
            offset: 0,
            showCreateModal: false,
            submitting: false,
            form: {
                postId: undefined as number | undefined,
                tagId: undefined as number | undefined,
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiPostTag>[] {
            return [
                { accessorKey: 'postId', header: 'Post' },
                { accessorKey: 'tagId', header: 'Tag' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        postOptions() {
            return this.posts.map(p => ({ label: p.title, value: p.id }))
        },
        tagOptions() {
            return this.tags.map(t => ({ label: t.name, value: t.id }))
        },
    },
    watch: {
        offset() {
            this.fetchPostTags({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchPostTags({ limit: this.limit, offset: this.offset })
        this.fetchPosts({ limit: 100 })
        this.fetchTags({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { postId: undefined, tagId: undefined }
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.postId == null || this.form.tagId == null) return
            this.submitting = true
            try {
                await this.createPostTag(this.form as { postId: number; tagId: number })
                this.toast.add({ title: 'Tag assigned to post', color: 'success' })
                this.showCreateModal = false
                this.resetForm()
                this.fetchPostTags({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to create post tag:', error)
                this.toast.add({ title: 'Failed to assign tag', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(pt: ApiPostTag) {
            if (confirm('Remove this post tag assignment?')) {
                try {
                    await this.deletePostTag({ postId: pt.postId, tagId: pt.tagId })
                    this.toast.add({ title: 'Tag removed', color: 'success' })
                    this.fetchPostTags({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete post tag:', error)
                    this.toast.add({ title: 'Failed to remove tag', color: 'error' })
                }
            }
        },
        getPostTitle(postId: number) {
            const post = this.posts.find(p => p.id === postId)
            return post ? post.title : `Post #${postId}`
        },
        getTagName(tagId: number) {
            const tag = this.tags.find(t => t.id === tagId)
            return tag ? tag.name : `Tag #${tagId}`
        },
    },
}
</script>
<template>
    <UDashboardPanel resizable>
        <template #header>
            <UDashboardNavbar title="Post Tags">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Assign" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="postTags" :columns="columns" :loading="loading" sticky>
                <template #postId-cell="{ row }">
                    {{ getPostTitle(row.original.postId) }}
                </template>
                <template #tagId-cell="{ row }">
                    <UBadge :label="getTagName(row.original.tagId)" color="neutral" />
                </template>
                <template #actions-cell="{ row }">
                    <UButton icon="i-lucide-trash" variant="ghost" size="xs" color="error"
                        @click="handleDelete(row.original)" />
                </template>
            </UTable>

            <div class="flex justify-end gap-2 mt-4">
                <UButton label="Previous" :disabled="offset === 0" @click="offset -= limit" />
                <UButton label="Next" :disabled="total < limit" @click="offset += limit" />
            </div>

            <UModal v-model:open="showCreateModal" title="Assign Tag to Post">
                <template #body>
                    <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
                        <UFormField label="Post" required>
                            <USelectMenu v-model="form.postId" :items="postOptions" placeholder="Select post" valueKey="value" labelKey="label"/>
                        </UFormField>
                        <UFormField label="Tag" required>
                            <USelectMenu v-model="form.tagId" :items="tagOptions" placeholder="Select tag" valueKey="value" labelKey="label"/>
                        </UFormField>
                        <div class="flex justify-end gap-2">
                            <UButton label="Cancel" variant="outline" @click="showCreateModal = false" />
                            <UButton type="submit" label="Assign" color="primary" :loading="submitting" />
                        </div>
                    </UForm>
                </template>
            </UModal>
        </template>
    </UDashboardPanel>
</template>
