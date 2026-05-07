<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { usePostTags } from '~/composables/v1/usePostTags'
import { usePosts } from '~/composables/v1/usePosts'
import { useTags } from '~/composables/v1/useTags'

definePageMeta({ layout: 'admin' })

interface ApiPostTag {
  postId: number
  tagId: number
}

const { postTags, loading, total, fetchPostTags, createPostTag, deletePostTag } = usePostTags()
const { posts, fetchPosts } = usePosts()
const { tags, fetchTags } = useTags()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const submitting = ref(false)
const form = ref({
  postId: undefined as number | undefined,
  tagId: undefined as number | undefined,
})

const columns = computed<TableColumn<ApiPostTag>[]>(() => [
  { accessorKey: 'postId', header: 'Post' },
  { accessorKey: 'tagId', header: 'Tag' },
  { accessorKey: 'actions', header: 'Actions' },
])

const postOptions = computed(() => posts.value.map(p => ({ label: p.title, value: p.id })))
const tagOptions = computed(() => tags.value.map(t => ({ label: t.name, value: t.id })))

function resetForm() {
  form.value = { postId: undefined, tagId: undefined }
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.postId == null || form.value.tagId == null) return
  submitting.value = true
  try {
    await createPostTag(form.value as { postId: number; tagId: number })
    toast.add({ title: 'Tag assigned to post', color: 'success' })
    showCreateModal.value = false
    resetForm()
    fetchPostTags({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to create post tag:', error)
    toast.add({ title: 'Failed to assign tag', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(pt: ApiPostTag) {
  if (confirm('Remove this post tag assignment?')) {
    try {
      await deletePostTag({ postId: pt.postId, tagId: pt.tagId })
      toast.add({ title: 'Tag removed', color: 'success' })
      fetchPostTags({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete post tag:', error)
      toast.add({ title: 'Failed to remove tag', color: 'error' })
    }
  }
}

function getPostTitle(postId: number) {
  const post = posts.value.find(p => p.id === postId)
  return post ? post.title : `Post #${postId}`
}

function getTagName(tagId: number) {
  const tag = tags.value.find(t => t.id === tagId)
  return tag ? tag.name : `Tag #${tagId}`
}

watch(offset, () => {
  fetchPostTags({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchPostTags({ limit: limit.value, offset: offset.value })
  fetchPosts({ limit: 100 })
  fetchTags({ limit: 100 })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Post Tags">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Assign" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="postTags" :columns="columns" :loading="loading" sticky>
        <template #postId-cell="{ row }">
          {{ getPostTitle(row.original.postId) }}
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

      <UModal v-model:open="showCreateModal" title="Assign Tag to Post">
        <template #body>
          <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="Post" required>
              <USelectMenu v-model="form.postId" :items="postOptions" placeholder="Select post" valueKey="value" labelKey="label" />
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
