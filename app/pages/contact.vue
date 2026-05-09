<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// ── Form validation schema ──

const schema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  message: z.string().min(1, 'กรุณากรอกข้อความ'),
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
    // In production, send data to API endpoint
    // await $fetch('/api/v1/contact', { method: 'POST', body: event.data })
    await new Promise((resolve) => setTimeout(resolve, 1000)) // simulate send
    toast.add({
      title: 'ส่งข้อความสำเร็จ',
      description: 'ทีมงานจะตอบกลับภายใน 1-2 วันทำการ',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    // Reset form
    state.name = ''
    state.email = ''
    state.phone = ''
    state.subject = ''
    state.message = ''
  } catch {
    toast.add({
      title: 'ส่งข้อความไม่สำเร็จ',
      description: 'กรุณาลองอีกครั้งหรือติดต่อผ่านช่องทางอื่น',
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

// ── Contact info ──

interface ContactInfo {
  icon: string
  title: string
  content: string
}

const contactInfo: ContactInfo[] = [
  {
    icon: 'i-lucide-map-pin',
    title: 'Location',
    content: `โครงการ BunditPunMai\nมหาวิทยาลัยแม่โจ้\n63 หมู่ 4 ตำบลหนองหาร\nอำเภอสันทราย จังหวัดเชียงใหม่ 50290`,
  },
  {
    icon: 'i-lucide-phone',
    title: 'Phone',
    content: '053-873000',
  },
  {
    icon: 'i-lucide-mail',
    title: 'Email',
    content: 'bunditpunmai@mju.ac.th',
  },
  {
    icon: 'i-lucide-clock',
    title: 'Office Hours',
    content: 'จันทร์ - ศุกร์ : 08:30 - 16:30 น.',
  },
]
</script>

<template>
  <UPage>
    <UPageSection
      title=" ติดต่อเรา"
      description="
        หากมีคำถามเกี่ยวกับโครงการ BunditPunMai หรือต้องการข้อมูลเพิ่มเติมเกี่ยวกับกิจกรรม
        หลักสูตร และการพัฒนาทักษะดิจิทัล สามารถติดต่อทีมงานของเราได้ตลอดเวลา"
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
              Social Media
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
            <h2 class="text-xl font-semibold  mb-1">ส่งข้อความถึงเรา</h2>
            <p class="text-sm mb-6">
              กรอกข้อมูลด้านล่าง แล้วทีมงานจะตอบกลับโดยเร็วที่สุด
            </p>

            <UForm
              :schema="schema"
              :state="state"
              class="space-y-5"
              @submit="onSubmit"
            >
              <UFormField name="name" label="ชื่อ-นามสกุล" required>
                <UInput
                  v-model="state.name"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                  class="w-full"
                />
              </UFormField>

              <div class="grid sm:grid-cols-2 gap-5">
                <UFormField name="email" label="อีเมล" required>
                  <UInput
                    v-model="state.email"
                    type="email"
                    placeholder="you@example.com"
                    class="w-full"
                  />
                </UFormField>

                <UFormField name="phone" label="เบอร์โทรศัพท์">
                  <UInput
                    v-model="state.phone"
                    type="tel"
                    placeholder="099-999-9999"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField name="subject" label="หัวข้อ" required>
                <UInput
                  v-model="state.subject"
                  placeholder="หัวข้อที่ต้องการติดต่อ"
                  class="w-full"
                />
              </UFormField>

              <UFormField name="message" label="ข้อความ" required>
                <UTextarea
                  v-model="state.message"
                  :rows="4"
                  autoresize
                  :maxrows="8"
                  placeholder="กรุณากรอกรายละเอียดข้อความของคุณ..."
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
                ส่งข้อความ
              </UButton>
            </UForm>
          </UCard>
        </div>
      </div>
    </UPageSection>

    <!-- ════════════════════════════════════════════════════════════
         MAP SECTION
       ════════════════════════════════════════════════════════════ -->
    <UPageSection title="ที่อยู่ของเรา">
      <div class="rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?q=มหาวิทยาลัยแม่โจ้ เชียงใหม่"
          width="100%"
          height="400"
          style="border: 0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="แผนที่มหาวิทยาลัยแม่โจ้"
        />
      </div>
    </UPageSection>
  </UPage>
</template>
