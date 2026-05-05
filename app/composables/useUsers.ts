import type { User, NewUser } from '#shared/types/entities'

export interface ApiUser {
  id: number
  name: string
  email: string
  avatar: string
  createdAt: string
}

export function useUsers() {
  const users = ref<ApiUser[]>([])
  const loading = ref(false)
  const total = ref(0)

  const fetchUsers = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    try {
      const result = await $fetch<ApiUser[]>('/api/v1/users', {
        query: { limit: params.limit ?? 20, offset: params.offset ?? 0 }
      })
      users.value = result
      total.value = result.length
    }
    finally {
      loading.value = false
    }
  }

  const getUser = async (id: number) => {
    return $fetch(`/api/v1/users/${id}`)
  }

  const createUser = async (data: NewUser) => {
    return $fetch('/api/v1/users', { method: 'POST', body: data })
  }

  const updateUser = async (id: number, data: Partial<User>) => {
    return $fetch(`/api/v1/users/${id}`, { method: 'PATCH', body: data })
  }

  const deleteUser = async (id: number) => {
    return $fetch(`/api/v1/users/${id}`, { method: 'DELETE' as any })
  }

  return {
    users,
    loading,
    total,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  }
}
