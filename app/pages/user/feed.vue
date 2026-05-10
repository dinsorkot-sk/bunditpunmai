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

interface CommentAuthor {
  id: number
  name: string
  avatar: string
}

interface Comment {
  id: number
  content: string
  status: string
  postId: number | null
  blogId: number | null
  authorId: number
  author?: CommentAuthor
  createdAt: string
}

const toast = useToast()
const { user: currentUser } = useAuth()

const feed = ref<FeedItem[]>([])
const loading = ref(true)
const limit = ref(20)
const offset = ref(0)

// commentsByItem: key = `${type}-${id}`, value = array of comments
const commentsByItem = ref<Record<string, Comment[]>>({})
const loadingComments = ref(false)

// Track which items have the comment input expanded
const expandedComments = ref<Record<string, boolean>>({})
// Track comment input text per item
const commentInputs = ref<Record<string, string>>({})
// Track submitting state per item
const submittingComment = ref<Record<string, boolean>>({})

async function loadFeed() {
  loading.value = true
  try {
    const [posts, blogs] = await Promise.all([
      $fetch<FeedItem[]>('/api/v1/posts', { query: { limit: limit.value, offset: offset.value, status: 'published' } }),
      $fetch<FeedItem[]>('/api/v1/blogs', { query: { limit: limit.value, offset: offset.value, status: 'published' } }),
    ])

    const mappedPosts: FeedItem[] = posts.map(p => ({ ...p, type: 'post' }))
    const mappedBlogs: FeedItem[] = blogs.map(b => ({ ...b, type: 'blog' }))

    feed.value = [...mappedPosts, ...mappedBlogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // After loading items, fetch their comments
    await loadComments()
  } catch (err) {
    toast.add({ title: 'Failed to load feed', color: 'error' })
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  const postIds = feed.value.filter(i => i.type === 'post').map(i => i.id)
  const blogIds = feed.value.filter(i => i.type === 'blog').map(i => i.id)

  if (postIds.length === 0 && blogIds.length === 0) return

  loadingComments.value = true
  try {
    const params: Record<string, any> = { limit: 100, status: 'approved' }
    if (postIds.length > 0) params.postIds = postIds.join(',')
    if (blogIds.length > 0) params.blogIds = blogIds.join(',')

    const data = await $fetch<Comment[]>('/api/v1/comments', { query: params })

    // Organize comments by item key
    const map: Record<string, Comment[]> = {}
    for (const comment of data) {
      let key: string | null = null
      if (comment.postId) key = `post-${comment.postId}`
      else if (comment.blogId) key = `blog-${comment.blogId}`

      if (key) {
        if (!map[key]) map[key] = []
        map[key]!.push(comment)
      }
    }

    // Initialize empty arrays for items without comments
    for (const item of feed.value) {
      const key = `${item.type}-${item.id}`
      if (!map[key]) map[key] = []
    }

    commentsByItem.value = map
  } catch (err) {
    console.error('Failed to load comments', err)
  } finally {
    loadingComments.value = false
  }
}

async function addComment(item: FeedItem) {
  const key = `${item.type}-${item.id}`
  const content = commentInputs.value[key]?.trim()
  if (!content) return

  submittingComment.value[key] = true
  try {
    const body: Record<string, any> = { content }
    if (item.type === 'post') body.postId = item.id
    else body.blogId = item.id

    const newComment = await $fetch<Comment>('/api/v1/comments', {
      method: 'POST',
      body,
    })

    // Append to comments list immediately
    if (!commentsByItem.value[key]) commentsByItem.value[key] = []
    commentsByItem.value[key].push(newComment)
    commentInputs.value[key] = ''
    toast.add({ title: 'Comment added!', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || 'Failed to add comment',
      color: 'error',
    })
  } finally {
    submittingComment.value[key] = false
  }
}

function toggleComments(key: string) {
  expandedComments.value[key] = !expandedComments.value[key]
}

function formatDate(date: string | Date) {
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

async function handleLike(item: FeedItem) {
  try {
    const endpoint = item.type === 'post'
      ? `/api/v1/posts/${item.id}/like`
      : `/api/v1/blogs/${item.id}/like`
    const result = await $fetch<{ likes: number }>(endpoint, { method: 'POST' })
    item.likes = result.likes
  } catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || 'Failed to like',
      color: 'error',
    })
  }
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
              <div class="flex items-center gap-3 mt-3 text-xs">
                <button class="flex items-center gap-1 text-muted hover:text-red-500 transition-colors" @click="handleLike(item)">
                  <UIcon name="i-lucide-heart" class="size-3.5" />
                  {{ item.likes }}
                </button>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <UDivider class="my-3" />

          <div class="space-y-2">
            <!-- Comment Toggle -->
            <button
              class="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
              @click="toggleComments(`${item.type}-${item.id}`)"
            >
              <UIcon :name="expandedComments[`${item.type}-${item.id}`] ? 'i-lucide-chevron-down' : 'i-lucide-message-square'" class="size-3.5" />
              <span>
                {{ commentsByItem[`${item.type}-${item.id}`]?.length || 0 }}
                {{ (commentsByItem[`${item.type}-${item.id}`]?.length || 0) === 1 ? 'Comment' : 'Comments' }}
              </span>
            </button>

            <!-- Expanded Comments -->
            <div v-if="expandedComments[`${item.type}-${item.id}`]" class="space-y-2 pl-2 border-l-2 border-muted">
              <!-- Loading -->
              <div v-if="loadingComments" class="text-xs text-muted py-1">Loading comments...</div>

              <!-- No comments -->
              <p v-else-if="(commentsByItem[`${item.type}-${item.id}`]?.length || 0) === 0" class="text-xs text-muted py-1">
                No comments yet. Be the first to comment!
              </p>

              <!-- Comment List -->
              <div v-for="comment in commentsByItem[`${item.type}-${item.id}`]" :key="comment.id" class="py-1.5">
                <div class="flex items-start gap-2">
                  <UAvatar
                    :src="comment.author?.avatar || undefined"
                    :alt="comment.author?.name || 'User'"
                    size="xs"
                    class="mt-0.5"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-medium">{{ comment.author?.name || 'Unknown' }}</span>
                      <span class="text-[10px] text-muted">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <p class="text-xs text-muted mt-0.5">{{ comment.content }}</p>
                  </div>
                </div>
              </div>

              <!-- Comment Input -->
              <div class="flex gap-2 pt-1">
                <UInput
                  v-model="commentInputs[`${item.type}-${item.id}`]"
                  placeholder="Write a comment..."
                  size="sm"
                  class="flex-1"
                  :disabled="submittingComment[`${item.type}-${item.id}`]"
                  @keydown.enter.prevent="addComment(item)"
                />
                <UButton
                  icon="i-lucide-send"
                  size="sm"
                  color="primary"
                  :loading="submittingComment[`${item.type}-${item.id}`]"
                  :disabled="!commentInputs[`${item.type}-${item.id}`]?.trim()"
                  @click="addComment(item)"
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
