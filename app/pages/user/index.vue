<script setup lang="ts">
const { user, loading: authLoading } = useAuth()
const toast = useToast()

const myPostsCount = ref(0)
const myBlogsCount = ref(0)
const myCommentsCount = ref(0)
const loading = ref(true)

async function loadStats() {
  if (!user.value) return
  loading.value = true
  try {
    const [posts, blogs, comments] = await Promise.all([
      $fetch('/api/v1/posts', { query: { authorId: user.value.id, limit: 1 } }),
      $fetch('/api/v1/blogs', { query: { authorId: user.value.id, limit: 1 } }),
      $fetch('/api/v1/comments', { query: { authorId: user.value.id, limit: 1 } }),
    ])
    myPostsCount.value = posts.length
    myBlogsCount.value = blogs.length
    myCommentsCount.value = comments.length
  } catch (err) {
    toast.add({ title: 'Failed to load stats', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => loadStats())
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted hidden sm:block">
              {{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
            </span>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6 p-6">
        <!-- Welcome Banner -->
        <UCard variant="subtle" class="bg-primary">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-4">
              <UAvatar :src="user?.avatar" :alt="user?.name || 'User'" size="xl" />
              <div>
                <p class="text-lg font-semibold text-white">Welcome, {{ user?.name || 'User' }} 👋</p>
                <p class="text-sm text-primary-200 mt-0.5">Manage your content and profile from here.</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UCard variant="outline" as="a" href="/user/my-content/posts" class="hover:bg-elevated transition-colors cursor-pointer">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-muted font-medium">My Posts</p>
                <p v-if="loading" class="text-3xl font-bold tabular-nums mt-1">
                  <USkeleton class="h-8 w-12" />
                </p>
                <p v-else class="text-3xl font-bold tabular-nums mt-1">{{ myPostsCount }}</p>
              </div>
              <UIcon name="i-lucide-newspaper" class="size-5 text-muted mt-1" />
            </div>
          </UCard>

          <UCard variant="outline" as="a" href="/user/my-content/blogs" class="hover:bg-elevated transition-colors cursor-pointer">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-muted font-medium">My Blogs</p>
                <p v-if="loading" class="text-3xl font-bold tabular-nums mt-1">
                  <USkeleton class="h-8 w-12" />
                </p>
                <p v-else class="text-3xl font-bold tabular-nums mt-1">{{ myBlogsCount }}</p>
              </div>
              <UIcon name="i-lucide-book-open" class="size-5 text-muted mt-1" />
            </div>
          </UCard>

          <UCard variant="outline" as="a" href="/user/my-content/comments" class="hover:bg-elevated transition-colors cursor-pointer">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-muted font-medium">My Comments</p>
                <p v-if="loading" class="text-3xl font-bold tabular-nums mt-1">
                  <USkeleton class="h-8 w-12" />
                </p>
                <p v-else class="text-3xl font-bold tabular-nums mt-1">{{ myCommentsCount }}</p>
              </div>
              <UIcon name="i-lucide-message-square" class="size-5 text-muted mt-1" />
            </div>
          </UCard>
        </div>

        <!-- Quick Actions -->
        <UCard variant="outline">
          <template #header>
            <span class="font-semibold text-sm">Quick Actions</span>
          </template>
          <div class="flex flex-wrap gap-3">
            <UButton label="Create Post" icon="i-lucide-plus" to="/user/my-content/posts" />
            <UButton label="Create Blog" icon="i-lucide-plus" to="/user/my-content/blogs" color="secondary" />
            <UButton label="Edit Profile" icon="i-lucide-user" to="/user/profile" variant="outline" color="neutral" />
            <UButton label="View Feed" icon="i-lucide-rss" to="/user/feed" variant="outline" color="neutral" />
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
