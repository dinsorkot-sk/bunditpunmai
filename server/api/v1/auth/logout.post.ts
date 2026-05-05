import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from '#server/utils/jwt'

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Logout user',
    responses: {
      200: { description: 'Logout successful' },
    },
  },
})

export default defineEventHandler(async (event) => {
  // Clear cookies
  setCookie(event, ACCESS_TOKEN_COOKIE, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  })

  setCookie(event, REFRESH_TOKEN_COOKIE, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  })

  return {
    message: 'Logged out successfully',
  }
})