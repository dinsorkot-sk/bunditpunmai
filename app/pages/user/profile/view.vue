<script setup lang="ts">
const { user } = useAuth()
const toast = useToast()

interface PublicItem {
  id: number
  title: string
  type: 'post' | 'blog'
  status: string
  likes: number
  createdAt: string
}

const items = ref<PublicItem[]>([])
const loading = ref(true)

async function loadPublicContent() {
  if (!user.value) return
  loading.value = true
  try {
    const [posts, blogs] = await Promise.all([
      $fetch<PublicItem[]>('/api/v1/posts', { query: { authorId: user.value.id, limit: 10 } }),
      $fetch<PublicItem[]>('/api/v1/blogs', { query: { authorId: user.value.id, limit: 10 } }),
    ])
    const mappedPosts = posts.map(p => ({ ...p, type: 'post' as const }))
    const mappedBlogs = blogs.map(b => ({ ...b, type: 'blog' as const }))
    items.value = [...mappedPosts, ...mappedBlogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (err) {
    toast.add({ title: 'Failed to load content', color: 'error' })
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => loadPublicContent())
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="View Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-2xl mx-auto p-6 space-y-6">
        <!-- Profile Card -->
        <UCard variant="outline" class="text-center">
          <UAvatar :src="user?.avatar" :alt="user?.name || 'User'" size="3xl" class="mx-auto mb-4" />
          <h2 class="text-xl font-bold">{{ user?.name }}</h2>
          <p class="text-sm text-muted">{{ user?.email }}</p>
          <p class="text-xs text-muted mt-2">Member since {{ user?.createdAt ? formatDate(String(user.createdAt)) : 'N/A' }}</p>
        </UCard>

        <!-- Public Content -->
        <UCard variant="outline">
          <template #header>
            <span class="font-semibold text-sm">Published Content</span>
          </template>

          <div v-if="loading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-lg" />
          </div>

          <div v-else-if="items.length === 0" class="text-center py-6">
            <UIcon name="i-lucide-file-text" class="size-8 text-muted mx-auto mb-2" />
            <p class="text-sm text-muted">No published content yet.</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="item in items.filter(i => i.status === 'published')" :key="`${item.type}-${item.id}`"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-elevated transition-colors">
              <UIcon :name="item.type === 'blog' ? 'i-lucide-book-open' : 'i-lucide-newspaper'"
                class="size-5 text-muted flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ item.title }}</p>
                <p class="text-xs text-muted">{{ item.type === 'blog' ? 'Blog' : 'Post' }} · {{ formatDate(item.createdAt) }}</p>
              </div>
              <div class="flex items-center gap-2 text-xs text-muted">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-heart" class="size-3.5" />
                  {{ item.likes }}
                </span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
