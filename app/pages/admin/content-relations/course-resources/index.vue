<script lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useCourseResources } from '~/composables/v1/useCourseResources'
import { useCourses } from '~/composables/v1/useCourses'
import { useResources } from '~/composables/v1/useResources'

interface ApiCourseResource {
    id: number
    courseId: number
    resourceId: number
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { courseResources, loading, total, fetchCourseResources, createCourseResource, deleteCourseResource } = useCourseResources()
        const { courses, fetchCourses } = useCourses()
        const { resources, fetchResources } = useResources()
        const toast = useToast()
        return {
            courseResources,
            loading,
            total,
            fetchCourseResources,
            createCourseResource,
            deleteCourseResource,
            courses,
            fetchCourses,
            resources,
            fetchResources,
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
                resourceId: undefined as number | undefined,
            },
        }
    },
    computed: {
        columns(): TableColumn<ApiCourseResource>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'courseId', header: 'Course' },
                { accessorKey: 'resourceId', header: 'Resource' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        courseOptions() {
            return this.courses.map(c => ({ label: c.title, value: c.id }))
        },
        resourceOptions() {
            return this.resources.map(r => ({ label: r.title, value: r.id }))
        },
    },
    watch: {
        offset() {
            this.fetchCourseResources({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchCourseResources({ limit: this.limit, offset: this.offset })
        this.fetchCourses({ limit: 100 })
        this.fetchResources({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { courseId: undefined, resourceId: undefined }
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.courseId == null || this.form.resourceId == null) return
            this.submitting = true
            try {
                await this.createCourseResource(this.form as { courseId: number; resourceId: number })
                this.toast.add({ title: 'Resource assigned to course', color: 'success' })
                this.showCreateModal = false
                this.resetForm()
                this.fetchCourseResources({ limit: this.limit, offset: this.offset })
            }
            catch (error: unknown) {
                console.error('Failed to create course resource:', error)
                this.toast.add({ title: 'Failed to assign resource', color: 'error' })
            }
            finally {
                this.submitting = false
            }
        },
        async handleDelete(cr: { courseId: number; resourceId: number }) {
            if (confirm('Remove this course resource assignment?')) {
                try {
                    await this.deleteCourseResource({ courseId: cr.courseId, resourceId: cr.resourceId })
                    this.toast.add({ title: 'Resource removed', color: 'success' })
                    this.fetchCourseResources({ limit: this.limit, offset: this.offset })
                }
                catch (error: unknown) {
                    console.error('Failed to delete course resource:', error)
                    this.toast.add({ title: 'Failed to remove resource', color: 'error' })
                }
            }
        },
        getCourseTitle(courseId: number) {
            const course = this.courses.find(c => c.id === courseId)
            return course ? course.title : `Course #${courseId}`
        },
        getResourceTitle(resourceId: number) {
            const resource = this.resources.find(r => r.id === resourceId)
            return resource ? resource.title : `Resource #${resourceId}`
        },
    },
}
</script>
<template>
    <UDashboardPanel resizable>
        <template #header>
            <UDashboardNavbar title="Course Resources">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Assign" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="courseResources" :columns="columns" :loading="loading" sticky>
                <template #courseId-cell="{ row }">
                    {{ getCourseTitle(row.original.courseId) }}
                </template>
                <template #resourceId-cell="{ row }">
                    {{ getResourceTitle(row.original.resourceId) }}
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

            <UModal v-model:open="showCreateModal" title="Assign Resource to Course">
                <template #body>
                    <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
                        <UFormField label="Course" required>
                            <USelectMenu v-model="form.courseId" :items="courseOptions" placeholder="Select course" valueKey="value" labelKey="label"/>
                        </UFormField>
                        <UFormField label="Resource" required>
                            <USelectMenu v-model="form.resourceId" :items="resourceOptions"
                                placeholder="Select resource" valueKey="value" labelKey="label"/>
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
