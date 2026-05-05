<script lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiCourse {
    id: number
    title: string
    description: string
    content: string
    status: string
    likes: number
    instructorId: number
    createdAt: string
}

export default {
    setup() {
        definePageMeta({
            layout: 'admin',
        })
        const { courses, loading, total, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourses()
        const { users, fetchUsers } = useUsers()
        const toast = useToast()
        return {
            courses,
            loading,
            total,
            fetchCourses,
            createCourse,
            updateCourse,
            deleteCourse,
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
            editingCourse: null as ApiCourse | null,
            submitting: false,
            form: {
                title: '',
                description: '',
                content: '',
                status: 'draft',
                instructorId: undefined as number | undefined,
            },
            statusOptions: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
            ],
        }
    },
    computed: {
        columns(): TableColumn<ApiCourse>[] {
            return [
                { accessorKey: 'id', header: 'ID' },
                { accessorKey: 'title', header: 'Title' },
                { accessorKey: 'description', header: 'Description' },
                { accessorKey: 'status', header: 'Status' },
                { accessorKey: 'likes', header: 'Likes' },
                { accessorKey: 'instructorId', header: 'Instructor' },
                { accessorKey: 'createdAt', header: 'Created At' },
                { accessorKey: 'actions', header: 'Actions' },
            ]
        },
        isEditing() {
            return !!this.editingCourse
        },
        modalTitle() {
            return this.isEditing ? 'Edit Course' : 'Create Course'
        },
        instructorOptions() {
            return this.users.map(u => ({ label: u.name, value: u.id }))
        },
    },
    watch: {
        offset() {
            this.fetchCourses({ limit: this.limit, offset: this.offset })
        },
    },
    mounted() {
        this.fetchCourses({ limit: this.limit, offset: this.offset })
        this.fetchUsers({ limit: 100 })
    },
    methods: {
        resetForm() {
            this.form = { title: '', description: '', content: '', status: 'draft', instructorId: undefined }
            this.editingCourse = null
        },
        openCreateModal() {
            this.resetForm()
            this.showCreateModal = true
        },
        openEditModal(course: ApiCourse) {
            this.editingCourse = course
            this.form = {
                title: course.title,
                description: course.description,
                content: course.content,
                status: course.status,
                instructorId: course.instructorId
            }
            this.showCreateModal = true
        },
        async handleSubmit() {
            if (this.submitting) return
            if (this.form.instructorId == null) return

            this.submitting = true
            try {
                if (this.isEditing && this.editingCourse) {
                    await this.updateCourse(this.editingCourse.id, this.form as any)
                    this.toast.add({ title: 'Course updated', color: 'success' })
                } else {
                    await this.createCourse(this.form as any)
                    this.toast.add({ title: 'Course created', color: 'success' })
                }
                this.showCreateModal = false
                this.resetForm()
                this.fetchCourses({ limit: this.limit, offset: this.offset })
            } catch (error: unknown) {
                console.error('Failed to save course:', error)
                this.toast.add({ title: 'Failed to save course', color: 'error' })
            } finally {
                this.submitting = false
            }
        },
        async handleDelete(course: { id: number; title: string }) {
            if (confirm(`Delete course "${course.title}"?`)) {
                try {
                    await this.deleteCourse(course.id)
                    this.toast.add({ title: 'Course deleted', color: 'success' })
                    this.fetchCourses({ limit: this.limit, offset: this.offset })
                } catch (error: unknown) {
                    console.error('Failed to delete course:', error)
                    this.toast.add({ title: 'Failed to delete course', color: 'error' })
                }
            }
        },
        getInstructorName(instructorId: number) {
            const user = this.users.find(u => u.id === instructorId)
            return user ? user.name : `User #${instructorId}`
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
            <UDashboardNavbar title="Courses">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="courses" :columns="columns" :loading="loading" sticky>
                <template #description-cell="{ row }">
                    <span class="line-clamp-1">{{ row.original.description }}</span>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :label="row.original.status"
                        :color="row.original.status === 'published' ? 'success' : 'neutral'" />
                </template>
                <template #instructorId-cell="{ row }">
                    {{ getInstructorName(row.original.instructorId) }}
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
                            <UTextarea v-model="form.content" placeholder="Write your course content..." :rows="12"
                                class="w-full" />
                        </UFormField>
                        <UFormField label="Status" required>
                            <USelectMenu v-model="form.status" :items="statusOptions" valueKey="value"
                                labelKey="label" />
                        </UFormField>
                        <UFormField label="Instructor" required>
                            <USelectMenu v-model="form.instructorId" :items="instructorOptions"
                                placeholder="Select instructor" valueKey="value" labelKey="label" />
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