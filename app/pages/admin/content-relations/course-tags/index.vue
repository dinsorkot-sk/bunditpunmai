<script lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useCourseTags } from '~/composables/v1/useCourseTags'
import { useCourses } from '~/composables/v1/useCourses'
import { useTags } from '~/composables/v1/useTags'

interface ApiCourseTag {
    courseId: number
    tagId: number
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { courseTags, loading, total, fetchCourseTags, createCourseTag, deleteCourseTag } = useCourseTags()
        const { courses, fetchCourses } = useCourses()
        const { tags, fetchTags } = useTags()
        const toast = useToast()
        return {
            courseTags,
            loading,
            total,
            fetchCourseTags,
            createCourseTag,
            deleteCourseTag,
            courses,
            fetchCourses,
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
                courseId: undefined as number | undefined,
                tagId: undefined as number | undefined,
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiCourseTag>[] {
            return [
                { accessorKey: 'courseId', header: 'Course' },
                { accessorKey: 'tagId', header: 'Tag' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        courseOptions() {
            return this.courses.map(c => ({ label: c.title, value: c.id }))
        },
        tagOptions() {
            return this.tags.map(t => ({ label: t.name, value: t.id }))
        },
    },
    watch: {
        offset() {
            this.fetchCourseTags({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchCourseTags({ limit: this.limit, offset: this.offset })
        this.fetchCourses({ limit: 100 })
        this.fetchTags({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { courseId: undefined, tagId: undefined }
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.courseId == null || this.form.tagId == null) return
            this.submitting = true
            try {
                await this.createCourseTag(this.form as { courseId: number; tagId: number })
                this.toast.add({ title: 'Tag assigned to course', color: 'success' })
                this.showCreateModal = false
                this.resetForm()
                this.fetchCourseTags({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to create course tag:', error)
                this.toast.add({ title: 'Failed to assign tag', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(ct: ApiCourseTag) {
            if (confirm('Remove this course tag assignment?')) {
                try {
                    await this.deleteCourseTag({ courseId: ct.courseId, tagId: ct.tagId })
                    this.toast.add({ title: 'Tag removed', color: 'success' })
                    this.fetchCourseTags({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete course tag:', error)
                    this.toast.add({ title: 'Failed to remove tag', color: 'error' })
                }
            }
        },
        getCourseTitle(courseId: number) {
            const course = this.courses.find(c => c.id === courseId)
            return course ? course.title : `Course #${courseId}`
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
            <UDashboardNavbar title="Course Tags">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Assign" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="courseTags" :columns="columns" :loading="loading" sticky>
                <template #courseId-cell="{ row }">
                    {{ getCourseTitle(row.original.courseId) }}
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

            <UModal v-model:open="showCreateModal" title="Assign Tag to Course">
                <template #body>
                    <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
                        <UFormField label="Course" required>
                            <USelectMenu v-model="form.courseId" :items="courseOptions" placeholder="Select course" valueKey="value" labelKey="label"/>
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
