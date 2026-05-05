interface ApiComment {
  id: number
  content: string
  status: string
  postId: number
  authorId: number
  createdAt: string
}

export function useComments() {
  const comments = ref<ApiComment[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchComments = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiComment[]>('/api/v1/comments', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      comments.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getComment = async (id: number) => {
    return $fetch(`/api/v1/comments/${id}`)
  }

  const createComment = async (data: { content: string; status: string; postId: number; authorId: number }) => {
    return $fetch('/api/v1/comments', { method: 'POST', body: data })
  }

  const updateComment = async (id: number, data: { content?: string; status?: string; postId?: number; authorId?: number }) => {
    return $fetch(`/api/v1/comments/${id}`, { method: 'PATCH', body: data })
  }

  const deleteComment = async (id: number) => {
    return $fetch(`/api/v1/comments/${id}`, { method: 'DELETE' as any })
  }

  return {
    comments,
    loading,
    total,
    fetchComments,
    getComment,
    createComment,
    updateComment,
    deleteComment,
  }
}
