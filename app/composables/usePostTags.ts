interface ApiPostTag {
  postId: number
  tagId: number
}

export function usePostTags() {
  const postTags = ref<ApiPostTag[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchPostTags = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiPostTag[]>('/api/v1/post_tags', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      postTags.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const createPostTag = async (data: { postId: number; tagId: number }) => {
    return $fetch('/api/v1/post_tags', { method: 'POST', body: data })
  }

  const deletePostTag = async (data: { postId: number; tagId: number }) => {
    return $fetch('/api/v1/post_tags', { method: 'DELETE' as any, body: data })
  }

  return {
    postTags,
    loading,
    total,
    fetchPostTags,
    createPostTag,
    deletePostTag,
  }
}
