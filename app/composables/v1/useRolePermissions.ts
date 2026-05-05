interface ApiRolePermission {
  roleId: number
  permissionId: number
}

export function useRolePermissions() {
  const rolePermissions = ref<ApiRolePermission[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchRolePermissions = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiRolePermission[]>('/api/v1/role_permissions', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      rolePermissions.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const createRolePermission = async (data: { roleId: number; permissionId: number }) => {
    return $fetch('/api/v1/role_permissions', { method: 'POST', body: data })
  }

  const deleteRolePermission = async (data: { roleId: number; permissionId: number }) => {
    return $fetch('/api/v1/role_permissions', { method: 'DELETE' as any, body: data })
  }

  return {
    rolePermissions,
    loading,
    total,
    fetchRolePermissions,
    createRolePermission,
    deleteRolePermission,
  }
}
