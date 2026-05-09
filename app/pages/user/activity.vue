<script setup lang="ts">
const { user } = useAuth()
const toast = useToast()

interface ActivityItem {
  id: number
  type: 'post' | 'blog' | 'comment'
  title: string
  status: string
  createdAt: string
}

interface CommentWithPostId extends ActivityItem {
  postId: number
}

const activities = ref<ActivityItem[]>([])
const loading = ref(true)

function getIcon(type: string) {
  if (type === 'post') return 'i-lucide-newspaper'
  if (type === 'blog') return 'i-lucide-book-open'
  return 'i-lucide-message-square'
}

function getColor(type: string) {
  if (type === 'post') return 'primary'
  if (type === 'blog') return 'secondary'
  return 'info'
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function loadActivity() {
  if (!user.value) return
  loading.value = true
  try {
    interface CommentApi { id: number; content: string; status: string; postId: number; authorId: number; createdAt: string }

    const [posts, blogs, comments] = await Promise.all([
      $fetch<ActivityItem[]>('/api/v1/posts', { query: { authorId: user.value.id, limit: 20 } }),
      $fetch<ActivityItem[]>('/api/v1/blogs', { query: { authorId: user.value.id, limit: 20 } }),
      $fetch<CommentApi[]>('/api/v1/comments', { query: { authorId: user.value.id, limit: 20 } }),
    ])
    const mapped: ActivityItem[] = [
      ...posts.map(p => ({ ...p, type: 'post' as const })),
      ...blogs.map(b => ({ ...b, type: 'blog' as const })),
      ...comments.map(c => ({ id: c.id, type: 'comment' as const, title: `Comment on post #${c.postId}`, status: c.status, createdAt: c.createdAt })),
    ]
    activities.value = mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (err) {
    toast.add({ title: 'Failed to load activity', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => loadActivity())
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Activity Log">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UTooltip text="Refresh">
            <UButton icon="i-lucide-refresh-cw" variant="ghost" color="neutral" size="sm"
              :loading="loading" @click="loadActivity" />
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl mx-auto p-6">
        <div v-if="!loading && activities.length > 0" class="space-y-2">
          <UCard v-for="(item, index) in activities" :key="`${item.type}-${item.id}-${index}`" variant="outline" class="hover:bg-elevated transition-colors">
            <div class="flex items-start gap-3">
              <UBadge :color="getColor(item.type)" variant="solid" class="p-1.5 flex-shrink-0 mt-0.5">
                <UIcon :name="getIcon(item.type)" class="size-4 text-white" />
              </UBadge>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-medium">{{ item.title }}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <UBadge :label="item.type" color="neutral" variant="subtle" size="xs" class="capitalize" />
                      <UBadge :label="item.status" size="xs"
                        :color="item.status === 'published' || item.status === 'active' ? 'success' : item.status === 'draft' || item.status === 'inactive' ? 'warning' : 'neutral'"
                        variant="subtle" class="capitalize" />
                    </div>
                  </div>
                  <span class="text-xs text-muted whitespace-nowrap flex-shrink-0">{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div v-else-if="loading" class="space-y-4">
          <USkeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-lg" />
        </div>

        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-activity" class="size-12 text-muted mx-auto mb-3" />
          <p class="text-lg font-medium">No activity yet</p>
          <p class="text-sm text-muted mt-1">Your recent actions will appear here.</p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
