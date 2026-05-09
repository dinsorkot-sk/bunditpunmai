<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  middleware: 'guest',
})

const toast = useToast()
const { login, loading, user } = useAuth()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox'
}]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const submitProps = computed(() => ({
  loading: loading.value,
  disabled: loading.value,
}))

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    const { email, password } = payload.data
    await login(email, password)
    toast.add({ title: 'Welcome back!', color: 'success' })
    // Redirect based on user role
    const role = user.value?.role
    if (role === 'user') {
      await navigateTo('/user')
    } else {
      await navigateTo('/admin')
    }
  } catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || err?.message || 'Login failed',
      color: 'error',
    })
  }
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :submit="submitProps"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
