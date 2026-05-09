<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const toast = useToast()
const { user, fetchUser } = useAuth()

// ── Password form ──
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const submittingPassword = ref(false)

async function handleChangePassword() {
  if (submittingPassword.value) return

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({ title: 'Passwords do not match', color: 'error' })
    return
  }
  if (passwordForm.value.newPassword.length < 8) {
    toast.add({ title: 'Password must be at least 8 characters', color: 'error' })
    return
  }

  submittingPassword.value = true
  try {
    await $fetch('/api/v1/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      }
    })
    toast.add({ title: 'Password changed successfully', color: 'success' })
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || 'Failed to change password',
      color: 'error',
    })
  } finally {
    submittingPassword.value = false
  }
}

// ── Profile form ──
const profileForm = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
  avatar: user.value?.avatar || '',
})
const submittingProfile = ref(false)

async function handleUpdateProfile() {
  if (submittingProfile.value || !user.value) return
  submittingProfile.value = true
  try {
    await $fetch(`/api/v1/users/${user.value.id}`, {
      method: 'PATCH',
      body: {
        name: profileForm.value.name,
        email: profileForm.value.email,
        avatar: profileForm.value.avatar,
      }
    })
    await fetchUser()
    toast.add({ title: 'Profile updated', color: 'success' })
  } catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || 'Failed to update profile',
      color: 'error',
    })
  } finally {
    submittingProfile.value = false
  }
}

watchEffect(() => {
  if (user.value) {
    profileForm.value.name = user.value.name || ''
    profileForm.value.email = user.value.email || ''
    profileForm.value.avatar = user.value.avatar || ''
  }
})

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-2xl mx-auto p-6 space-y-6">
        <!-- Profile -->
        <UCard variant="outline">
          <template #header>
            <span class="font-semibold text-sm">Profile</span>
          </template>

          <div class="flex items-center gap-4 mb-6">
            <UAvatar :src="profileForm.avatar || user?.avatar" :alt="profileForm.name || 'Admin'" size="2xl" />
            <div>
              <h2 class="text-lg font-semibold">{{ profileForm.name || user?.name }}</h2>
              <p class="text-sm text-muted">{{ profileForm.email || user?.email }}</p>
            </div>
          </div>

          <UForm :state="profileForm" class="space-y-4" @submit="handleUpdateProfile">
            <UFormField label="Name" required>
              <UInput v-model="profileForm.name" placeholder="Your name" class="w-full" />
            </UFormField>
            <UFormField label="Email" required>
              <UInput v-model="profileForm.email" type="email" placeholder="your@email.com" class="w-full" />
            </UFormField>
            <UFormField label="Avatar URL">
              <UInput v-model="profileForm.avatar" placeholder="https://example.com/avatar.jpg" class="w-full" />
              <template #hint>
                <span class="text-xs text-muted">URL to your profile picture</span>
              </template>
            </UFormField>
            <div class="flex justify-end gap-2 pt-2">
              <UButton type="submit" label="Save Changes" color="primary" :loading="submittingProfile" />
            </div>
          </UForm>
        </UCard>

        <!-- Change Password -->
        <UCard variant="outline">
          <template #header>
            <span class="font-semibold text-sm">Change Password</span>
          </template>

          <UForm :state="passwordForm" class="space-y-4" @submit="handleChangePassword">
            <UFormField label="Current Password" required>
              <UInput v-model="passwordForm.currentPassword" type="password" placeholder="Enter current password" class="w-full" />
            </UFormField>
            <UFormField label="New Password" required>
              <UInput v-model="passwordForm.newPassword" type="password" placeholder="Enter new password" class="w-full" />
            </UFormField>
            <UFormField label="Confirm New Password" required>
              <UInput v-model="passwordForm.confirmPassword" type="password" placeholder="Confirm new password" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 pt-2">
              <UButton type="submit" label="Change Password" color="primary" :loading="submittingPassword" />
            </div>
          </UForm>
        </UCard>

        <!-- Account Info (read-only) -->
        <UCard variant="outline">
          <template #header>
            <span class="font-semibold text-sm">Account Information</span>
          </template>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">Role</span>
              <UBadge :label="user?.role || 'Admin'" color="primary" variant="subtle" size="xs" class="capitalize" />
            </div>
            <USeparator />
            <div class="flex justify-between">
              <span class="text-muted">Member since</span>
              <span>{{ user?.createdAt ? formatDate(user.createdAt) : '—' }}</span>
            </div>
            <USeparator />
            <div class="flex justify-between">
              <span class="text-muted">Notifications</span>
              <span class="text-muted">Coming soon</span>
            </div>
            <USeparator />
            <div class="flex justify-between">
              <span class="text-muted">Language</span>
              <span>English</span>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
