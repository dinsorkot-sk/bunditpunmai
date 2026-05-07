<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useComments } from '~/composables/v1/useComments'
import { useUsers } from '~/composables/v1/useUsers'
import { usePosts } from '~/composables/v1/usePosts'

definePageMeta({ layout: 'admin' })

interface ApiComment {
  id: number
  content: string
  status: string
  postId: number
  authorId: number
  createdAt: string
}

const { comments, loading, total, fetchComments, createComment, updateComment, deleteComment } = useComments()
const { users, fetchUsers } = useUsers()
const { posts, fetchPosts } = usePosts()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingComment = ref<ApiComment | null>(null)
const submitting = ref(false)
const form = ref({
  content: '',
  status: 'active',
  postId: undefined as number | undefined,
  authorId: undefined as number | undefined,
})

const columns = computed<TableColumn<ApiComment>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'content', header: 'Content' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'postId', header: 'Post' },
  { accessorKey: 'authorId', header: 'Author' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingComment.value)
const modalTitle = computed(() => isEditing.value ? 'Edit Comment' : 'Create Comment')
const authorOptions = computed(() => users.value.map(u => ({ label: u.name, value: u.id })))
const postOptions = computed(() => posts.value.map(p => ({ label: p.title, value: p.id })))
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Spam', value: 'spam' },
]

function resetForm() {
  form.value = { content: '', status: 'active', postId: undefined, authorId: undefined }
  editingComment.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(comment: ApiComment) {
  editingComment.value = comment
  form.value = { content: comment.content, status: comment.status, postId: comment.postId, authorId: comment.authorId }
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.postId == null || form.value.authorId == null) return
  submitting.value = true
  try {
    if (isEditing.value && editingComment.value) {
      await updateComment(editingComment.value.id, form.value as { content: string; status: string; postId: number; authorId: number })
      toast.add({ title: 'Comment updated', color: 'success' })
    }
    else {
      await createComment(form.value as { content: string; status: string; postId: number; authorId: number })
      toast.add({ title: 'Comment created', color: 'success' })
    }
    showCreateModal.value = false
    resetForm()
    fetchComments({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to save comment:', error)
    toast.add({ title: 'Failed to save comment', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(comment: { id: number }) {
  if (confirm('Delete this comment?')) {
    try {
      await deleteComment(comment.id)
      toast.add({ title: 'Comment deleted', color: 'success' })
      fetchComments({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete comment:', error)
      toast.add({ title: 'Failed to delete comment', color: 'error' })
    }
  }
}

function getAuthorName(authorId: number) {
  const user = users.value.find(u => u.id === authorId)
  return user ? user.name : `User #${authorId}`
}

function getPostTitle(postId: number) {
  const post = posts.value.find(p => p.id === postId)
  return post ? post.title : `Post #${postId}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

watch(offset, () => {
  fetchComments({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchComments({ limit: limit.value, offset: offset.value })
  fetchUsers({ limit: 100 })
  fetchPosts({ limit: 100 })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Comments">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="comments" :columns="columns" :loading="loading" sticky>
        <template #content-cell="{ row }">
          <span class="line-clamp-1">{{ row.original.content }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :label="row.original.status"
            :color="row.original.status === 'active' ? 'success' : row.original.status === 'spam' ? 'error' : 'neutral'" />
        </template>
        <template #postId-cell="{ row }">
          {{ getPostTitle(row.original.postId) }}
        </template>
        <template #authorId-cell="{ row }">
          {{ getAuthorName(row.original.authorId) }}
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click="openEditModal(row.original)" />
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
            <UFormField label="Content" required>
              <Editor v-model="form.content" class="w-full" />
            </UFormField>
            <UFormField label="Status" required>
              <USelectMenu v-model="form.status" :items="statusOptions" valueKey="value" labelKey="label" />
            </UFormField>
            <UFormField label="Post" required>
              <USelectMenu v-model="form.postId" :items="postOptions" placeholder="Select post" valueKey="value" labelKey="label" />
            </UFormField>
            <UFormField label="Author" required>
              <USelectMenu v-model="form.authorId" :items="authorOptions" placeholder="Select author" valueKey="value" labelKey="label" />
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
