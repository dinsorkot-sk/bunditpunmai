<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiPost {
  id: number
  title: string
  content: string
  status: string
  likes: number
  authorId: number
  createdAt: string
}

const { user } = useAuth()
const toast = useToast()

const posts = ref<ApiPost[]>([])
const loading = ref(false)
const total = ref(0)
const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingPost = ref<ApiPost | null>(null)
const submitting = ref(false)
const form = ref({
  title: '',
  content: '',
  status: 'draft',
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Submit for Review', value: 'pending' },
]

const columns = computed<TableColumn<ApiPost>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'likes', header: 'Likes' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingPost.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Post' : 'Create Post')

async function fetchMyPosts() {
  if (!user.value) return
  loading.value = true
  try {
    const result = await $fetch<ApiPost[]>('/api/v1/posts', {
      query: { limit: limit.value, offset: offset.value, authorId: user.value.id }
    })
    posts.value = result
    total.value = result.length
  } catch (err) {
    toast.add({ title: 'Failed to load posts', color: 'error' })
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { title: '', content: '', status: 'draft' }
  editingPost.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(post: ApiPost) {
  editingPost.value = post
  form.value = {
    title: post.title,
    content: post.content,
    status: post.status,
  }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value || !user.value) return
  submitting.value = true
  try {
    if (isEditing.value && editingPost.value) {
      await $fetch(`/api/v1/posts/${editingPost.value.id}`, {
        method: 'PATCH',
        body: { ...form.value, authorId: user.value.id }
      })
      toast.add({ title: 'Post updated', color: 'success' })
    } else {
      await $fetch('/api/v1/posts', {
        method: 'POST',
        body: { ...form.value, authorId: user.value.id }
      })
      toast.add({ title: 'Post created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchMyPosts()
  } catch (err) {
    toast.add({ title: 'Failed to save post', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function handleDelete(post: ApiPost) {
  if (confirm(`Delete post "${post.title}"?`)) {
    try {
      await $fetch(`/api/v1/posts/${post.id}`, { method: 'DELETE' })
      toast.add({ title: 'Post deleted', color: 'success' })
      fetchMyPosts()
    } catch (err) {
      toast.add({ title: 'Failed to delete post', color: 'error' })
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => fetchMyPosts())
onMounted(() => fetchMyPosts())
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="My Posts">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create Post" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="posts" :columns="columns" :loading="loading" sticky>
        <template #status-cell="{ row }">
          <UBadge :label="row.original.status"
            :color="row.original.status === 'published' ? 'success' : row.original.status === 'pending' ? 'warning' : row.original.status === 'draft' ? 'neutral' : 'neutral'"
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
              <UInput v-model="form.title" placeholder="Enter post title" class="w-full" />
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
