interface ApiBlogTag {
  blogId: number
  tagId: number
}

export function useBlogTags() {
  const blogTags = ref<ApiBlogTag[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchBlogTags = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiBlogTag[]>('/api/v1/blog_tags', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      blogTags.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const createBlogTag = async (data: { blogId: number; tagId: number }) => {
    return $fetch('/api/v1/blog_tags', { method: 'POST', body: data })
  }

  const deleteBlogTag = async (data: { blogId: number; tagId: number }) => {
    return $fetch('/api/v1/blog_tags', { method: 'DELETE' as any, body: data })
  }

  return {
    blogTags,
    loading,
    total,
    fetchBlogTags,
    createBlogTag,
    deleteBlogTag,
  }
}
