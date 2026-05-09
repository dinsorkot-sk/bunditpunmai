/**
 * Guest middleware — redirects authenticated users away from login/auth pages.
 * If the user is already logged in, redirects to /user or /admin based on role.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, fetchUser, user } = useAuth()

  /**
   * Redirect to the appropriate dashboard based on user role.
   */
  function redirectToDashboard() {
    const role = user.value?.role
    if (role === 'user') {
      return navigateTo('/user')
    }
    return navigateTo('/admin')
  }

  // If already authenticated, redirect away
  if (loggedIn.value) {
    return redirectToDashboard()
  }

  // Attempt session restore — user might have a valid cookie
  try {
    await fetchUser()
  } catch {
    // fetchUser already handles errors internally
  }

  // If session restored successfully, redirect
  if (loggedIn.value) {
    return redirectToDashboard()
  }
})
