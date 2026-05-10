<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useCourses } from '~/composables/v1/useCourses'
import { useUsers } from '~/composables/v1/useUsers'
import { useImages } from '~/composables/v1/useImages'

definePageMeta({ layout: 'admin' })

interface ApiCourse {
  id: number
  title: string
  description: string
  content: string
  image?: string
  status: string
  likes: number
  instructorId: number
  createdAt: string
}

const { courses, loading, total, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourses()
const { users, fetchUsers } = useUsers()
const { images: galleryImages, fetchImages, createImage } = useImages()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingCourse = ref<ApiCourse | null>(null)
const submitting = ref(false)
const showImagePicker = ref(false)
const uploadingImage = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const form = ref({
  title: '',
  description: '',
  content: '',
  image: '',
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
  { accessorKey: 'image', header: 'Image' },
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
  form.value = { title: '', description: '', content: '', image: '', status: 'draft', instructorId: undefined }
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
    image: course.image || '',
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

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingImage.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('altText', form.value.title || 'Course image')
    const result = await createImage(fd) as { url: string }
    form.value.image = result.url
    toast.add({ title: 'Image uploaded', color: 'success' })
  } catch (error: unknown) {
    console.error('Failed to upload image:', error)
    toast.add({ title: 'Failed to upload image', color: 'error' })
  } finally {
    uploadingImage.value = false
    input.value = ''
  }
}

function openImagePicker() {
  fetchImages({ limit: 100 })
  showImagePicker.value = true
}

function selectImage(img: { url: string }) {
  form.value.image = img.url
  showImagePicker.value = false
}

function removeImage() {
  form.value.image = ''
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
        <template #image-cell="{ row }">
          <img v-if="row.original.image" :src="row.original.image" alt="Thumbnail"
            class="w-16 h-10 object-cover rounded" />
          <span v-else class="text-xs text-gray-400">—</span>
        </template>
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
            <UFormField label="Thumbnail Image">
              <div class="space-y-3 w-full">
                <div v-if="form.image" class="relative inline-block">
                  <img :src="form.image" alt="Thumbnail preview"
                    class="w-32 h-20 object-cover rounded border" />
                  <UButton icon="i-lucide-x" size="2xs" color="error" variant="solid"
                    class="absolute -top-2 -right-2 rounded-full"
                    @click="removeImage" />
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <UButton label="อัปโหลดรูป" icon="i-lucide-upload" color="neutral" variant="outline"
                    :loading="uploadingImage" @click="imageInput?.click()" />
                  <UButton label="เลือกรูปที่มี" icon="i-lucide-image" color="neutral" variant="outline"
                    @click="openImagePicker" />
                  <UInput v-model="form.image" placeholder="หรือวาง URL รูปภาพ" class="flex-1 min-w-[200px]" />
                </div>
                <input ref="imageInput" type="file" accept="image/*" class="hidden"
                  @change="handleImageUpload" />
              </div>
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

      <UModal v-model:open="showImagePicker" title="เลือกรูปภาพ">
        <template #body>
          <div class="space-y-4">
            <UInput v-model="form.image" placeholder="หรือวาง URL รูปภาพโดยตรง" />
            <div v-if="galleryImages.length === 0" class="text-center text-gray-400 py-8">
              ยังไม่มีรูปภาพ
            </div>
            <div v-else class="grid grid-cols-3 gap-3">
              <div v-for="img in galleryImages" :key="img.id"
                class="relative cursor-pointer group border rounded-lg overflow-hidden"
                @click="selectImage(img)">
                <img :src="img.url" :alt="img.altText"
                  class="w-full h-24 object-cover" />
                <div
                  class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-white text-xs font-medium">เลือก</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
