interface ApiPermission {
  id: number
  name: string
  description: string | null
}

export function usePermissions() {
  const permissions = ref<ApiPermission[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchPermissions = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiPermission[]>('/api/v1/permissions', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      permissions.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getPermission = async (id: number) => {
    return $fetch(`/api/v1/permissions/${id}`)
  }

  const createPermission = async (data: { name: string; description?: string }) => {
    return $fetch('/api/v1/permissions', { method: 'POST', body: data })
  }

  const updatePermission = async (id: number, data: { name?: string; description?: string }) => {
    return $fetch(`/api/v1/permissions/${id}`, { method: 'PATCH', body: data })
  }

  const deletePermission = async (id: number) => {
    return $fetch(`/api/v1/permissions/${id}`, { method: 'DELETE' as any })
  }

  return {
    permissions,
    loading,
    total,
    fetchPermissions,
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
  }
}
