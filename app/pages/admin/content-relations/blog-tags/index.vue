<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useBlogTags } from '~/composables/v1/useBlogTags'
import { useBlogs } from '~/composables/v1/useBlogs'
import { useTags } from '~/composables/v1/useTags'

definePageMeta({ layout: 'admin' })

interface ApiBlogTag {
  blogId: number
  tagId: number
}

const { blogTags, loading, total, fetchBlogTags, createBlogTag, deleteBlogTag } = useBlogTags()
const { blogs, fetchBlogs } = useBlogs()
const { tags, fetchTags } = useTags()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const submitting = ref(false)
const form = ref({
  blogId: undefined as number | undefined,
  tagId: undefined as number | undefined,
})

const columns = computed<TableColumn<ApiBlogTag>[]>(() => [
  { accessorKey: 'blogId', header: 'Blog' },
  { accessorKey: 'tagId', header: 'Tag' },
  { accessorKey: 'actions', header: 'Actions' },
])

const blogOptions = computed(() => blogs.value.map(b => ({ label: b.title, value: b.id })))
const tagOptions = computed(() => tags.value.map(t => ({ label: t.name, value: t.id })))

function resetForm() {
  form.value = { blogId: undefined, tagId: undefined }
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return
  if (form.value.blogId == null || form.value.tagId == null) return
  submitting.value = true
  try {
    await createBlogTag(form.value as { blogId: number; tagId: number })
    toast.add({ title: 'Tag assigned to blog', color: 'success' })
    showCreateModal.value = false
    resetForm()
    fetchBlogTags({ limit: limit.value, offset: offset.value })
  }
  catch (error: unknown) {
    console.error('Failed to create blog tag:', error)
    toast.add({ title: 'Failed to assign tag', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function handleDelete(bt: ApiBlogTag) {
  if (confirm('Remove this blog tag assignment?')) {
    try {
      await deleteBlogTag({ blogId: bt.blogId, tagId: bt.tagId })
      toast.add({ title: 'Tag removed', color: 'success' })
      fetchBlogTags({ limit: limit.value, offset: offset.value })
    }
    catch (error: unknown) {
      console.error('Failed to delete blog tag:', error)
      toast.add({ title: 'Failed to remove tag', color: 'error' })
    }
  }
}

function getBlogTitle(blogId: number) {
  const blog = blogs.value.find(b => b.id === blogId)
  return blog ? blog.title : `Blog #${blogId}`
}

function getTagName(tagId: number) {
  const tag = tags.value.find(t => t.id === tagId)
  return tag ? tag.name : `Tag #${tagId}`
}

watch(offset, () => {
  fetchBlogTags({ limit: limit.value, offset: offset.value })
})

onMounted(() => {
  fetchBlogTags({ limit: limit.value, offset: offset.value })
  fetchBlogs({ limit: 100 })
  fetchTags({ limit: 100 })
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Blog Tags">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Assign" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable :data="blogTags" :columns="columns" :loading="loading" sticky>
        <template #blogId-cell="{ row }">
          {{ getBlogTitle(row.original.blogId) }}
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

      <UModal v-model:open="showCreateModal" title="Assign Tag to Blog">
        <template #body>
          <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
            <UFormField label="Blog" required>
              <USelectMenu v-model="form.blogId" :items="blogOptions" placeholder="Select blog" valueKey="value" labelKey="label" />
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
