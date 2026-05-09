<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const toast = useToast()
const { user, fetchUser } = useAuth()

// ── Tab definition ──
const tabs = [
  { label: 'Profile', icon: 'i-lucide-user', slot: 'profile' as const },
  { label: 'Password', icon: 'i-lucide-lock', slot: 'password' as const },
  { label: 'Account', icon: 'i-lucide-info', slot: 'account' as const },
]

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
      },
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

// ── Password strength indicator ──
const passwordStrength = computed(() => {
  const pwd = passwordForm.value.newPassword
  if (!pwd) return { score: 0, label: '', color: 'neutral' as const }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 2) return { score: 25, label: 'Weak', color: 'error' as const }
  if (score <= 3) return { score: 50, label: 'Fair', color: 'warning' as const }
  if (score <= 4) return { score: 75, label: 'Good', color: 'primary' as const }
  return { score: 100, label: 'Strong', color: 'success' as const }
})

const showAvatarPicker = ref(false)

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
      },
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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
      <div class="max-w-3xl mx-auto p-6 space-y-6">
        <!-- ── Hero Card ── -->
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-muted/10 border border-muted/30">
          <!-- Decorative blobs -->
          <div class="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div class="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

          <div class="relative flex items-center gap-5 p-6">
            <div class="relative shrink-0">
              <UAvatar
                :src="user?.avatar"
                :alt="user?.name || 'Admin'"
                size="3xl"
                class="ring-4 ring-background shadow-lg"
              />
            </div>
            <div class="min-w-0">
              <h1 class="text-xl font-bold truncate">
                {{ user?.name || 'Admin' }}
              </h1>
              <p class="text-sm text-muted truncate">
                {{ user?.email }}
              </p>
              <div class="mt-1.5 flex items-center gap-2">
                <UBadge :label="user?.role || 'Admin'" color="primary" variant="subtle" size="xs" class="capitalize" />
                <span v-if="user?.createdAt" class="text-xs text-muted">
                  Member since {{ formatDate(user.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Tabs ── -->
        <UTabs :items="tabs" class="w-full">
          <template #profile>
            <UCard>
              <div class="space-y-6">
                <!-- Avatar section -->
                <div>
                  <h3 class="text-sm font-semibold mb-1">Avatar</h3>
                  <p class="text-xs text-muted mb-3">Choose a 3D icon as your profile picture.</p>
                  <div class="flex items-center gap-4">
                    <UAvatar
                      :src="profileForm.avatar || user?.avatar"
                      :alt="profileForm.name || 'Admin'"
                      size="2xl"
                      class="ring-2 ring-muted/30"
                    />
                    <div class="flex flex-col gap-2">
                      <UButton
                        label="Choose Avatar"
                        color="primary"
                        variant="outline"
                        @click="showAvatarPicker = true"
                      />
                      <UButton
                        v-if="profileForm.avatar"
                        label="Remove"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        @click="profileForm.avatar = ''"
                      />
                    </div>
                  </div>
                  <ThiingsPicker v-model="profileForm.avatar" v-model:open="showAvatarPicker" />
                </div>

                <USeparator />

                <!-- Profile form -->
                <UForm :state="profileForm" class="space-y-4" @submit="handleUpdateProfile">
                  <UFormField label="Name" required hint="Your display name">
                    <UInput v-model="profileForm.name" placeholder="Your name" class="w-full" />
                  </UFormField>
                  <UFormField label="Email" required hint="Used for notifications">
                    <UInput
                      v-model="profileForm.email"
                      type="email"
                      placeholder="your@email.com"
                      class="w-full"
                    />
                  </UFormField>
                  <div class="flex justify-end gap-2 pt-2">
                    <UButton
                      type="submit"
                      label="Save Changes"
                      color="primary"
                      :loading="submittingProfile"
                    />
                  </div>
                </UForm>
              </div>
            </UCard>
          </template>

          <template #password>
            <UCard>
              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-semibold mb-1">Change Password</h3>
                  <p class="text-xs text-muted">
                    Ensure your account is secure with a strong password.
                  </p>
                </div>

                <UForm :state="passwordForm" class="space-y-4" @submit="handleChangePassword">
                  <UFormField label="Current Password" required>
                    <UInput
                      v-model="passwordForm.currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="New Password" required>
                    <UInput
                      v-model="passwordForm.newPassword"
                      type="password"
                      placeholder="Enter new password"
                      class="w-full"
                    />
                    <!-- Strength bar -->
                    <template v-if="passwordForm.newPassword" #hint>
                      <div class="mt-1.5 space-y-1">
                        <div class="h-1 w-full rounded-full bg-muted/30 overflow-hidden">
                          <div
                            class="h-full rounded-full transition-all duration-300"
                            :class="{
                              'bg-error': passwordStrength.color === 'error',
                              'bg-warning': passwordStrength.color === 'warning',
                              'bg-primary': passwordStrength.color === 'primary',
                              'bg-success': passwordStrength.color === 'success',
                            }"
                            :style="{ width: `${passwordStrength.score}%` }"
                          />
                        </div>
                        <span
                          class="text-xs"
                          :class="{
                            'text-error': passwordStrength.color === 'error',
                            'text-warning': passwordStrength.color === 'warning',
                            'text-primary': passwordStrength.color === 'primary',
                            'text-success': passwordStrength.color === 'success',
                          }"
                        >
                          {{ passwordStrength.label }}
                        </span>
                      </div>
                    </template>
                  </UFormField>

                  <UFormField label="Confirm New Password" required>
                    <UInput
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      class="w-full"
                    />
                  </UFormField>

                  <div class="flex justify-end gap-2 pt-2">
                    <UButton
                      type="submit"
                      label="Change Password"
                      color="primary"
                      :loading="submittingPassword"
                    />
                  </div>
                </UForm>
              </div>
            </UCard>
          </template>

          <template #account>
            <UCard>
              <div class="space-y-6">
                <div>
                  <h3 class="text-sm font-semibold mb-1">Account Information</h3>
                  <p class="text-xs text-muted">Details about your account and preferences.</p>
                </div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between rounded-lg bg-muted/10 px-4 py-3">
                    <div class="flex items-center gap-3">
                      <span class="i-lucide-shield text-muted shrink-0" />
                      <span class="text-sm">Role</span>
                    </div>
                    <UBadge :label="user?.role || 'Admin'" color="primary" variant="subtle" size="xs" class="capitalize" />
                  </div>
                  <div class="flex items-center justify-between rounded-lg bg-muted/10 px-4 py-3">
                    <div class="flex items-center gap-3">
                      <span class="i-lucide-calendar text-muted shrink-0" />
                      <span class="text-sm">Member since</span>
                    </div>
                    <span class="text-sm text-muted">
                      {{ user?.createdAt ? formatDate(user.createdAt) : '—' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between rounded-lg bg-muted/10 px-4 py-3">
                    <div class="flex items-center gap-3">
                      <span class="i-lucide-bell text-muted shrink-0" />
                      <span class="text-sm">Notifications</span>
                    </div>
                    <span class="text-sm text-muted">Coming soon</span>
                  </div>
                  <div class="flex items-center justify-between rounded-lg bg-muted/10 px-4 py-3">
                    <div class="flex items-center gap-3">
                      <span class="i-lucide-globe text-muted shrink-0" />
                      <span class="text-sm">Language</span>
                    </div>
                    <span class="text-sm">English</span>
                  </div>
                </div>
              </div>
            </UCard>
          </template>
        </UTabs>
      </div>
    </template>
  </UDashboardPanel>
</template>
