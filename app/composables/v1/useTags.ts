interface ApiTag {
  id: number
  name: string
}

export function useTags() {
  const tags = ref<ApiTag[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchTags = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiTag[]>('/api/v1/tags', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      tags.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getTag = async (id: number) => {
    return $fetch(`/api/v1/tags/${id}`)
  }

  const createTag = async (data: { name: string }) => {
    return $fetch('/api/v1/tags', { method: 'POST', body: data })
  }

  const updateTag = async (id: number, data: { name?: string }) => {
    return $fetch(`/api/v1/tags/${id}`, { method: 'PATCH', body: data })
  }

  const deleteTag = async (id: number) => {
    return $fetch(`/api/v1/tags/${id}`, { method: 'DELETE' as any })
  }

  return {
    tags,
    loading,
    total,
    fetchTags,
    getTag,
    createTag,
    updateTag,
    deleteTag,
  }
}
