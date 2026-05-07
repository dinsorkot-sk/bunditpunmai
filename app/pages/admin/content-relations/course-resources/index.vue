<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useCourseResources } from '~/composables/v1/useCourseResources'
import { useCourses } from '~/composables/v1/useCourses'
import { useResources } from '~/composables/v1/useResources'

definePageMeta({ layout: 'admin' })

interface ApiCourseResource {
  id: number
  courseId: number
  resourceId: number
}

const { courseResources, loading, total, fetchCourseResources, createCourseResource, deleteCourseResource } = useCourseResources()
const { courses, fetchCourses } = useCourses()
const { resources, fetchResources } = useResources()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const submitting = ref(false)
const form = ref({
  courseId: undefined as number | undefined,
  resourceId: undefined as number | undefined,
})

const columns = computed<TableColumn<ApiCourseResource>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'courseId', header: 'Course' },
  { accessorKey: 'resourceId', header: 'Resource' },
  { accessorKey: 'actions', header: 'Actions' },
])

const courseOptions = computed(() => courses.value.map(c => ({ label: c.title, value: c.id })))
const resourceOptions = computed(() => resources.value.map(r => ({ label: r.title, value: r.id })))

function resetForm() {
  form.value = { courseId: undefined, resourceId: undefined }
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.courseId == null || form.value.resourceId == null) return
  submitting.value = true
  try {
    await createCourseResource(form.value as { courseId: number; resourceId: number })
    toast.add({ title: 'Resource assigned to course', color: 'success' })
    showCreateModal.value = false
    resetForm()
    fetchCourseResources({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to create course resource:', error)
    toast.add({ title: 'Failed to assign resource', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(cr: { courseId: number; resourceId: number }) {
  if (confirm('Remove this course resource assignment?')) {
    try {
      await deleteCourseResource({ courseId: cr.courseId, resourceId: cr.resourceId })
      toast.add({ title: 'Resource removed', color: 'success' })
      fetchCourseResources({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete course resource:', error)
      toast.add({ title: 'Failed to remove resource', color: 'error' })
    }
  }
}

function getCourseTitle(courseId: number) {
  const course = courses.value.find(c => c.id === courseId)
  return course ? course.title : `Course #${courseId}`
}

function getResourceTitle(resourceId: number) {
  const resource = resources.value.find(r => r.id === resourceId)
  return resource ? resource.title : `Resource #${resourceId}`
}

watch(offset, () => {
  fetchCourseResources({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchCourseResources({ limit: limit.value, offset: offset.value })
  fetchCourses({ limit: 100 })
  fetchResources({ limit: 100 })
})
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
              <USelectMenu v-model="form.courseId" :items="courseOptions" placeholder="Select course" valueKey="value" labelKey="label" />
            </UFormField>
            <UFormField label="Resource" required>
              <USelectMenu v-model="form.resourceId" :items="resourceOptions"
                placeholder="Select resource" valueKey="value" labelKey="label" />
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
