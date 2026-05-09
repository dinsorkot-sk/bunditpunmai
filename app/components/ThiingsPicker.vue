<script setup lang="ts">
interface ThiingsItem {
  id: string
  name: string
  categories: string[]
  imageUrl: string
}

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = defineModel<boolean>('open', { default: false })
const search = ref('')
const items = ref<ThiingsItem[]>([])
const loading = ref(false)
const error = ref(false)

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(search, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchItems()
  }, 300)
})

watch(open, (val) => {
  if (val) {
    items.value = []
    search.value = ''
    fetchItems()
  }
})

async function fetchItems() {
  loading.value = true
  error.value = false
  try {
    const params: Record<string, string> = {}
    if (search.value.trim()) {
      params.search = search.value.trim()
    }
    const query = new URLSearchParams(params).toString()
    const url = `/api/v1/avatars/providers/thiings${query ? `?${query}` : ''}`
    items.value = await $fetch<ThiingsItem[]>(url)
  } catch {
    error.value = true
    items.value = []
  } finally {
    loading.value = false
  }
}

function select(item: ThiingsItem) {
  emit('update:modelValue', item.imageUrl)
  open.value = false
}

function isSelected(item: ThiingsItem): boolean {
  return props.modelValue === item.imageUrl
}
</script>

<template>
  <UModal v-model:open="open" title="Choose Avatar" :ui="{ width: 'max-w-3xl' }">
    <template #body>
      <!-- Search -->
      <UInput
        v-model="search"
        placeholder="Search icons..."
        class="w-full"
      >
        <template #leading>
          <span class="i-lucide-search text-muted shrink-0" />
        </template>
      </UInput>

      <!-- Picker Grid -->
      <div class="mt-4 max-h-[60vh] overflow-y-auto">
        <!-- Loading state -->
        <div v-if="loading" class="grid grid-cols-4 md:grid-cols-6 gap-3">
          <div
            v-for="n in 24"
            :key="n"
            class="aspect-square rounded-xl bg-muted/30 animate-pulse"
          />
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-muted">Failed to load icons. Please try again.</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="items.length === 0" class="text-center py-12">
          <p class="text-muted">No icons found</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-4 md:grid-cols-6 gap-3">
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="relative aspect-square rounded-xl border-2 border-transparent bg-muted/10 p-2 transition-all hover:border-primary/50 hover:bg-muted/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="{ '!border-primary !bg-primary/10 ring-2 ring-primary': isSelected(item) }"
            :title="item.name"
            @click="select(item)"
          >
            <img
              :src="item.imageUrl"
              :alt="item.name"
              class="h-full w-full object-contain"
              loading="lazy"
            />
            <span
              v-if="isSelected(item)"
              class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white"
            >
              ✓
            </span>
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>
