interface ApiBlog {
  id: number
  title: string
  description: string
  content: string
  image?: string
  likes: number
  status: string
  authorId: number
  createdAt: string
}

export function useBlogs() {
  const blogs = ref<ApiBlog[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchBlogs = async (params: { limit?: number; offset?: number; status?: string; authorId?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiBlog[]>('/api/v1/blogs', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0, ...(params.status ? { status: params.status } : {}), ...(params.authorId ? { authorId: params.authorId } : {}) }
      })
      blogs.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getBlog = async (id: number) => {
    return $fetch(`/api/v1/blogs/${id}`)
  }

  const createBlog = async (data: { title: string; description: string; content: string; status: string; authorId: number; image?: string; likes?: number }) => {
    return $fetch('/api/v1/blogs', { method: 'POST', body: data })
  }

  const updateBlog = async (id: number, data: { title?: string; description?: string; content?: string; status?: string; authorId?: number; image?: string; likes?: number }) => {
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
