<script setup lang="ts">
const route = useRoute()
const id = Number(route.params.id)

const { data: course, pending, error } = await useAsyncData(
  `course-${id}`,
  () => $fetch(`/api/v1/courses/${id}`)
)

if (!course.value || error.value) {
  throw createError({ statusCode: 404, statusMessage: 'ไม่พบหลักสูตร' })
}

const formattedDate = computed(() => {
  if (!course.value?.createdAt) return ''
  try {
    return new Date(course.value.createdAt).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return course.value.createdAt
  }
})
</script>

<template>
  <UPage>
    <UPageBody>
      <UContainer class="max-w-3xl mx-auto">
        <div v-if="pending" class="flex justify-center py-20">
          <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
        </div>

        <template v-else-if="course">
          <ULink to="/courses" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-default mb-6">
            <UIcon name="i-lucide-arrow-left" class="size-4" />
            กลับไปหน้าหลักสูตร
          </ULink>

          <article>
            <header class="mb-8">
              <h1 class="text-3xl sm:text-4xl font-bold text-highlighted">
                {{ course.title }}
              </h1>
              <div class="flex items-center gap-2 mt-4 text-sm text-toned">
                <UIcon name="i-lucide-calendar" class="size-4" />
                <time :datetime="course.createdAt">{{ formattedDate }}</time>
              </div>
            </header>

            <div class="prose prose-gray dark:prose-invert max-w-none">
              <p class="text-lg text-toned leading-relaxed mb-6">
                {{ course.description }}
              </p>
              <div class="text-default leading-relaxed whitespace-pre-line">
                {{ course.content }}
              </div>
            </div>
          </article>
        </template>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
