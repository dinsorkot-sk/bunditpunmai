/**
 * Guest middleware — redirects authenticated users away from login/auth pages.
 * If the user is already logged in, redirects to /admin.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, fetchUser } = useAuth()

  // If already authenticated, redirect away
  if (loggedIn.value) {
    return navigateTo('/admin')
  }

  // Attempt session restore — user might have a valid cookie
  try {
    await fetchUser()
  } catch {
    // fetchUser already handles errors internally
  }

  // If session restored successfully, redirect
  if (loggedIn.value) {
    return navigateTo('/admin')
  }
})
