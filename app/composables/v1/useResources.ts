interface ApiResource {
  id: number
  title: string
  description: string
  url: string
  createdAt: string
}

export function useResources() {
  const resources = ref<ApiResource[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchResources = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiResource[]>('/api/v1/resources', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      resources.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getResource = async (id: number) => {
    return $fetch(`/api/v1/resources/${id}`)
  }

  const createResource = async (data: FormData) => {
    return $fetch('/api/v1/resources', { method: 'POST', body: data })
  }

  const updateResource = async (id: number, data: FormData | { title?: string; description?: string }) => {
    return $fetch(`/api/v1/resources/${id}`, { method: 'PATCH', body: data })
  }

  const deleteResource = async (id: number) => {
    return $fetch(`/api/v1/resources/${id}`, { method: 'DELETE' as any })
  }

  return {
    resources,
    loading,
    total,
    fetchResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
  }
}
