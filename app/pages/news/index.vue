<script setup lang="ts">
import { useBlogs } from '~/composables/v1/useBlogs'

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
    to: `/news/${item.id}`,
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    offset.value += PAGE_SIZE
    await fetchBlogs({ limit: PAGE_SIZE, offset: offset.value })

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
  await fetchBlogs({ limit: PAGE_SIZE, offset: 0 })
  newsPosts.value = blogs.value.map(mapNews)
  if (blogs.value.length < PAGE_SIZE) {
    hasMore.value = false
  }
})
</script>
<template>
  <UPage>
    <UPageSection title="ข่าวสารและกิจกรรม"
      description="ติดตามข่าวสารล่าสุด ความเคลื่อนไหว และกิจกรรมต่าง ๆ ของโครงการ"
      orientation="horizontal" />

    <UPageSection>
      <UPageHeader title="ข่าวสารล่าสุด" class="border-none" />
      <UBlogPosts :posts="newsPosts" />

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

  </UPage>
</template>
