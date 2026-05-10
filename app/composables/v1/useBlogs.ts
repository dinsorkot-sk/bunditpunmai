interface ApiBlog {
  id: number
  title: string
  description: string
  content: string
  likes: number
  status: string
  authorId: number
  createdAt: string
}

export function useBlogs() {
  const blogs = ref<ApiBlog[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchBlogs = async (params: { limit?: number; offset?: number; locale?: string } = {}) => {
    loading.value = true
    try {
      const query: Record<string, any> = { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      if (params.locale) query.locale = params.locale
      const result = await $fetch<ApiBlog[]>('/api/v1/blogs', { query })
      blogs.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getBlog = async (id: number, locale?: string) => {
    const query = locale ? { locale } : undefined
    return $fetch(`/api/v1/blogs/${id}`, { query })
  }

  const createBlog = async (data: { title: string; description: string; content: string; status: string; authorId: number; likes?: number }) => {
    return $fetch('/api/v1/blogs', { method: 'POST', body: data })
  }

  const updateBlog = async (id: number, data: { title?: string; description?: string; content?: string; status?: string; authorId?: number; likes?: number }) => {
    return $fetch(`/api/v1/blogs/${id}`, { method: 'PATCH', body: data })
  }

  const deleteBlog = async (id: number) => {
    return $fetch(`/api/v1/blogs/${id}`, { method: 'DELETE' as any })
  }

  return {
    blogs,
    loading,
    total,
    fetchBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
  }
}
