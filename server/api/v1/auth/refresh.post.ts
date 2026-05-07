import { sign, verify, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from '#server/utils/jwt'
import { validate } from '#server/utils/validation'
import { z } from 'zod'

const RefreshSchema = z.object({
  refreshToken: z.string({ message: 'Refresh token is required' }).min(1, 'Refresh token cannot be empty'),
})

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Refresh access token',
    requestBody: {
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              refreshToken: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Token refreshed' },
      400: { description: 'Validation error' },
      401: { description: 'Invalid refresh token' },
    },
  },
})

export default defineEventHandler(async (event) => {
  // Get refresh token from cookie or body
  let refreshToken = getCookie(event, REFRESH_TOKEN_COOKIE)

  if (!refreshToken) {
    const body = await readBody(event).catch(() => ({}))
    const parsed = RefreshSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Refresh token required',
      })
    }

    refreshToken = parsed.data.refreshToken
  }

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh token required',
    })
  }

  // Verify refresh token
  const payload = await verify(refreshToken, 'refresh')

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired refresh token',
    })
  }

  // Generate new access token
  const newAccessToken = await sign({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  }, 'access')

  // Update cookie
  setCookie(event, ACCESS_TOKEN_COOKIE, newAccessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15, // 15 minutes
  })

  return {
    accessToken: newAccessToken,
  }
})
