<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiBlog {
  id: number
  title: string
  description: string
  content: string
  status: string
  likes: number
  authorId: number
  createdAt: string
}

const { user } = useAuth()
const toast = useToast()

const blogs = ref<ApiBlog[]>([])
const loading = ref(false)
const total = ref(0)
const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingBlog = ref<ApiBlog | null>(null)
const submitting = ref(false)
const form = ref({
  title: '',
  description: '',
  content: '',
  status: 'draft',
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const columns = computed<TableColumn<ApiBlog>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'likes', header: 'Likes' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingBlog.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Blog' : 'Create Blog')

async function fetchMyBlogs() {
  if (!user.value) return
  loading.value = true
  try {
    const result = await $fetch<ApiBlog[]>('/api/v1/blogs', {
      query: { limit: limit.value, offset: offset.value, authorId: user.value.id }
    })
    blogs.value = result
    total.value = result.length
  } catch (err) {
    toast.add({ title: 'Failed to load blogs', color: 'error' })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { title: '', description: '', content: '', status: 'draft' }
  editingBlog.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(blog: ApiBlog) {
  editingBlog.value = blog
  form.value = {
    title: blog.title,
    description: blog.description,
    content: blog.content,
    status: blog.status,
  }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value || !user.value) return
  submitting.value = true
  try {
    if (isEditing.value && editingBlog.value) {
      await $fetch(`/api/v1/blogs/${editingBlog.value.id}`, {
        method: 'PATCH',
        body: { ...form.value, authorId: user.value.id }
      })
      toast.add({ title: 'Blog updated', color: 'success' })
    } else {
      await $fetch('/api/v1/blogs', {
        method: 'POST',
        body: { ...form.value, authorId: user.value.id }
      })
      toast.add({ title: 'Blog created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchMyBlogs()
  } catch (err) {
    toast.add({ title: 'Failed to save blog', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function handleDelete(blog: ApiBlog) {
  if (confirm(`Delete blog "${blog.title}"?`)) {
    try {
      await $fetch(`/api/v1/blogs/${blog.id}`, { method: 'DELETE' })
      toast.add({ title: 'Blog deleted', color: 'success' })
      fetchMyBlogs()
    } catch (err) {
      toast.add({ title: 'Failed to delete blog', color: 'error' })
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => fetchMyBlogs())
onMounted(() => fetchMyBlogs())
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="My Blogs">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create Blog" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="blogs" :columns="columns" :loading="loading" sticky>
        <template #status-cell="{ row }">
          <UBadge :label="row.original.status"
            :color="row.original.status === 'published' ? 'success' : row.original.status === 'draft' ? 'warning' : 'neutral'"
            class="capitalize" />
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click="openEditModal(row.original)" />
            <UButton icon="i-lucide-trash" variant="ghost" size="xs" color="error" @click="handleDelete(row.original)" />
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
              <UInput v-model="form.title" placeholder="Enter blog title" class="w-full" />
            </UFormField>
            <UFormField label="Description" required>
              <UTextarea v-model="form.description" placeholder="Enter blog description" class="w-full" />
            </UFormField>
            <UFormField label="Content" required>
              <Editor v-model="form.content" class="w-full" />
            </UFormField>
            <UFormField label="Status" required>
              <USelectMenu v-model="form.status" :items="statusOptions" valueKey="value" labelKey="label" />
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
