<script setup lang="ts">
const toast = useToast()

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const submitting = ref(false)

async function handleChangePassword() {
  if (submitting.value) return

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({ title: 'Passwords do not match', color: 'error' })
    return
  }
  if (passwordForm.value.newPassword.length < 8) {
    toast.add({ title: 'Password must be at least 8 characters', color: 'error' })
    return
  }

  submitting.value = true
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
    submitting.value = false
  }
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
              <UButton type="submit" label="Change Password" color="primary" :loading="submitting" />
            </div>
          </UForm>
        </UCard>

        <!-- Account Info -->
        <UCard variant="outline">
          <template #header>
            <span class="font-semibold text-sm">Account Information</span>
          </template>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">Role</span>
              <UBadge label="User" color="primary" variant="subtle" size="xs" />
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
