<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiBlogTag {
    blogId: number
    tagId: number
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { blogTags, loading, total, fetchBlogTags, createBlogTag, deleteBlogTag } = useBlogTags()
        const { blogs, fetchBlogs } = useBlogs()
        const { tags, fetchTags } = useTags()
        const toast = useToast()
        return {
            blogTags,
            loading,
            total,
            fetchBlogTags,
            createBlogTag,
            deleteBlogTag,
            blogs,
            fetchBlogs,
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
                blogId: undefined as number | undefined,
                tagId: undefined as number | undefined,
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiBlogTag>[] {
            return [
                { accessorKey: 'blogId', header: 'Blog' },
                { accessorKey: 'tagId', header: 'Tag' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        blogOptions() {
            return this.blogs.map(b => ({ label: b.title, value: b.id }))
        },
        tagOptions() {
            return this.tags.map(t => ({ label: t.name, value: t.id }))
        },
    },
    watch: {
        offset() {
            this.fetchBlogTags({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchBlogTags({ limit: this.limit, offset: this.offset })
        this.fetchBlogs({ limit: 100 })
        this.fetchTags({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { blogId: undefined, tagId: undefined }
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.blogId == null || this.form.tagId == null) return
            this.submitting = true
            try {
                await this.createBlogTag(this.form as { blogId: number; tagId: number })
                this.toast.add({ title: 'Tag assigned to blog', color: 'success' })
                this.showCreateModal = false
                this.resetForm()
                this.fetchBlogTags({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to create blog tag:', error)
                this.toast.add({ title: 'Failed to assign tag', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(bt: ApiBlogTag) {
            if (confirm('Remove this blog tag assignment?')) {
                try {
                    await this.deleteBlogTag({ blogId: bt.blogId, tagId: bt.tagId })
                    this.toast.add({ title: 'Tag removed', color: 'success' })
                    this.fetchBlogTags({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete blog tag:', error)
                    this.toast.add({ title: 'Failed to remove tag', color: 'error' })
                }
            }
        },
        getBlogTitle(blogId: number) {
            const blog = this.blogs.find(b => b.id === blogId)
            return blog ? blog.title : `Blog #${blogId}`
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
            <UDashboardNavbar title="Blog Tags">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Assign" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="blogTags" :columns="columns" :loading="loading" sticky>
                <template #blogId-cell="{ row }">
                    {{ getBlogTitle(row.original.blogId) }}
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

            <UModal v-model:open="showCreateModal" title="Assign Tag to Blog">
                <template #body>
                    <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
                        <UFormField label="Blog" required>
                            <USelectMenu v-model="form.blogId" :items="blogOptions" placeholder="Select blog" valueKey="value" labelKey="label"/>
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
