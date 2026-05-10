<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()

// ── Form validation schema ──

const schema = z.object({
  name: z.string().min(1, t('contact.name_required')),
  email: z.string().email(t('contact.email_invalid')),
  phone: z.string().optional(),
  subject: z.string().min(1, t('contact.subject_required')),
  message: z.string().min(1, t('contact.message_required')),
})

type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

const isSubmitting = ref(false)

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.add({
      title: t('contact.success_title'),
      description: t('contact.success_desc'),
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    state.name = ''
    state.email = ''
    state.phone = ''
    state.subject = ''
    state.message = ''
  } catch {
    toast.add({
      title: t('contact.error_title'),
      description: t('contact.error_desc'),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    isSubmitting.value = false
  }
}

// ── Social media links ──

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

// ── Contact info (reactive) ──

interface ContactInfo {
  icon: string
  title: string
  content: string
}

const contactInfo = computed<ContactInfo[]>(() => [
  {
    icon: 'i-lucide-map-pin',
    title: t('contact.location_title'),
    content: t('site.university'),
  },
  {
    icon: 'i-lucide-phone',
    title: t('contact.phone_title'),
    content: '053-873000',
  },
  {
    icon: 'i-lucide-mail',
    title: t('contact.email_title'),
    content: 'bunditpunmai@mju.ac.th',
  },
  {
    icon: 'i-lucide-clock',
    title: t('contact.hours_title'),
    content: t('contact.hours_content'),
  },
])
</script>

<template>
  <UPage>
    <UPageSection
      :title="$t('contact.title')"
      :description="$t('contact.description')"
      orientation="horizontal"
    />
    <UPageSection>
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- ───── LEFT COLUMN: Contact Info ───── -->
        <div class="space-y-6">
          <UCard
            v-for="item in contactInfo"
            :key="item.title"
            :ui="{ root: 'shadow-sm hover:shadow-md transition-shadow duration-300' }"
          >
            <div class="flex items-start gap-4">
              <div class="shrink-0 size-10 rounded-full flex items-center justify-center">
                <UIcon :name="item.icon" class="size-5" />
              </div>
              <div>
                <h3 class="font-semibold text-sm uppercase tracking-wider">
                  {{ item.title }}
                </h3>
                <p class="mt-1 text-base whitespace-pre-line leading-relaxed">
                  {{ item.content }}
                </p>
              </div>
            </div>
          </UCard>

          <!-- Social Media -->
          <div class="pt-2">
            <h3 class="font-semibold text-sm uppercase tracking-wider mb-4">
              {{ $t('contact.social_media') }}
            </h3>
            <div class="flex items-center gap-3">
              <a
                v-for="social in socialLinks"
                :key="social.label"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                :title="social.label"
                class="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600
                       hover:bg-[#0B2C6B] hover:text-white transition-all duration-300
                       hover:scale-110 hover:shadow-md"
              >
                <UIcon :name="social.icon" class="size-5" />
              </a>
            </div>
          </div>
        </div>

        <!-- ───── RIGHT COLUMN: Contact Form ───── -->
        <div>
          <UCard
            :ui="{
              root: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
              body: 'p-6 sm:p-8',
            }"
          >
            <h2 class="text-xl font-semibold mb-1">{{ $t('contact.form_title') }}</h2>
            <p class="text-sm mb-6">
              {{ $t('contact.form_description') }}
            </p>

            <UForm
              :schema="schema"
              :state="state"
              class="space-y-5"
              @submit="onSubmit"
            >
              <UFormField name="name" :label="$t('contact.name_label')" required>
                <UInput
                  v-model="state.name"
                  :placeholder="$t('contact.name_placeholder')"
                  class="w-full"
                />
              </UFormField>

              <div class="grid sm:grid-cols-2 gap-5">
                <UFormField name="email" :label="$t('contact.email_label')" required>
                  <UInput
                    v-model="state.email"
                    type="email"
                    :placeholder="$t('contact.email_placeholder')"
                    class="w-full"
                  />
                </UFormField>

                <UFormField name="phone" :label="$t('contact.phone_label')">
                  <UInput
                    v-model="state.phone"
                    type="tel"
                    :placeholder="$t('contact.phone_placeholder')"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField name="subject" :label="$t('contact.subject_label')" required>
                <UInput
                  v-model="state.subject"
                  :placeholder="$t('contact.subject_placeholder')"
                  class="w-full"
                />
              </UFormField>

              <UFormField name="message" :label="$t('contact.message_label')" required>
                <UTextarea
                  v-model="state.message"
                  :rows="4"
                  autoresize
                  :maxrows="8"
                  :placeholder="$t('contact.message_placeholder')"
                  class="w-full"
                />
              </UFormField>

              <UButton
                type="submit"
                size="lg"
                block
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="bg-gradient-to-r from-[#0B2C6B] to-blue-500 hover:from-[#0B2C6B] hover:to-blue-600
                       text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                <template #leading>
                  <UIcon name="i-lucide-send" class="size-4" />
                </template>
                {{ $t('contact.send_button') }}
              </UButton>
            </UForm>
          </UCard>
        </div>
      </div>
    </UPageSection>

    <!-- MAP SECTION -->
    <UPageSection :title="$t('contact.map_title')">
      <div class="rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?q=มหาวิทยาลัยแม่โจ้ เชียงใหม่"
          width="100%"
          height="400"
          style="border: 0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          :title="$t('contact.map_title')"
        />
      </div>
    </UPageSection>
  </UPage>
</template>
