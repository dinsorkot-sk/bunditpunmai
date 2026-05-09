<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

// ── Header Navigation ──

const headerItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'หน้าแรก',
    to: '/',
    active: route.path === '/',
  },
  {
    label: 'หลักสูตร',
    to: '/courses',
    active: route.path.startsWith('/courses'),
  },
  {
    label: 'การรับสมัคร',
    to: '/admissions',
    active: route.path.startsWith('/admissions'),
  },
  {
    label: 'ข่าวสาร',
    to: '/news',
    active: route.path.startsWith('/news'),
  },
  {
    label: 'แหล่งเรียนรู้',
    to: '/e-learning',
    active: route.path.startsWith('/e-learning'),
  },
  {
    label: 'คำถามที่พบบ่อย',
    to: '/faq',
    active: route.path.startsWith('/faq'),
  },
  {
    label: 'ติดต่อเรา',
    to: '/contact',
    active: route.path.startsWith('/contact'),
  },
])

// ── Footer Navigation ──

const footerItems: NavigationMenuItem[] = [
  {
    label: 'หน้าแรก',
    to: '/',
  },
  {
    label: 'หลักสูตร',
    to: '/courses',
  },
  {
    label: 'การรับสมัคร',
    to: '/admissions',
  },
  {
    label: 'ข่าวสาร',
    to: '/news',
  },
  {
    label: 'แหล่งเรียนรู้',
    to: '/e-learning',
  },
  {
    label: 'คำถามที่พบบ่อย',
    to: '/faq',
  },
  {
    label: 'ติดต่อเรา',
    to: '/contact',
  },
]

// ── Social Media (Footer) ──

interface SocialLink {
  label: string
  icon: string
  url: string
}

const socialLinks: SocialLink[] = [
  { label: 'Facebook', icon: 'i-simple-icons-facebook', url: 'https://www.facebook.com/bunditpunmai.mju' },
  { label: 'Line', icon: 'i-simple-icons-line', url: 'https://line.me/R/ti/p/@bunditpunmai' },
  { label: 'YouTube', icon: 'i-simple-icons-youtube', url: 'https://www.youtube.com/@bunditpunmai-mju' },
  { label: 'TikTok', icon: 'i-simple-icons-tiktok', url: 'https://www.tiktok.com/@bunditpunmai.mju' },
]
</script>

<template>
  <UHeader title="BunditPunMai" to="/">
    <UNavigationMenu :items="headerItems" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Facebook" :kbds="['meta', '1']">
        <UButton
          color="neutral" variant="ghost"
          to="https://www.facebook.com/bunditpunmai.mju"
          target="_blank"
          icon="i-simple-icons-facebook"
          aria-label="Facebook"
        />
      </UTooltip>

      <UTooltip text="Line" :kbds="['meta', '2']">
        <UButton
          color="neutral" variant="ghost"
          to="https://line.me/R/ti/p/@bunditpunmai"
          target="_blank"
          icon="i-simple-icons-line"
          aria-label="Line"
        />
      </UTooltip>
    </template>
  </UHeader>

  <UMain>
    <slot />
  </UMain>

  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        &copy; {{ new Date().getFullYear() }} โครงการ BunditPunMai
        <span class="hidden sm:inline">&mdash; มหาวิทยาลัยแม่โจ้</span>
      </p>
    </template>

    <UNavigationMenu :items="footerItems" variant="link" />

    <template #right>
      <UButton
        v-for="social in socialLinks"
        :key="social.label"
        :icon="social.icon"
        color="neutral"
        variant="ghost"
        :to="social.url"
        target="_blank"
        :aria-label="social.label"
      />
    </template>
  </UFooter>
</template>
