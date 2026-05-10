interface ApiCourse {
  id: number
  title: string
  description: string
  content: string
  likes: number
  status: string
  instructorId: number
  createdAt: string
}

export function useCourses() {
  const courses = ref<ApiCourse[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchCourses = async (params: { limit?: number; offset?: number; locale?: string } = {}) => {
    loading.value = true
    try {
      const query: Record<string, any> = { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      if (params.locale) query.locale = params.locale
      const result = await $fetch<ApiCourse[]>('/api/v1/courses', { query })
      courses.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getCourse = async (id: number, locale?: string) => {
    const query = locale ? { locale } : undefined
    return $fetch(`/api/v1/courses/${id}`, { query })
  }

  const createCourse = async (data: { title: string; description: string; content: string; status: string; instructorId: number; likes?: number }) => {
    return $fetch('/api/v1/courses', { method: 'POST', body: data })
  }

  const updateCourse = async (id: number, data: { title?: string; description?: string; content?: string; status?: string; instructorId?: number; likes?: number }) => {
    return $fetch(`/api/v1/courses/${id}`, { method: 'PATCH', body: data })
  }

  const deleteCourse = async (id: number) => {
    return $fetch(`/api/v1/courses/${id}`, { method: 'DELETE' as any })
  }

  return {
    courses,
    loading,
    total,
    fetchCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
  }
}
