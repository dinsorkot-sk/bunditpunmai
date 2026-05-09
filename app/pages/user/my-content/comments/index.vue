<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ApiComment {
  id: number
  content: string
  status: string
  postId: number
  authorId: number
  createdAt: string
}

const { user } = useAuth()
const toast = useToast()

const comments = ref<ApiComment[]>([])
const loading = ref(false)
const total = ref(0)
const limit = ref(20)
const offset = ref(0)
const editingComment = ref<ApiComment | null>(null)
const showEditModal = ref(false)
const submitting = ref(false)
const editForm = ref({ content: '' })

const columns = computed<TableColumn<ApiComment>[]>(() => [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'content', header: 'Comment' },
  { accessorKey: 'postId', header: 'Post ID' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'actions', header: 'Actions' },
])

async function fetchMyComments() {
  if (!user.value) return
  loading.value = true
  try {
    const result = await $fetch<ApiComment[]>('/api/v1/comments', {
      query: { limit: limit.value, offset: offset.value, authorId: user.value.id }
    })
    comments.value = result
    total.value = result.length
  } catch (err) {
    toast.add({ title: 'Failed to load comments', color: 'error' })
  } finally {
    loading.value = false
  }
}

function openEditModal(comment: ApiComment) {
  editingComment.value = comment
  editForm.value = { content: comment.content }
  showEditModal.value = true
}

async function handleUpdate() {
  if (submitting.value || !editingComment.value) return
  submitting.value = true
  try {
    await $fetch(`/api/v1/comments/${editingComment.value.id}`, {
      method: 'PATCH',
      body: { content: editForm.value.content }
    })
    toast.add({ title: 'Comment updated', color: 'success' })
    showEditModal.value = false
    fetchMyComments()
  } catch (err) {
    toast.add({ title: 'Failed to update comment', color: 'error' })
  } finally {
    submitting.value = false
  }
}

async function handleDelete(comment: ApiComment) {
  if (confirm('Delete this comment?')) {
    try {
      await $fetch(`/api/v1/comments/${comment.id}`, { method: 'DELETE' })
      toast.add({ title: 'Comment deleted', color: 'success' })
      fetchMyComments()
    } catch (err) {
      toast.add({ title: 'Failed to delete comment', color: 'error' })
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function truncate(text: string, len: number) {
  return text.length > len ? text.substring(0, len) + '...' : text
}

watch(offset, () => fetchMyComments())
onMounted(() => fetchMyComments())
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="My Comments">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="comments" :columns="columns" :loading="loading" sticky>
        <template #content-cell="{ row }">
          <span class="text-sm">{{ truncate(row.original.content, 60) }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :label="row.original.status"
            :color="row.original.status === 'approved' ? 'success' : row.original.status === 'pending' ? 'warning' : row.original.status === 'spam' ? 'error' : 'neutral'"
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

      <UModal v-model:open="showEditModal" title="Edit Comment">
        <template #body>
          <UForm :state="editForm" class="space-y-4" @submit="handleUpdate">
            <UFormField label="Content" required>
              <UTextarea v-model="editForm.content" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="outline" @click="showEditModal = false" />
              <UButton type="submit" label="Update" color="primary" :loading="submitting" />
            </div>
          </UForm>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
