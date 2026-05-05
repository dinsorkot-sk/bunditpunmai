interface ApiRole {
  id: number
  name: string
  createdAt: string
}

export function useRoles() {
  const roles = ref<ApiRole[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchRoles = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiRole[]>('/api/v1/roles', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      roles.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getRole = async (id: number) => {
    return $fetch(`/api/v1/roles/${id}`)
  }

  const createRole = async (data: { name: string }) => {
    return $fetch('/api/v1/roles', { method: 'POST', body: data })
  }

  const updateRole = async (id: number, data: { name?: string }) => {
    return $fetch(`/api/v1/roles/${id}`, { method: 'PATCH', body: data })
  }

  const deleteRole = async (id: number) => {
    return $fetch(`/api/v1/roles/${id}`, { method: 'DELETE' as any })
  }

  return {
    roles,
    loading,
    total,
    fetchRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
  }
}
