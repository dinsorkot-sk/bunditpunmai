<script setup lang="ts">
const { user, fetchUser } = useAuth()
const toast = useToast()

const showAvatarPicker = ref(false)

const form = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
  avatar: user.value?.avatar || '',
})
const submitting = ref(false)

async function handleSubmit() {
  if (submitting.value || !user.value) return
  submitting.value = true
  try {
    await $fetch(`/api/v1/users/${user.value.id}`, {
      method: 'PATCH',
      body: {
        name: form.value.name,
        email: form.value.email,
        avatar: form.value.avatar,
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
    submitting.value = false
  }
}

watchEffect(() => {
  if (user.value) {
    form.value.name = user.value.name || ''
    form.value.email = user.value.email || ''
    form.value.avatar = user.value.avatar || ''
  }
})
</script>

<template>
  <UDashboardPanel resizable>
    <template #header>
      <UDashboardNavbar title="Edit Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-2xl mx-auto p-6 space-y-6">
        <UCard variant="outline">
          <div class="flex items-center gap-4 mb-6">
            <UAvatar :src="user?.avatar" :alt="user?.name || 'User'" size="2xl" />
            <div>
              <h2 class="text-lg font-semibold">{{ user?.name }}</h2>
              <p class="text-sm text-muted">{{ user?.email }}</p>
              <p class="text-xs text-muted mt-1">Role: <UBadge label="User" color="primary" variant="subtle" size="xs" /></p>
            </div>
          </div>

          <UForm :state="form" class="space-y-4" @submit="handleSubmit">
            <UFormField label="Name" required>
              <UInput v-model="form.name" placeholder="Your name" class="w-full" />
            </UFormField>
            <UFormField label="Email" required>
              <UInput v-model="form.email" type="email" placeholder="your@email.com" class="w-full" />
            </UFormField>
            <UFormField label="Avatar">
              <div class="flex items-center gap-3 w-full">
                <UAvatar v-if="form.avatar" :src="form.avatar" size="lg" />
                <div class="flex gap-2">
                  <UButton label="Choose Avatar" color="primary" variant="outline" @click="showAvatarPicker = true" />
                  <UButton v-if="form.avatar" label="Remove" color="neutral" variant="ghost" @click="form.avatar = ''" />
                </div>
              </div>
              <ThiingsPicker v-model="form.avatar" v-model:open="showAvatarPicker" />
            </UFormField>

            <div class="flex justify-end gap-2 pt-2">
              <UButton type="submit" label="Save Changes" color="primary" :loading="submitting" />
            </div>
          </UForm>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
