interface ApiUserRole {
  userId: number
  roleId: number
}

export function useUserRoles() {
  const userRoles = ref<ApiUserRole[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchUserRoles = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiUserRole[]>('/api/v1/user_roles', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      userRoles.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const createUserRole = async (data: { userId: number; roleId: number }) => {
    return $fetch('/api/v1/user_roles', { method: 'POST', body: data })
  }

  const deleteUserRole = async (data: { userId: number; roleId: number }) => {
    return $fetch('/api/v1/user_roles', { method: 'DELETE' as any, body: data })
  }

  return {
    userRoles,
    loading,
    total,
    fetchUserRoles,
    createUserRole,
    deleteUserRole,
  }
}
