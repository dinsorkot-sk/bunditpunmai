interface ApiCourseTag {
  courseId: number
  tagId: number
}

export function useCourseTags() {
  const courseTags = ref<ApiCourseTag[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchCourseTags = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiCourseTag[]>('/api/v1/course_tags', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      courseTags.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const createCourseTag = async (data: { courseId: number; tagId: number }) => {
    return $fetch('/api/v1/course_tags', { method: 'POST', body: data })
  }

  const deleteCourseTag = async (data: { courseId: number; tagId: number }) => {
    return $fetch('/api/v1/course_tags', { method: 'DELETE' as any, body: data })
  }

  return {
    courseTags,
    loading,
    total,
    fetchCourseTags,
    createCourseTag,
    deleteCourseTag,
  }
}
