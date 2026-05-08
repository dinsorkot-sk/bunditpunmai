<script setup lang="ts">
/**
 * ResourcePreviewModal
 *
 * Displays a modal preview of a resource (video, PDF, image, document, etc.)
 * with a download button. The resource type is inferred from the URL file extension.
 */
import { computed } from 'vue'

const props = defineProps<{
  title: string
  description: string
  url: string
}>()

const isOpen = defineModel<boolean>('open', { default: false })

// ── Resource type detection ──

const resourceType = computed(() => {
  const ext = props.url?.split('.').pop()?.toLowerCase() ?? ''
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
  if (['pdf'].includes(ext)) return 'pdf'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) return 'image'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel'
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
  if (['txt', 'md', 'log'].includes(ext)) return 'text'
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'wma'].includes(ext)) return 'audio'
  return 'other'
})

const isVideo = computed(() => resourceType.value === 'video')
const isAudio = computed(() => resourceType.value === 'audio')
const isImage = computed(() => resourceType.value === 'image')
const isPdf = computed(() => resourceType.value === 'pdf')

const typeIcon = computed(() => {
  const map: Record<string, string> = {
    video: 'i-lucide-video',
    audio: 'i-lucide-music',
    pdf: 'i-lucide-file-text',
    image: 'i-lucide-image',
    word: 'i-lucide-file-text',
    excel: 'i-lucide-file-spreadsheet',
    powerpoint: 'i-lucide-presentation',
    archive: 'i-lucide-file-archive',
    text: 'i-lucide-file-text',
    other: 'i-lucide-file',
  }
  return map[resourceType.value] ?? 'i-lucide-file'
})

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    video: 'วิดีโอ',
    audio: 'เสียง',
    pdf: 'เอกสาร PDF',
    image: 'รูปภาพ',
    word: 'เอกสาร Word',
    excel: 'ตาราง Excel',
    powerpoint: 'งานนำเสนอ PowerPoint',
    archive: 'ไฟล์บีบอัด',
    text: 'ไฟล์ข้อความ',
    other: 'ไฟล์',
  }
  return map[resourceType.value] ?? 'ไฟล์'
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :description="description"
    :ui="{
      content: 'max-w-4xl w-[calc(100vw-2rem)]',
      body: 'p-4 sm:p-6 overflow-y-auto',
    }"
  >
    <template #body>
      <div class="space-y-4">
        <!-- ── Video Preview ── -->
        <div v-if="isVideo" class="rounded-lg overflow-hidden bg-black">
          <video
            :src="url"
            controls
            class="w-full max-h-[65vh]"
            playsinline
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <!-- ── Audio Preview ── -->
        <div v-else-if="isAudio" class="flex flex-col items-center justify-center py-12 bg-elevated rounded-lg">
          <div class="size-24 rounded-full bg-default flex items-center justify-center shadow-lg mb-6">
            <UIcon name="i-lucide-music" class="size-12 text-primary" />
          </div>
          <audio :src="url" controls class="w-full max-w-md">
            Your browser does not support the audio tag.
          </audio>
        </div>

        <!-- ── PDF Preview ── -->
        <div v-else-if="isPdf" class="rounded-lg overflow-hidden border border-default">
          <iframe
            :src="url"
            class="w-full h-[65vh]"
            frameborder="0"
            title="PDF Preview"
          >
            Your browser does not support PDF preview.
          </iframe>
        </div>

        <!-- ── Image Preview ── -->
        <div v-else-if="isImage" class="rounded-lg overflow-hidden bg-elevated flex items-center justify-center">
          <img
            :src="url"
            :alt="title"
            class="max-w-full max-h-[65vh] object-contain"
          />
        </div>

        <!-- ── Other File Types ── -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center space-y-6">
          <div class="size-24 rounded-full bg-elevated flex items-center justify-center">
            <UIcon :name="typeIcon" class="size-12 text-muted" />
          </div>
          <div class="space-y-2">
            <p class="text-base font-medium text-highlighted">ไม่สามารถแสดงตัวอย่างได้</p>
            <p class="text-sm text-muted">
              ประเภทไฟล์: <span class="font-medium">{{ typeLabel }}</span>
            </p>
            <p class="text-xs text-muted">กรุณาดาวน์โหลดไฟล์เพื่อเปิดดู</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex items-center justify-between w-full">
        <UButton
          label="ปิด"
          color="neutral"
          variant="ghost"
          @click="close"
        />
        <UButton
          :to="url"
          :label="'ดาวน์โหลด ' + typeLabel"
          color="primary"
          variant="solid"
          icon="i-lucide-download"
          target="_blank"
        />
      </div>
    </template>
  </UModal>
</template>
