<script setup lang="ts">
import { useCourses } from '~/composables/v1/useCourses'

const { t, locale } = useI18n()
const localePath = useLocalePath()

interface CourseCard {
  title: string
  description: string
  date: string | Date
  image: string
  to: string
}

const PAGE_SIZE = 6

const { courses, fetchCourses } = useCourses()
const coursePosts = ref<CourseCard[]>([])
const offset = ref(0)
const hasMore = ref(true)
const loadingMore = ref(false)

function mapCourse(item: { id: number; title: string; description: string; createdAt: string | Date }): CourseCard {
  return {
    title: item.title,
    description: item.description,
    date: item.createdAt,
    image: 'https://picsum.photos/800/600?random=course',
    to: localePath(`/courses/${item.id}`),
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    offset.value += PAGE_SIZE
    await fetchCourses({ limit: PAGE_SIZE, offset: offset.value, locale: locale.value !== 'th' ? locale.value : undefined })

    const newPosts = courses.value.map(mapCourse)
    if (newPosts.length < PAGE_SIZE) {
      hasMore.value = false
    }
    coursePosts.value.push(...newPosts)
  } finally {
    loadingMore.value = false
  }
}

onMounted(async () => {
  await fetchCourses({ limit: PAGE_SIZE, offset: 0, locale: locale.value !== 'th' ? locale.value : undefined })
  coursePosts.value = courses.value.map(mapCourse)
  if (courses.value.length < PAGE_SIZE) {
    hasMore.value = false
  }
})
</script>
<template>
  <UPage>
    <UPageSection :title="$t('courses.page_title')"
      :description="$t('courses.page_description')"
      orientation="horizontal" />

    <UPageSection>
      <UPageHeader :title="$t('courses.title')" class="border-none" />
      <UBlogPosts :posts="coursePosts" />

      <div v-if="hasMore || loadingMore" class="flex justify-center mt-6">
        <UButton
          :label="loadingMore ? $t('courses.loading') : $t('courses.view_more')"
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
