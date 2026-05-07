<script setup lang="ts">
import type { ButtonProps, PageFeatureProps, BlogPostProps } from '@nuxt/ui'

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

const features = ref<PageFeatureProps[]>([
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

const posts = ref<BlogPostProps[]>([
    {
        title: 'Nuxt Icon v1',
        description: 'Discover Nuxt Icon v1!',
        image: 'https://nuxt.com/assets/blog/nuxt-icon/cover.png',
        date: '2024-11-25'
    },
    {
        title: 'Nuxt 3.14',
        description: 'Nuxt 3.14 is out!',
        image: 'https://nuxt.com/assets/blog/v3.14.png',
        date: '2024-11-04'
    },
    {
        title: 'Nuxt 3.13',
        description: 'Nuxt 3.13 is out!',
        image: 'https://nuxt.com/assets/blog/v3.13.png',
        date: '2024-08-22'
    }
])

const linkCourses = ref<ButtonProps[]>([
    {
        label: 'ทั้งหมด',
        trailingIcon: 'i-lucide-chevron-right',
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
            <UBlogPosts :posts="posts" />
        </UPageSection>

        <UPageSection>
            <UPageHeader title="ข่าวและกิจกรรม" :links="linkNews" class="border-none" />
            <UBlogPosts :posts="posts" />
        </UPageSection>
    </UPage>
</template>
