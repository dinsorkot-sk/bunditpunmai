interface ApiVideo {
  id: number
  url: string
  altText: string
  createdAt: string
}

export function useVideos() {
  const videos = ref<ApiVideo[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchVideos = async (params: { limit?: number; offset?: number; locale?: string } = {}) => {
    loading.value = true
    try {
      const query: Record<string, any> = { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      if (params.locale) query.locale = params.locale
      const result = await $fetch<ApiVideo[]>('/api/v1/videos', { query })
      videos.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getVideo = async (id: number, locale?: string) => {
    const query = locale ? { locale } : undefined
    return $fetch(`/api/v1/videos/${id}`, { query })
  }

  const createVideo = async (data: FormData) => {
    return $fetch('/api/v1/videos', { method: 'POST', body: data })
  }

  const updateVideo = async (id: number, data: FormData | { altText?: string }) => {
    return $fetch(`/api/v1/videos/${id}`, { method: 'PATCH', body: data })
  }

  const deleteVideo = async (id: number) => {
    return $fetch(`/api/v1/videos/${id}`, { method: 'DELETE' as any })
  }

  return {
    videos,
    loading,
    total,
    fetchVideos,
    getVideo,
    createVideo,
    updateVideo,
    deleteVideo,
  }
}
