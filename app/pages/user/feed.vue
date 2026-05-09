<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface FeedItem {
  id: number
  type: 'post' | 'blog'
  title: string
  content: string
  status: string
  likes: number
  createdAt: string
}

const toast = useToast()
const { user } = useAuth()

const feed = ref<FeedItem[]>([])
const loading = ref(true)
const limit = ref(20)
const offset = ref(0)

async function loadFeed() {
  loading.value = true
  try {
    const [posts, blogs] = await Promise.all([
      $fetch<FeedItem[]>('/api/v1/posts', { query: { limit: limit.value, offset: offset.value } }),
      $fetch<FeedItem[]>('/api/v1/blogs', { query: { limit: limit.value, offset: offset.value } }),
    ])

    const mappedPosts: FeedItem[] = posts.map(p => ({ ...p, type: 'post' }))
    const mappedBlogs: FeedItem[] = blogs.map(b => ({ ...b, type: 'blog' }))

    feed.value = [...mappedPosts, ...mappedBlogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (err) {
    toast.add({ title: 'Failed to load feed', color: 'error' })
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getTypeIcon(type: string) {
  return type === 'blog' ? 'i-lucide-book-open' : 'i-lucide-newspaper'
}

function getTypeLabel(type: string) {
  return type === 'blog' ? 'Blog' : 'Post'
}

onMounted(() => loadFeed())
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Feed">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UTooltip text="Refresh">
            <UButton icon="i-lucide-refresh-cw" variant="ghost" color="neutral" size="sm"
              :loading="loading" @click="loadFeed" />
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4 p-6">
        <!-- Loading -->
        <div v-if="loading && feed.length === 0" class="space-y-4">
          <USkeleton v-for="i in 5" :key="i" class="h-32 w-full rounded-xl" />
        </div>

        <!-- Empty -->
        <div v-else-if="feed.length === 0" class="flex items-center justify-center min-h-[300px]">
          <div class="text-center">
            <UIcon name="i-lucide-rss" class="size-12 text-muted mx-auto mb-3" />
            <p class="text-lg font-medium">No content yet</p>
            <p class="text-sm text-muted mt-1">Posts and blogs will appear here.</p>
          </div>
        </div>

        <!-- Feed Items -->
        <UCard v-for="item in feed" :key="`${item.type}-${item.id}`" variant="outline">
          <div class="flex gap-4">
            <div class="flex-shrink-0 mt-1">
              <UIcon :name="getTypeIcon(item.type)" class="size-6 text-muted" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <UBadge :label="getTypeLabel(item.type)" color="neutral" variant="subtle" size="xs" />
                <span class="text-xs text-muted">{{ formatDate(item.createdAt) }}</span>
              </div>
              <h3 class="font-semibold text-sm truncate">{{ item.title }}</h3>
              <p class="text-sm text-muted mt-1 line-clamp-2">{{ item.content }}</p>
              <div class="flex items-center gap-3 mt-3 text-xs text-muted">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-heart" class="size-3.5" />
                  {{ item.likes }}
                </span>
                <UBadge
                  :label="item.status"
                  :color="item.status === 'published' ? 'success' : item.status === 'draft' ? 'warning' : 'neutral'"
                  variant="subtle"
                  size="xs"
                  class="capitalize"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Load More -->
        <div v-if="feed.length > 0" class="flex justify-center pt-2">
          <UButton label="Load More" variant="outline" color="neutral" :loading="loading" @click="offset += limit; loadFeed()" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
