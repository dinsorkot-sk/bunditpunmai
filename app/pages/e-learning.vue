<script setup lang="ts">
import { useResources } from '~/composables/v1/useResources'

const { t, locale } = useI18n()

interface ResourceItem {
  id: number
  title: string
  description: string
  url: string
  createdAt: string
}

interface ResourceCard {
  title: string
  description: string
  date: string
  image: string
  onClick: () => void
}

const PAGE_SIZE = 6

const { resources, fetchResources, loading } = useResources()
const resourcePosts = ref<ResourceCard[]>([])
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

function mapResource(item: ResourceItem): ResourceCard {
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
    await fetchResources({ limit: PAGE_SIZE, offset: offset.value, locale: locale.value !== 'th' ? locale.value : undefined })

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
  await fetchResources({ limit: PAGE_SIZE, offset: 0, locale: locale.value !== 'th' ? locale.value : undefined })
  resourcePosts.value = resources.value.map(mapResource)
  if (resources.value.length < PAGE_SIZE) {
    hasMore.value = false
  }
})
</script>

<template>
  <UPage>
    <UPageSection
      :title="$t('e_learning.title')"
      :description="$t('e_learning.description')"
      orientation="horizontal"
    />

    <UPageSection>
      <UPageHeader :title="$t('e_learning.all_resources')" class="border-none" />
      <UBlogPosts orientation="vertical" :posts="resourcePosts" />

      <div v-if="hasMore || loadingMore" class="flex justify-center mt-6">
        <UButton
          :label="loadingMore ? $t('e_learning.loading') : $t('e_learning.view_more')"
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
