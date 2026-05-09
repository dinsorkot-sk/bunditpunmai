<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'

const toast = useToast()
const { logout, user, loading } = useAuth()

const items: NavigationMenuItem[][] = [
  [
    {
      label: 'Dashboard',
      icon: 'i-lucide-house',
      to: '/admin'
    },
    {
      label: 'User Management',
      icon: 'i-lucide-shield',
      defaultOpen: true,
      children: [
        { label: 'Users', icon: 'i-lucide-users', to: '/admin/user-management/users' },
        { label: 'Roles', icon: 'i-lucide-badge', to: '/admin/user-management/roles' },
        { label: 'Permissions', icon: 'i-lucide-key', to: '/admin/user-management/permissions' },
        { label: 'User Roles', icon: 'i-lucide-user-check', to: '/admin/user-management/user-roles' },
        { label: 'Role Permissions', icon: 'i-lucide-lock', to: '/admin/user-management/role-permissions' }
      ]
    },
    {
      label: 'Content',
      icon: 'i-lucide-file-text',
      defaultOpen: true,
      children: [
        { label: 'Posts', icon: 'i-lucide-newspaper', to: '/admin/content/posts' },
        { label: 'Blogs', icon: 'i-lucide-book-open', to: '/admin/content/blogs' },
        { label: 'Courses', icon: 'i-lucide-graduation-cap', to: '/admin/content/courses' },
        { label: 'Comments', icon: 'i-lucide-message-square', to: '/admin/content/comments' },
        { label: 'Tags', icon: 'i-lucide-tag', to: '/admin/content/tags' }
      ]
    },
    {
      label: 'Content Relations',
      icon: 'i-lucide-link',
      defaultOpen: false,
      children: [
        { label: 'Post Tags', icon: 'i-lucide-hash', to: '/admin/content-relations/post-tags' },
        { label: 'Blog Tags', icon: 'i-lucide-hash', to: '/admin/content-relations/blog-tags' },
        { label: 'Course Tags', icon: 'i-lucide-hash', to: '/admin/content-relations/course-tags' },
        { label: 'Course Resources', icon: 'i-lucide-folder', to: '/admin/content-relations/course-resources' }
      ]
    },
    {
      label: 'Media',
      icon: 'i-lucide-image',
      defaultOpen: true,
      children: [
        { label: 'Images', icon: 'i-lucide-image', to: '/admin/media/images' },
        { label: 'Videos', icon: 'i-lucide-video', to: '/admin/media/videos' },
        { label: 'Resources', icon: 'i-lucide-file', to: '/admin/media/resources' }
      ]
    },
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/admin/profile'
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: '/admin/settings'
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
  { label: 'Profile', icon: 'i-lucide-user', to: '/admin/profile' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/admin/settings' },
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
      <UButton v-if="!collapsed" icon="i-simple-icons-nuxtdotjs" label="Nuxt" variant="ghost" class="w-full" />
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
