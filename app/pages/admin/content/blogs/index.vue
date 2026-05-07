<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useBlogs } from '~/composables/v1/useBlogs'
import { useUsers } from '~/composables/v1/useUsers'

definePageMeta({ layout: 'admin' })

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

const { blogs, loading, total, fetchBlogs, createBlog, updateBlog, deleteBlog } = useBlogs()
const { users, fetchUsers } = useUsers()
const toast = useToast()

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
  authorId: undefined as number | undefined,
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const columns = computed<TableColumn<ApiBlog>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'likes', header: 'Likes' },
  { accessorKey: 'authorId', header: 'Author' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingBlog.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Blog' : 'Create Blog')
const authorOptions = computed(() => users.value.map(u => ({ label: u.name, value: u.id })))

function resetForm() {
  form.value = { title: '', description: '', content: '', status: 'draft', authorId: undefined }
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
    authorId: blog.authorId,
  }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.authorId == null) return

  submitting.value = true
  try {
    if (isEditing.value && editingBlog.value) {
      await updateBlog(editingBlog.value.id, form.value as { title: string; description: string; content: string; status: string; authorId: number; likes?: number })
      toast.add({ title: 'Blog updated', color: 'success' })
    }
    else {
      await createBlog(form.value as { title: string; description: string; content: string; status: string; authorId: number; likes?: number })
      toast.add({ title: 'Blog created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchBlogs({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save blog:', error)
    toast.add({ title: 'Failed to save blog', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(blog: { id: number; title: string }) {
  if (confirm(`Delete blog "${blog.title}"?`)) {
    try {
      await deleteBlog(blog.id)
      toast.add({ title: 'Blog deleted', color: 'success' })
      fetchBlogs({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete blog:', error)
      toast.add({ title: 'Failed to delete blog', color: 'error' })
    }
  }
}

function getAuthorName(authorId: number) {
  const user = users.value.find(u => u.id === authorId)
  return user ? user.name : `User #${authorId}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => {
  fetchBlogs({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchBlogs({ limit: limit.value, offset: offset.value })
  fetchUsers({ limit: 100 })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Blogs">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="blogs" :columns="columns" :loading="loading" sticky>
        <template #description-cell="{ row }">
          <span class="line-clamp-1">{{ row.original.description }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :label="row.original.status"
            :color="row.original.status === 'published' ? 'success' : 'neutral'" />
        </template>
        <template #authorId-cell="{ row }">
          {{ getAuthorName(row.original.authorId) }}
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
            <UFormField label="Author" required>
              <USelectMenu v-model="form.authorId" :items="authorOptions" placeholder="Select author"
                valueKey="value" labelKey="label" />
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
