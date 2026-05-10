<script setup lang="ts">
import { useBlogs } from '~/composables/v1/useBlogs'

const { t, locale } = useI18n()
const localePath = useLocalePath()

interface NewsCard {
  title: string
  description: string
  date: string | Date
  image: string
  to: string
}

const PAGE_SIZE = 6

const { blogs, fetchBlogs } = useBlogs()
const newsPosts = ref<NewsCard[]>([])
const offset = ref(0)
const hasMore = ref(true)
const loadingMore = ref(false)

function mapNews(item: { id: number; title: string; description: string; createdAt: string | Date }): NewsCard {
  return {
    title: item.title,
    description: item.description,
    date: item.createdAt,
    image: 'https://picsum.photos/800/600?random=news',
    to: localePath(`/news/${item.id}`),
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    offset.value += PAGE_SIZE
    await fetchBlogs({ limit: PAGE_SIZE, offset: offset.value, locale: locale.value !== 'th' ? locale.value : undefined })

    const newPosts = blogs.value.map(mapNews)
    if (newPosts.length < PAGE_SIZE) {
      hasMore.value = false
    }
    newsPosts.value.push(...newPosts)
  } finally {
    loadingMore.value = false
  }
}

onMounted(async () => {
  await fetchBlogs({ limit: PAGE_SIZE, offset: 0, locale: locale.value !== 'th' ? locale.value : undefined })
  newsPosts.value = blogs.value.map(mapNews)
  if (blogs.value.length < PAGE_SIZE) {
    hasMore.value = false
  }
})
</script>
<template>
  <UPage>
    <UPageSection :title="$t('news.title')"
      :description="$t('news.description')"
      orientation="horizontal" />

    <UPageSection>
      <UPageHeader :title="$t('news.latest')" class="border-none" />
      <UBlogPosts :posts="newsPosts" />

      <div v-if="hasMore || loadingMore" class="flex justify-center mt-6">
        <UButton
          :label="loadingMore ? $t('news.loading') : $t('news.view_more')"
          color="neutral"
          variant="outline"
          :loading="loadingMore"
          :disabled="loadingMore"
          trailing-icon="i-lucide-chevron-down"
          @click="loadMore"
        />
      </div>
    </UPageSection>

  </UPage>
</template>
