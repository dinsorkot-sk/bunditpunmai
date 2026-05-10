<script setup lang="ts">
import type { ButtonProps, BlogPostProps } from '@nuxt/ui'
import { useCourses } from '~/composables/v1/useCourses'
import { useBlogs } from '~/composables/v1/useBlogs'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const links = computed<ButtonProps[]>(() => [
  {
    label: t('home.hero_join'),
    to: localePath('/about'),
    trailingIcon: 'i-lucide-arrow-right',
    color: 'neutral'
  },
  {
    label: t('home.hero_details'),
    to: localePath('/admissions'),
    color: 'neutral',
    variant: 'subtle',
  }
])

const features = computed(() => [
  {
    title: t('home.feature_industry'),
    description: t('home.feature_industry_desc'),
    icon: 'i-lucide-building-2',
  },
  {
    title: t('home.feature_expert'),
    description: t('home.feature_expert_desc'),
    icon: 'i-lucide-user-check',
  },
  {
    title: t('home.feature_certificate'),
    description: t('home.feature_certificate_desc'),
    icon: 'i-lucide-award',
  },
  {
    title: t('home.feature_technology'),
    description: t('home.feature_technology_desc'),
    icon: 'i-lucide-cpu',
  },
  {
    title: t('home.feature_practice'),
    description: t('home.feature_practice_desc'),
    icon: 'i-lucide-wrench',
  },
  {
    title: t('home.feature_innovation'),
    description: t('home.feature_innovation_desc'),
    icon: 'i-lucide-lightbulb',
  }
])

const linkCourses = computed<ButtonProps[]>(() => [
  {
    label: t('common.view_all'),
    trailingIcon: 'i-lucide-chevron-right',
    to: localePath('/courses'),
  }
])

const linkNews = computed<ButtonProps[]>(() => [
  {
    label: t('common.view_all'),
    trailingIcon: 'i-lucide-chevron-right',
    to: localePath('/news'),
  }
])

// ── Data from API ──

const { courses, fetchCourses } = useCourses()
const { blogs, fetchBlogs } = useBlogs()

const coursePosts = ref<BlogPostProps[]>([])
const blogPosts = ref<BlogPostProps[]>([])

onMounted(async () => {
  const currentLocale = locale.value !== 'th' ? locale.value : undefined

  // Fetch courses (limit 3, only published) with locale
  await fetchCourses({ limit: 3, locale: currentLocale })
  coursePosts.value = courses.value
    .filter((c: any) => c.status === 'published')
    .map((c: any) => ({
      title: c.title,
      description: c.description,
      date: c.createdAt,
      image: 'https://picsum.photos/800/600?random=course',
      to: localePath(`/courses/${c.id}`),
    }))

  // Fallback: if no published courses, show without filtering
  if (coursePosts.value.length === 0) {
    coursePosts.value = courses.value.slice(0, 3).map((c: any) => ({
      title: c.title,
      description: c.description,
      date: c.createdAt,
      image: 'https://picsum.photos/800/600?random=course',
      to: localePath(`/courses/${c.id}`),
    }))
  }

  // Fetch blogs (limit 3, only published) with locale
  await fetchBlogs({ limit: 3, locale: currentLocale })
  blogPosts.value = blogs.value
    .filter((b: any) => b.status === 'published')
    .map((b: any) => ({
      title: b.title,
      description: b.description,
      date: b.createdAt,
      image: 'https://picsum.photos/800/600?random=blog',
      to: localePath(`/news/${b.id}`),
    }))

  // Fallback: if no published blogs, show without filtering
  if (blogPosts.value.length === 0) {
    blogPosts.value = blogs.value.slice(0, 3).map((b: any) => ({
      title: b.title,
      description: b.description,
      date: b.createdAt,
      image: 'https://picsum.photos/800/600?random=blog',
      to: localePath(`/news/${b.id}`),
    }))
  }
})
</script>

<template>
  <UPage>
    <UPageSection :title="$t('home.hero_title')" :description="$t('home.hero_description')"
      orientation="horizontal" :links="links">
      <img src="https://bunditpunmai-mju.com/img/IMG_2305.png" alt="Illustration" class="w-full rounded-lg"
        loading="lazy" />
    </UPageSection>

    <UPageSection :title="$t('home.goal_title')" :description="$t('home.goal_description')" />

    <UPageSection :title="$t('home.benefits_title')" :features="features" />

    <UPageSection>
      <UPageHeader :title="$t('home.featured_courses')" :links="linkCourses" class="border-none" />
      <UBlogPosts :posts="coursePosts" />
    </UPageSection>

    <UPageSection>
      <UPageHeader :title="$t('home.news_and_events')" :links="linkNews" class="border-none" />
      <UBlogPosts :posts="blogPosts" />
    </UPageSection>
  </UPage>
</template>
