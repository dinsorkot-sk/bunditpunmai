interface ApiCourse {
  id: number
  title: string
  description: string
  content: string
  image?: string
  likes: number
  status: string
  instructorId: number
  createdAt: string
}

export function useCourses() {
  const courses = ref<ApiCourse[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchCourses = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiCourse[]>('/api/v1/courses', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      courses.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getCourse = async (id: number) => {
    return $fetch(`/api/v1/courses/${id}`)
  }

  const createCourse = async (data: { title: string; description: string; content: string; status: string; instructorId: number; image?: string; likes?: number }) => {
    return $fetch('/api/v1/courses', { method: 'POST', body: data })
  }

  const updateCourse = async (id: number, data: { title?: string; description?: string; content?: string; status?: string; instructorId?: number; image?: string; likes?: number }) => {
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
