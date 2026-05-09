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
const allItems = ref<ThiingsItem[]>([])
const loading = ref(false)
const error = ref(false)
const displayedCount = ref(200)
const BATCH_SIZE = 200

// ── Derived: currently visible items ──
const filteredItems = computed(() => {
  if (!search.value.trim()) return allItems.value
  const q = search.value.trim().toLowerCase()
  return allItems.value.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.categories.some((c) => c.toLowerCase().includes(q)),
  )
})

const visibleItems = computed(() =>
  filteredItems.value.slice(0, displayedCount.value),
)

const hasMore = computed(() => displayedCount.value < filteredItems.value.length)
const totalCount = computed(() => filteredItems.value.length)

// ── Load on open ──
watch(open, (val) => {
  if (val) {
    search.value = ''
    displayedCount.value = BATCH_SIZE
    if (allItems.value.length === 0) {
      fetchAll()
    }
  }
})

// ── Reset pagination on search ──
watch(search, () => {
  displayedCount.value = BATCH_SIZE
})

async function fetchAll() {
  loading.value = true
  error.value = false
  try {
    const res = await $fetch<{ data: ThiingsItem[]; total: number }>(
      '/api/v1/avatars/providers/thiings',
    )
    allItems.value = res.data
  } catch {
    error.value = true
    allItems.value = []
  } finally {
    loading.value = false
  }
}

function loadMore() {
  displayedCount.value += BATCH_SIZE
}

function select(item: ThiingsItem) {
  emit('update:modelValue', item.imageUrl)
  open.value = false
}

function isSelected(item: ThiingsItem): boolean {
  return props.modelValue === item.imageUrl
}

function retry() {
  fetchAll()
}
</script>

<template>
  <UModal v-model:open="open" title="Choose Avatar" >
    <template #body>
      <!-- Search + count -->
      <div class="flex items-center gap-3">
        <UInput
          v-model="search"
          placeholder="Search icons..."
          class="flex-1"
        >
          <template #leading>
            <span class="i-lucide-search text-muted shrink-0" />
          </template>
        </UInput>
        <span v-if="!loading && allItems.length" class="text-xs text-muted shrink-0 whitespace-nowrap">
          {{ Math.min(displayedCount, totalCount) }}/{{ totalCount }}
        </span>
      </div>

      <!-- Picker Grid -->
      <div class="mt-4 max-h-[65vh] overflow-y-auto overflow-x-hidden">
        <!-- Loading state -->
        <div v-if="loading" class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
          <div
            v-for="n in 24"
            :key="n"
            class="aspect-square rounded-xl bg-muted/30 animate-pulse"
          />
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="flex flex-col items-center gap-3 py-16">
          <span class="i-lucide-alert-circle text-4xl text-muted" />
          <p class="text-muted">Failed to load icons.</p>
          <UButton label="Try Again" color="primary" variant="outline" @click="retry" />
        </div>

        <!-- Empty state -->
        <div v-else-if="allItems.length === 0" class="text-center py-16">
          <span class="i-lucide-image-off text-4xl text-muted" />
          <p class="text-muted mt-2">No icons available</p>
        </div>

        <!-- No results (filtered) -->
        <div v-else-if="filteredItems.length === 0" class="text-center py-16">
          <span class="i-lucide-search-x text-4xl text-muted" />
          <p class="text-muted mt-2">No icons match "{{ search }}"</p>
        </div>

        <!-- Grid -->
        <template v-else>
          <div class="grid grid-cols-5 gap-3">
            <button
              v-for="item in visibleItems"
              :key="item.id"
              type="button"
              class="group relative aspect-square rounded-xl border-2 border-transparent bg-muted/10 p-2 transition-all hover:border-primary/50 hover:bg-muted/20 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              :class="{ '!border-primary !bg-primary/10 ring-2 ring-primary': isSelected(item) }"
              :title="item.name"
              @click="select(item)"
            >
              <img
                :src="item.imageUrl"
                :alt="item.name"
                class="h-full w-full object-contain transition-transform group-hover:scale-110"
                loading="lazy"
              />
              <!-- Selected checkmark -->
              <span
                v-if="isSelected(item)"
                class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white shadow"
              >
                ✓
              </span>
              <!-- Hover tooltip name -->
              <span
                class="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"
              >
                {{ item.name }}
              </span>
            </button>
          </div>

          <!-- Load More -->
          <div v-if="hasMore" class="mt-6 flex flex-col items-center gap-2">
            <UButton
              label="Load More"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
              @click="loadMore"
            />
            <span class="text-xs text-muted">
              Showing {{ Math.min(displayedCount, totalCount) }} of {{ totalCount }} icons
            </span>
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>
