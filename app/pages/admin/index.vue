<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { RecentItem } from '#shared/types/dashboard'
import { useDashboard } from '~/composables/v1/useDashboard'

definePageMeta({ layout: 'admin' })

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const { stats, recent, loading, error, fetchDashboard } = useDashboard()
const toast = useToast()

const recentLimit = ref(5)

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    {
      label: 'Users',
      value: stats.value.users,
      icon: 'i-lucide-users',
      to: '/admin/user-management/users',
    },
    {
      label: 'Posts',
      value: stats.value.posts.total,
      icon: 'i-lucide-file-text',
      to: '/admin/content/posts',
      breakdown: [
        { label: 'Published', value: stats.value.posts.published, color: 'success' as BadgeColor },
        { label: 'Draft', value: stats.value.posts.draft, color: 'warning' as BadgeColor },
        { label: 'Archived', value: stats.value.posts.archived, color: 'neutral' as BadgeColor },
      ],
    },
    {
      label: 'Blogs',
      value: stats.value.blogs.total,
      icon: 'i-lucide-book-open',
      to: '/admin/content/blogs',
      breakdown: [
        { label: 'Published', value: stats.value.blogs.published, color: 'success' as BadgeColor },
        { label: 'Draft', value: stats.value.blogs.draft, color: 'warning' as BadgeColor },
        { label: 'Archived', value: stats.value.blogs.archived, color: 'neutral' as BadgeColor },
      ],
    },
    {
      label: 'Courses',
      value: stats.value.courses.total,
      icon: 'i-lucide-graduation-cap',
      to: '/admin/content/courses',
      breakdown: [
        { label: 'Published', value: stats.value.courses.published, color: 'success' as BadgeColor },
        { label: 'Draft', value: stats.value.courses.draft, color: 'warning' as BadgeColor },
        { label: 'Archived', value: stats.value.courses.archived, color: 'neutral' as BadgeColor },
      ],
    },
    {
      label: 'Comments',
      value: stats.value.comments.total,
      icon: 'i-lucide-message-circle',
      to: '/admin/content/comments',
      breakdown: [
        { label: 'Approved', value: stats.value.comments.approved, color: 'success' as BadgeColor },
        { label: 'Pending', value: stats.value.comments.pending, color: 'warning' as BadgeColor },
        { label: 'Rejected', value: stats.value.comments.rejected, color: 'error' as BadgeColor },
      ],
    },
    {
      label: 'Media',
      value: stats.value.media.total,
      icon: 'i-lucide-image',
      to: '/admin/media',
      breakdown: [
        { label: 'Images', value: stats.value.media.images, color: 'info' as BadgeColor },
        { label: 'Videos', value: stats.value.media.videos, color: 'secondary' as BadgeColor },
        { label: 'Resources', value: stats.value.media.resources, color: 'warning' as BadgeColor },
      ],
    },
  ]
})

const baseColumns = computed<TableColumn<RecentItem>[]>(() => [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'author', header: 'Author' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Created' },
])

const recentSections = computed(() => {
  if (!recent.value) return []
  return [
    {
      key: 'posts',
      label: 'Recent Posts',
      icon: 'i-lucide-file-text',
      data: recent.value.posts,
      columns: baseColumns.value,
      to: '/admin/content/posts',
    },
    {
      key: 'blogs',
      label: 'Recent Blogs',
      icon: 'i-lucide-book-open',
      data: recent.value.blogs,
      columns: baseColumns.value,
      to: '/admin/content/blogs',
    },
    {
      key: 'courses',
      label: 'Recent Courses',
      icon: 'i-lucide-graduation-cap',
      data: recent.value.courses,
      columns: [
        { accessorKey: 'id', header: 'ID', size: 60 },
        { accessorKey: 'title', header: 'Title' },
        { accessorKey: 'author', header: 'Instructor' },
        { accessorKey: 'status', header: 'Status' },
        { accessorKey: 'createdAt', header: 'Created' },
      ] as TableColumn<RecentItem>[],
      to: '/admin/content/courses',
    },
    {
      key: 'comments',
      label: 'Recent Comments',
      icon: 'i-lucide-message-circle',
      data: recent.value.comments,
      columns: [
        { accessorKey: 'id', header: 'ID', size: 60 },
        { accessorKey: 'contentPreview', header: 'Content' },
        { accessorKey: 'author', header: 'Author' },
        { accessorKey: 'status', header: 'Status' },
        { accessorKey: 'createdAt', header: 'Created' },
      ] as TableColumn<RecentItem>[],
      to: '/admin/content/comments',
    },
  ].filter(s => s.data?.length)
})

