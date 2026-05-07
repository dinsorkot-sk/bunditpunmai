<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { usePosts } from '~/composables/v1/usePosts'
import { useUsers } from '~/composables/v1/useUsers'

definePageMeta({ layout: 'admin' })

interface ApiPost {
  id: number
  title: string
  content: string
  status: string
  likes: number
  authorId: number
  createdAt: string
}

const { posts, loading, total, fetchPosts, createPost, updatePost, deletePost } = usePosts()
const { users, fetchUsers } = useUsers()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingPost = ref<ApiPost | null>(null)
const submitting = ref(false)
const form = ref({
  title: '',
  content: '',
  status: 'draft',
  authorId: undefined as number | undefined,
})

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const columns = computed<TableColumn<ApiPost>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'likes', header: 'Likes' },
  { accessorKey: 'authorId', header: 'Author' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingPost.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Post' : 'Create Post')
const authorOptions = computed(() => users.value.map(u => ({ label: u.name, value: u.id })))

function resetForm() {
  form.value = { title: '', content: '', status: 'draft', authorId: undefined }
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
    authorId: post.authorId,
  }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.authorId == null) return

  submitting.value = true
  try {
    if (isEditing.value && editingPost.value) {
      await updatePost(editingPost.value.id, form.value as any)
      toast.add({ title: 'Post updated', color: 'success' })
    }
    else {
      await createPost(form.value as any)
      toast.add({ title: 'Post created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchPosts({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save post:', error)
    toast.add({ title: 'Failed to save post', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(post: { id: number; title: string }) {
  if (confirm(`Delete post "${post.title}"?`)) {
    try {
      await deletePost(post.id)
      toast.add({ title: 'Post deleted', color: 'success' })
      fetchPosts({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete post:', error)
      toast.add({ title: 'Failed to delete post', color: 'error' })
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
  fetchPosts({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchPosts({ limit: limit.value, offset: offset.value })
  fetchUsers({ limit: 100 })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Posts">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="posts" :columns="columns" :loading="loading" sticky>
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
