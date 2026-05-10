<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const localeSwitchItems = computed(() => [
  {
    label: '🇹🇭 ภาษาไทย',
    to: switchLocalePath('th'),
    disabled: locale.value === 'th',
  },
  {
    label: '🇬🇧 English',
    to: switchLocalePath('en'),
    disabled: locale.value === 'en',
  },
])

// ── Header Navigation (localized) ──

const headerItems = computed<NavigationMenuItem[]>(() => [
  {
    label: t('nav.home'),
    to: localePath('/'),
    active: route.path === localePath('/'),
  },
  {
    label: t('nav.courses'),
    to: localePath('/courses'),
    active: route.path.startsWith(localePath('/courses')),
  },
  {
    label: t('nav.admissions'),
    to: localePath('/admissions'),
    active: route.path.startsWith(localePath('/admissions')),
  },
  {
    label: t('nav.news'),
    to: localePath('/news'),
    active: route.path.startsWith(localePath('/news')),
  },
  {
    label: t('nav.e_learning'),
    to: localePath('/e-learning'),
    active: route.path.startsWith(localePath('/e-learning')),
  },
  {
    label: t('nav.faq'),
    to: localePath('/faq'),
    active: route.path.startsWith(localePath('/faq')),
  },
  {
    label: t('nav.contact'),
    to: localePath('/contact'),
    active: route.path.startsWith(localePath('/contact')),
  },
])

// ── Footer Navigation (localized) ──

const footerItems = computed<NavigationMenuItem[]>(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.courses'), to: localePath('/courses') },
  { label: t('nav.admissions'), to: localePath('/admissions') },
  { label: t('nav.news'), to: localePath('/news') },
  { label: t('nav.e_learning'), to: localePath('/e-learning') },
  { label: t('nav.faq'), to: localePath('/faq') },
  { label: t('nav.contact'), to: localePath('/contact') },
])

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
  <UHeader :title="$t('site.title')" :to="localePath('/')">
    <UNavigationMenu :items="headerItems" />

    <template #right>
      <!-- Locale Switcher -->
      <UDropdownMenu :items="localeSwitchItems">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="px-2"
          trailing-icon="i-lucide-chevron-down"
        >
          {{ locale === 'th' ? '🇹🇭 ภาษาไทย' : '🇬🇧 English' }}
        </UButton>
      </UDropdownMenu>

      <UColorModeButton />

      <UTooltip :text="$t('site.subtitle')" :kbds="['meta', '1']">
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
        &copy; {{ new Date().getFullYear() }} {{ $t('site.subtitle') }}
        <span class="hidden sm:inline">&mdash; {{ $t('site.university') }}</span>
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
