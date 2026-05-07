/**
 * Global auth middleware — protects all /admin/** routes from unauthenticated access.
 * Redirects to /login if the user is not authenticated.
 * Public routes (/, /login, /register, etc.) are not affected.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware for public routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/']
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Also skip non-admin routes (API routes, etc.)
  if (!to.path.startsWith('/admin')) {
    return
  }

  const { loggedIn, fetchUser } = useAuth()

  // Already authenticated, allow access
  if (loggedIn.value) {
    return
  }

  // Attempt session restore from cookie
  // During SSR, useRequestFetch() inside fetchUser forwards original request cookies
  try {
    await fetchUser()
  } catch {
    // fetchUser already handles errors internally
  }

  // Redirect to login if still not authenticated
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