async function loadDashboard() {
  try {
    await fetchDashboard(recentLimit.value)
  }
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Please try again'
    toast.add({
      title: 'Failed to load dashboard',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusColor(status: string): BadgeColor {
  const colorMap: Record<string, BadgeColor> = {
    published: 'success',
    draft: 'warning',
    archived: 'neutral',
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
    active: 'success',
    inactive: 'neutral',
    spam: 'error',
  }
  return colorMap[status] ?? 'neutral'
}

onMounted(() => loadDashboard())
</script>

<template>
  <UDashboardPanel resizable>
    <!-- ── Header ── -->
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
            <UTooltip text="Refresh">
              <UButton
                icon="i-lucide-refresh-cw"
                variant="ghost"
                color="neutral"
                size="sm"
                :loading="loading"
                @click="loadDashboard"
              />
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <!-- ── Body ── -->
    <template #body>

      <!-- Loading Skeleton -->
      <div v-if="loading && !stats" class="space-y-6 p-6">
        <USkeleton class="h-24 w-full rounded-xl" />
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <USkeleton v-for="i in 6" :key="i" class="h-28 rounded-xl" />
        </div>
        <USkeleton class="h-64 w-full rounded-xl" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex items-center justify-center min-h-[500px] p-6">
        <UAlert
          icon="i-lucide-alert-circle"
          title="Error loading dashboard"
          :description="error"
          color="error"
          variant="subtle"
          class="max-w-md w-full"
          :actions="[{
            label: 'Retry',
            icon: 'i-lucide-refresh-cw',
            color: 'error',
            variant: 'outline',
            onClick: loadDashboard,
          }]"
        />
      </div>

      <!-- Content -->
      <div v-else-if="stats" class="space-y-6 p-6">

        <!-- ── Welcome Banner ── -->
        <UCard variant="subtle" class="bg-primary">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p class="text-lg font-semibold text-white">Welcome back 👋</p>
              <p class="text-sm text-primary-200 mt-0.5">Here's what's happening with your platform today.</p>
            </div>
            <UButton
              label="View Reports"
              icon="i-lucide-bar-chart-2"
              color="neutral"
              variant="outline"
              size="sm"
              to="/admin"
            />
          </div>
        </UCard>

        <!-- ── Stat Cards ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <UCard
            v-for="card in statCards"
            :key="card.label"
            as="a"
            :href="card.to"
            variant="outline"
            class="hover:bg-elevated transition-colors cursor-pointer"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-muted font-medium">{{ card.label }}</p>
                <p class="text-3xl font-bold tabular-nums mt-1">{{ card.value.toLocaleString() }}</p>
              </div>
              <UIcon :name="card.icon" class="size-5 text-muted mt-1" />
            </div>
            <div v-if="card.breakdown?.length" class="flex flex-wrap gap-1.5">
              <UBadge
                v-for="item in card.breakdown"
                :key="item.label"
                :color="item.color"
                variant="subtle"
              >
                {{ item.label }}: {{ item.value }}
              </UBadge>
            </div>
          </UCard>
        </div>

        <!-- ── Recent Activity ── -->
        <div v-if="recent" class="space-y-4">
          <div class="flex items-center gap-3">
            <p class="text-base font-semibold">Recent Activity</p>
            <USeparator class="flex-1" />
          </div>

          <UCard
            v-for="section in recentSections"
            :key="section.key"
            variant="outline"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon :name="section.icon" class="size-4 text-muted" />
                  <span class="font-semibold text-sm">{{ section.label }}</span>
                  <UBadge :label="String(section.data.length)" color="neutral" variant="subtle" size="xs" />
                </div>
                <UButton
                  label="View all"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  trailing-icon="i-lucide-arrow-right"
                  :to="section.to"
                />
              </div>
            </template>

            <UTable :data="section.data" :columns="section.columns" :loading="loading">
              <template #id-cell="{ row }">
                <span class="text-sm text-muted font-mono">#{{ (row.original as RecentItem).id }}</span>
              </template>
              <template #status-cell="{ row }">
                <UBadge
                  :label="(row.original as RecentItem).status"
                  :color="getStatusColor((row.original as RecentItem).status)"
                  variant="subtle"
                  class="capitalize"
                />
              </template>
              <template #createdAt-cell="{ row }">
                <span class="text-sm text-muted">{{ formatDate((row.original as RecentItem).createdAt) }}</span>
              </template>
            </UTable>
          </UCard>
        </div>

      </div>
    </template>
  </UDashboardPanel>
</template>
