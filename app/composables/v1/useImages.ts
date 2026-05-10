interface ApiImage {
  id: number
  url: string
  altText: string
  createdAt: string
}

export function useImages() {
  const images = ref<ApiImage[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchImages = async (params: { limit?: number; offset?: number; locale?: string } = {}) => {
    loading.value = true
    try {
      const query: Record<string, any> = { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      if (params.locale) query.locale = params.locale
      const result = await $fetch<ApiImage[]>('/api/v1/images', { query })
      images.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getImage = async (id: number, locale?: string) => {
    const query = locale ? { locale } : undefined
    return $fetch(`/api/v1/images/${id}`, { query })
  }

  const createImage = async (data: FormData) => {
    return $fetch('/api/v1/images', { method: 'POST', body: data })
  }

  const updateImage = async (id: number, data: FormData | { altText?: string }) => {
    return $fetch(`/api/v1/images/${id}`, { method: 'PATCH', body: data })
  }

  const deleteImage = async (id: number) => {
    return $fetch(`/api/v1/images/${id}`, { method: 'DELETE' as any })
  }

  return {
    images,
    loading,
    total,
    fetchImages,
    getImage,
    createImage,
    updateImage,
    deleteImage,
  }
}
