<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useCourses } from '~/composables/v1/useCourses'
import { useUsers } from '~/composables/v1/useUsers'

definePageMeta({ layout: 'admin' })

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

const { courses, loading, total, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourses()
const { users, fetchUsers } = useUsers()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingCourse = ref<ApiCourse | null>(null)
const submitting = ref(false)
const form = ref({
  title: '',
  description: '',
  content: '',
  status: 'draft',
  instructorId: undefined as number | undefined,
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const columns = computed<TableColumn<ApiCourse>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'likes', header: 'Likes' },
  { accessorKey: 'instructorId', header: 'Instructor' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingCourse.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Course' : 'Create Course')
const instructorOptions = computed(() => users.value.map(u => ({ label: u.name, value: u.id })))

function resetForm() {
  form.value = { title: '', description: '', content: '', status: 'draft', instructorId: undefined }
  editingCourse.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(course: ApiCourse) {
  editingCourse.value = course
  form.value = {
    title: course.title,
    description: course.description,
    content: course.content,
    status: course.status,
    instructorId: course.instructorId,
  }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.instructorId == null) return

  submitting.value = true
  try {
    if (isEditing.value && editingCourse.value) {
      await updateCourse(editingCourse.value.id, form.value as any)
      toast.add({ title: 'Course updated', color: 'success' })
    }
    else {
      await createCourse(form.value as any)
      toast.add({ title: 'Course created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchCourses({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save course:', error)
    toast.add({ title: 'Failed to save course', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(course: { id: number; title: string }) {
  if (confirm(`Delete course "${course.title}"?`)) {
    try {
      await deleteCourse(course.id)
      toast.add({ title: 'Course deleted', color: 'success' })
      fetchCourses({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete course:', error)
      toast.add({ title: 'Failed to delete course', color: 'error' })
    }
  }
}

function getInstructorName(instructorId: number) {
  const user = users.value.find(u => u.id === instructorId)
  return user ? user.name : `User #${instructorId}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => {
  fetchCourses({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchCourses({ limit: limit.value, offset: offset.value })
  fetchUsers({ limit: 100 })
})
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
              <Editor v-model="form.content" class="w-full" />
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
