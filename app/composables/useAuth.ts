import type { PublicUser } from '#shared/types/entities'
import type { FetchError } from 'ofetch'

export interface AuthState {
  user: PublicUser | null
  loading: boolean
}

export interface LoginResponse {
  user: PublicUser
  accessToken: string
  refreshToken: string
}

export interface RegisterResponse {
  user: PublicUser
  accessToken: string
  refreshToken: string
}

export function useAuth() {
  const user = useState<PublicUser | null>('auth:user', () => null)
  const loading = useState<boolean>('auth:loading', () => false)

  const loggedIn = computed(() => user.value !== null)

  /**
   * Login with email and password.
   * On success, stores the user in reactive state.
   * Returns the login response.
   */
  async function login(email: string, password: string): Promise<LoginResponse> {
    loading.value = true
    try {
      const data = await $fetch<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      user.value = data.user
      return data
    } catch (err) {
      user.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a new user.
   * On success, stores the user in reactive state.
   * Returns the register response.
   */
  async function register(
    name: string,
    email: string,
    password: string,
    avatar?: string
  ): Promise<RegisterResponse> {
    loading.value = true
    try {
      const data = await $fetch<RegisterResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: { name, email, password, avatar },
      })
      user.value = data.user
      return data
    } catch (err) {
      user.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout the current user.
   * Clears the user state and calls the logout API.
   */
  async function logout(): Promise<void> {
    loading.value = true
    try {
      await $fetch('/api/v1/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      loading.value = false
    }
  }

  /**
   * Fetch the current user's profile (session restore).
   * Typically called on app initialization, page mount, or in middleware.
   * Uses useRequestFetch() on server-side to forward original request cookies for SSR.
   */
  async function fetchUser(): Promise<PublicUser | null> {
    try {
      const fetcher = useRequestFetch()
      const data = await fetcher<PublicUser>('/api/v1/auth/me')
      user.value = data
      return data
    } catch {
      user.value = null
      return null
    }
  }

  /**
   * Clear the current user state without calling the API.
   */
  function clearUser(): void {
    user.value = null
  }

  /**
   * Initialize auth by attempting to restore the session.
   * Call this once in app.vue or a layout to auto-login returning users.
   */
  async function initAuth(): Promise<PublicUser | null> {
    return fetchUser()
  }

  return {
    // State
    user,
    loading,

    // Computed
    loggedIn,

    // Methods
    login,
    register,
    logout,
    fetchUser,
    clearUser,
    initAuth,
  }
}
