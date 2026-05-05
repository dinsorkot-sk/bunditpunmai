import type { DashboardStats, DashboardRecent } from '~/shared/types/dashboard'

interface DashboardData {
  stats: DashboardStats
  recent: DashboardRecent
}

export function useDashboard() {
  const stats = ref<DashboardStats | null>(null)
  const recent = ref<DashboardRecent | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async () => {
    try {
      const result = await $fetch<DashboardStats>('/api/v1/dashboard/stats')
      stats.value = result
      return result
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err)
      throw err
    }
  }

  const fetchRecent = async (limit: number = 5) => {
    try {
      const result = await $fetch<DashboardRecent>('/api/v1/dashboard/recent', {
        query: { limit }
      })
      recent.value = result
      return result
    } catch (err: any) {
      console.error('Failed to fetch recent items:', err)
      throw err
    }
  }

  const fetchDashboard = async (recentLimit: number = 5) => {
    loading.value = true
    error.value = null
    try {
      const [statsData, recentData] = await Promise.all([
        fetchStats(),
        fetchRecent(recentLimit)
      ])
      return { stats: statsData, recent: recentData }
    } catch (err: any) {
      error.value = err.message || 'Failed to load dashboard data'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    recent,
    loading,
    error,
    fetchStats,
    fetchRecent,
    fetchDashboard,
  }
}
