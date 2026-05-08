<script setup lang="ts">
import { useResources } from '~/composables/v1/useResources'
import type { BlogPostProps } from '@nuxt/ui'

/**
 * Resource item shape returned by the API (via useResources composable)
 */
interface ResourceItem {
  id: number
  title: string
  description: string
  url: string
  createdAt: string
}

const PAGE_SIZE = 6

const { resources, fetchResources, loading } = useResources()
const resourcePosts = ref<BlogPostProps[]>([])
const offset = ref(0)
const hasMore = ref(true)
const loadingMore = ref(false)

// ── Modal preview state ──
const selectedResource = ref<ResourceItem | null>(null)
const previewOpen = ref(false)

function openPreview(item: ResourceItem) {
  selectedResource.value = item
  previewOpen.value = true
}

/**
 * Map API resource response to BlogPostProps for UBlogPosts display.
 * The `onClick` handler opens the preview modal instead of navigating.
 */
function mapResource(item: ResourceItem): BlogPostProps {
  return {
    title: item.title,
    description: item.description,
    date: item.createdAt,
    image: 'https://picsum.photos/800/600?random=resource',
    onClick: () => openPreview(item),
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    offset.value += PAGE_SIZE
    await fetchResources({ limit: PAGE_SIZE, offset: offset.value })

    const newPosts = resources.value.map(mapResource)
    if (newPosts.length < PAGE_SIZE) {
      hasMore.value = false
    }
    resourcePosts.value.push(...newPosts)
  } finally {
    loadingMore.value = false
  }
}

onMounted(async () => {
  await fetchResources({ limit: PAGE_SIZE, offset: 0 })
  resourcePosts.value = resources.value.map(mapResource)
  if (resources.value.length < PAGE_SIZE) {
    hasMore.value = false
  }
})
</script>

<template>
  <UPage>
    <UPageSection
      title="แหล่งข้อมูลการเรียนรู้แบบออนไลน์"
      description="เข้าถึงวิดีโอการฝึกอบรม เอกสารประกอบ แบบฝึกหัด และสื่อการเรียนรู้เพื่อสนับสนุนการศึกษาของคุณ"
      orientation="horizontal"
    />

    <UPageSection>
      <UPageHeader title="แหล่งข้อมูลทั้งหมด" class="border-none" />
      <UBlogPosts orientation="vertical" :posts="resourcePosts" />

      <div v-if="hasMore || loadingMore" class="flex justify-center mt-6">
        <UButton
          :label="loadingMore ? 'กำลังโหลด...' : 'ดูเพิ่มเติม'"
          color="neutral"
          variant="outline"
          :loading="loadingMore"
          :disabled="loadingMore"
          trailing-icon="i-lucide-chevron-down"
          @click="loadMore"
        />
      </div>
    </UPageSection>

    <!-- ── Resource Preview Modal ── -->
    <ResourcePreviewModal
      v-if="selectedResource"
      v-model:open="previewOpen"
      :title="selectedResource.title"
      :description="selectedResource.description"
      :url="selectedResource.url"
    />
  </UPage>
</template>
