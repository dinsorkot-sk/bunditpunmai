<script setup lang="ts">
import { useCourses } from '~/composables/v1/useCourses'

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
    to: `/courses/${item.id}`,
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    offset.value += PAGE_SIZE
    await fetchCourses({ limit: PAGE_SIZE, offset: offset.value })

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
  await fetchCourses({ limit: PAGE_SIZE, offset: 0 })
  coursePosts.value = courses.value.map(mapCourse)
  if (courses.value.length < PAGE_SIZE) {
    hasMore.value = false
  }
})
</script>
<template>
  <UPage>
    <UPageSection title="เกี่ยวกับโครงการของเรา"
      description="สร้างกำลังแรงงานแห่งอนาคตของประเทศไทยผ่านการศึกษาเชิงนวัตกรรมและความร่วมมือทางอุตสาหกรรม"
      orientation="horizontal" />

    <UPageSection>
      <UPageHeader title="หลักสูตรแนะนำ" class="border-none" />
      <UBlogPosts :posts="coursePosts" />

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
