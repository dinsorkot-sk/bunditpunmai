<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'

const toast = useToast()
const { logout, user, loading } = useAuth()

const items: NavigationMenuItem[][] = [
  [
    {
      label: 'Dashboard',
      icon: 'i-lucide-house',
      to: '/user'
    },
    {
      label: 'Feed',
      icon: 'i-lucide-rss',
      to: '/user/feed'
    },
    {
      label: 'My Content',
      icon: 'i-lucide-file-text',
      defaultOpen: true,
      children: [
        { label: 'My Posts', icon: 'i-lucide-newspaper', to: '/user/my-content/posts' },
        { label: 'My Comments', icon: 'i-lucide-message-square', to: '/user/my-content/comments' }
      ]
    },
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      defaultOpen: false,
      children: [
        { label: 'Edit Profile', icon: 'i-lucide-pencil', to: '/user/profile' },
        { label: 'View Profile', icon: 'i-lucide-eye', to: '/user/profile/view' }
      ]
    },
    {
      label: 'Activity Log',
      icon: 'i-lucide-activity',
      to: '/user/activity'
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: '/user/settings'
    }
  ],
  [],
  [
    {
      label: 'Feedback',
      icon: 'i-lucide-message-circle',
      to: 'https://github.com/nuxt-ui-templates/dashboard',
      target: '_blank'
    },
    {
      label: 'Help & Support',
      icon: 'i-lucide-info',
      to: 'https://github.com/nuxt/ui',
      target: '_blank'
    }
  ]
]

const dropdownItems = computed<DropdownMenuItem[]>(() => [
  { label: 'Profile', icon: 'i-lucide-user', to: '/user/profile' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/user/settings' },
  { label: 'Logout', icon: 'i-lucide-log-out', onSelect: handleLogout }
])

async function handleLogout() {
  try {
    await logout()
    toast.add({ title: 'Logged out successfully', color: 'success' })
    await navigateTo('/login')
  } catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || 'Logout failed',
      color: 'error',
    })
  }
}
</script>

<template>
  <UDashboardSidebar collapsible resizable :ui="{ footer: 'border-t border-default' }">
    <template #header="{ collapsed }">
      <UButton v-if="!collapsed" icon="i-simple-icons-nuxtdotjs" label="User Portal" variant="ghost" class="w-full" />
      <UIcon v-else name="i-simple-icons-nuxtdotjs" class="size-5 text-primary mx-auto" />
    </template>

    <template #default="{ collapsed }">
      <UButton :label="collapsed ? undefined : 'Search...'" icon="i-lucide-search" color="neutral" variant="outline"
        block :square="collapsed">
        <template v-if="!collapsed" #trailing>
          <div class="flex items-center gap-0.5 ms-auto">
            <UKbd value="meta" variant="subtle" />
            <UKbd value="K" variant="subtle" />
          </div>
        </template>
      </UButton>

      <UNavigationMenu :collapsed="collapsed" :items="items[0]" orientation="vertical" />

      <UNavigationMenu :collapsed="collapsed" :items="items[1]" orientation="vertical" class="mt-auto" />

      <UNavigationMenu :collapsed="collapsed" :items="items[2]" orientation="vertical" class="mt-auto" />
    </template>

    <template #footer="{ collapsed }">
      <UDropdownMenu :items="dropdownItems" :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
        <UButton :avatar="{
          src: user?.avatar || undefined,
          alt: user?.name || 'User',
          loading: 'lazy'
        }" :label="collapsed ? undefined : (user?.name || 'User')" color="neutral" variant="ghost" class="w-full"
          :block="collapsed" />
      </UDropdownMenu>
    </template>
  </UDashboardSidebar>
</template>
