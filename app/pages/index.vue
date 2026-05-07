<script setup lang="ts">
import type { ButtonProps, BlogPostProps } from '@nuxt/ui'
import { useCourses } from '~/composables/v1/useCourses'
import { useBlogs } from '~/composables/v1/useBlogs'

const links = ref<ButtonProps[]>([
  {
    label: 'เข้าร่วมโครงการ',
    to: '/docs/getting-started',
    trailingIcon: 'i-lucide-arrow-right',
    color: 'neutral'
  },
  {
    label: 'ดูรายละเอียด',
    to: '/docs/components/app',
    color: 'neutral',
    variant: 'subtle',
  }
])

const features = ref([
  {
    title: 'หลักสูตรที่ขับเคลื่อนโดยอุตสาหกรรม',
    description: 'หลักสูตรที่ออกแบบร่วมกับผู้นำในอุตสาหกรรมเพื่อตอบสนองความต้องการของโลกแห่งความเป็นจริงและเตรียมนักศึกษาให้พร้อมสำหรับการจ้างงานทันที',
    icon: 'i-lucide-smile',
  },
  {
    title: 'อบรมโดยผู้เชี่ยวชาญ',
    description: 'เรียนรู้จากผู้เชี่ยวชาญและนักวิชาการชั้นนำที่มีประสบการณ์มากมายในภาคเทคโนโลยีที่กำลังเติบโตของประเทศไทย',
    icon: 'i-lucide-a-large-small',
  },
  {
    title: 'ได้รับ ประกาศนียบัตร',
    description: 'ได้รับประสบการณ์จริงกับเทคโนโลยีล่าสุดที่ขับเคลื่อนการเปลี่ยนแปลงทางเศรษฐกิจของประเทศไทย',
    icon: 'i-lucide-sun-moon',
  },
  {
    title: 'เทคโนโลยีล้ำสมัย',
    description: 'มุ่งเน้นการเรียนรู้ผ่านโครงการที่จำลองสถานการณ์จริงในที่ทำงาน เพื่อพัฒนาทักษะและสร้างพอร์ตโฟลิโอให้โดดเด่น',
    icon: 'i-lucide-sun-moon',
  },
  {
    title: 'การเรียนรู้เชิงปฏิบัติ',
    description: 'พัฒนาทักษะการคิดวิเคราะห์และการแก้ปัญหาซึ่งจำเป็นต่อการขับเคลื่อนการสร้างสรรค์นวัตกรรมในทุก ๆ ทักษะที่จำเป็นต่อ การขับเคลื่อนการสร้างสรรค์นวัตกรรมในทุก ๆ',
    icon: 'i-lucide-sun-moon',
  },
  {
    title: 'แนวคิดเชิงนวัตกรรม',
    description: 'พัฒนาทักษะการคิดวิเคราะห์และการแก้ปัญหาซึ่งจำเป็นต่อการขับเคลื่อนการสร้างสรรค์นวัตกรรมในทุก ๆ ทักษะที่จำเป็นต่อ การขับเคลื่อนการสร้างสรรค์นวัตกรรมในทุก ๆ',
    icon: 'i-lucide-sun-moon',
  }
])

const linkCourses = ref<ButtonProps[]>([
  {
    label: 'ทั้งหมด',
    trailingIcon: 'i-lucide-chevron-right',
    to: '/courses',
    target: '_blank'
  }
])

const linkNews = ref<ButtonProps[]>([
  {
    label: 'ทั้งหมด',
    trailingIcon: 'i-lucide-chevron-right',
    target: '_blank'
  }
])

// ── Data from API ──

const { courses, fetchCourses } = useCourses()
const { blogs, fetchBlogs } = useBlogs()

const coursePosts = ref<BlogPostProps[]>([])
const blogPosts = ref<BlogPostProps[]>([])

onMounted(async () => {
  // Fetch courses (limit 3, only published)
  await fetchCourses({ limit: 3 })
  coursePosts.value = courses.value
    .filter(c => c.status === 'published')
    .map(c => ({
      title: c.title,
      description: c.description,
      date: c.createdAt,
      image: 'https://picsum.photos/800/600?random=course',
    }))

  // Fallback: if no published courses, show without filtering
  if (coursePosts.value.length === 0) {
    coursePosts.value = courses.value.slice(0, 3).map(c => ({
      title: c.title,
      description: c.description,
      date: c.createdAt,
      image: 'https://picsum.photos/800/600?random=course',
    }))
  }

  // Fetch blogs (limit 3, only published)
  await fetchBlogs({ limit: 3 })
  blogPosts.value = blogs.value
    .filter(b => b.status === 'published')
    .map(b => ({
      title: b.title,
      description: b.description,
      date: b.createdAt,
      image: 'https://picsum.photos/800/600?random=blog',
    }))

  // Fallback: if no published blogs, show without filtering
  if (blogPosts.value.length === 0) {
    blogPosts.value = blogs.value.slice(0, 3).map(b => ({
      title: b.title,
      description: b.description,
      date: b.createdAt,
      image: 'https://picsum.photos/800/600?random=blog',
    }))
  }
})
</script>

<template>
  <UPage>
    <UPageSection title="โครงการผลิตบัณฑิตพันธุ์ใหม่ 2567"
      description="สร้างคนที่มีสมรรถนะสูงสำหรับอุตสาหกรรม New Growth Engine ตามนโยบาย Thailand 4.0 และปฏิรูปการอุดมศึกษาไทย"
      orientation="horizontal" :links="links" />

    <UPageSection title="เป้าหมายของเรา"
      description="เพื่อสร้างบุคลากรที่มีประสิทธิภาพสูงในอุตสาหกรรม New Growth Engine ตามนโยบายไทยแลนด์ 4.0 และปฏิรูปการศึกษาระดับอุดมศึกษาของไทย โดยพัฒนาบัณฑิตให้มีทักษะที่ล้ำสมัย พร้อมที่จะขับเคลื่อนการสร้างสรรค์นวัตกรรมและการเติบโตทางเศรษฐกิจ"
      :links="links" />

    <UPageSection title="สิ่งที่จะได้รับจากโครงการ" :features="features" />

    <UPageSection>
      <UPageHeader title="หลักสูตรแนะนำ" :links="linkCourses" class="border-none" />
      <UBlogPosts :posts="coursePosts" />
    </UPageSection>

    <UPageSection>
      <UPageHeader title="ข่าวและกิจกรรม" :links="linkNews" class="border-none" />
      <UBlogPosts :posts="blogPosts" />
    </UPageSection>
  </UPage>
</template>
