<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useCourseTags } from '~/composables/v1/useCourseTags'
import { useCourses } from '~/composables/v1/useCourses'
import { useTags } from '~/composables/v1/useTags'

definePageMeta({ layout: 'admin' })

interface ApiCourseTag {
  courseId: number
  tagId: number
}

const { courseTags, loading, total, fetchCourseTags, createCourseTag, deleteCourseTag } = useCourseTags()
const { courses, fetchCourses } = useCourses()
const { tags, fetchTags } = useTags()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const submitting = ref(false)
const form = ref({
  courseId: undefined as number | undefined,
  tagId: undefined as number | undefined,
})

const columns = computed<TableColumn<ApiCourseTag>[]>(() => [
  { accessorKey: 'courseId', header: 'Course' },
  { accessorKey: 'tagId', header: 'Tag' },
  { accessorKey: 'actions', header: 'Actions' },
])

const courseOptions = computed(() => courses.value.map(c => ({ label: c.title, value: c.id })))
const tagOptions = computed(() => tags.value.map(t => ({ label: t.name, value: t.id })))

function resetForm() {
  form.value = { courseId: undefined, tagId: undefined }
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.courseId == null || form.value.tagId == null) return
  submitting.value = true
  try {
    await createCourseTag(form.value as { courseId: number; tagId: number })
    toast.add({ title: 'Tag assigned to course', color: 'success' })
    showCreateModal.value = false
    resetForm()
    fetchCourseTags({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to create course tag:', error)
    toast.add({ title: 'Failed to assign tag', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(ct: ApiCourseTag) {
  if (confirm('Remove this course tag assignment?')) {
    try {
      await deleteCourseTag({ courseId: ct.courseId, tagId: ct.tagId })
      toast.add({ title: 'Tag removed', color: 'success' })
      fetchCourseTags({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete course tag:', error)
      toast.add({ title: 'Failed to remove tag', color: 'error' })
    }
  }
}

function getCourseTitle(courseId: number) {
  const course = courses.value.find(c => c.id === courseId)
  return course ? course.title : `Course #${courseId}`
}

function getTagName(tagId: number) {
  const tag = tags.value.find(t => t.id === tagId)
  return tag ? tag.name : `Tag #${tagId}`
}

watch(offset, () => {
  fetchCourseTags({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchCourseTags({ limit: limit.value, offset: offset.value })
  fetchCourses({ limit: 100 })
  fetchTags({ limit: 100 })
})
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
              <USelectMenu v-model="form.courseId" :items="courseOptions" placeholder="Select course" valueKey="value" labelKey="label" />
            </UFormField>
            <UFormField label="Tag" required>
              <USelectMenu v-model="form.tagId" :items="tagOptions" placeholder="Select tag" valueKey="value" labelKey="label" />
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
