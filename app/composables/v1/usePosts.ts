interface ApiPost {
  id: number
  title: string
  content: string
  likes: number
  status: string
  authorId: number
  createdAt: string
}

export function usePosts() {
  const posts = ref<ApiPost[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchPosts = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiPost[]>('/api/v1/posts', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      posts.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getPost = async (id: number) => {
    return $fetch(`/api/v1/posts/${id}`)
  }

  const createPost = async (data: { title: string; content: string; status: string; authorId: number; likes?: number }) => {
    return $fetch('/api/v1/posts', { method: 'POST', body: data })
  }

  const updatePost = async (id: number, data: { title?: string; content?: string; status?: string; authorId?: number; likes?: number }) => {
    return $fetch(`/api/v1/posts/${id}`, { method: 'PATCH', body: data })
  }

  const deletePost = async (id: number) => {
    return $fetch(`/api/v1/posts/${id}`, { method: 'DELETE' as any })
  }

  return {
    posts,
    loading,
    total,
    fetchPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
  }
}
