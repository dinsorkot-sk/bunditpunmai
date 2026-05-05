interface ApiCourseResource {
  id: number
  courseId: number
  resourceId: number
}

export function useCourseResources() {
  const courseResources = ref<ApiCourseResource[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchCourseResources = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiCourseResource[]>('/api/v1/course_resource', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      courseResources.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const createCourseResource = async (data: { courseId: number; resourceId: number }) => {
    return $fetch('/api/v1/course_resource', { method: 'POST', body: data })
  }

  const deleteCourseResource = async (data: { courseId: number; resourceId: number }) => {
    return $fetch('/api/v1/course_resource', { method: 'DELETE' as any, body: data })
  }

  return {
    courseResources,
    loading,
    total,
    fetchCourseResources,
    createCourseResource,
    deleteCourseResource,
  }
}
