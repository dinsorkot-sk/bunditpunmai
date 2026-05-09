/**
 * Global auth middleware — protects all /admin/** and /user/** routes.
 * Redirects to /login if the user is not authenticated or lacks proper role.
 * Public routes (/, /login, /register, etc.) are not affected.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware for public routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/']
  if (publicRoutes.includes(to.path)) {
    return
  }

  const isAdminRoute = to.path.startsWith('/admin')
  const isUserRoute = to.path.startsWith('/user')

  // Skip non-protected routes
  if (!isAdminRoute && !isUserRoute) {
    return
  }

  const { loggedIn, fetchUser, user } = useAuth()

  // Attempt session restore if not authenticated
  if (!loggedIn.value) {
    try {
      await fetchUser()
    } catch {
      // fetchUser already handles errors internally
    }
  }

  // Not authenticated → redirect to login
  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  // Role-based access control
  const role = user.value?.role

  if (isAdminRoute && !['admin', 'editor'].includes(role || '')) {
    return navigateTo('/login')
  }

  if (isUserRoute && role !== 'user') {
    return navigateTo('/login')
  }
})
