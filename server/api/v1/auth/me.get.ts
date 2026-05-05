import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { verify, ACCESS_TOKEN_COOKIE } from '#server/utils/jwt'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Get current user',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User profile' },
      401: { description: 'Unauthorized' },
    },
  },
})

export default defineEventHandler(async (event) => {
  // Get token from cookie or Authorization header
  let token = getCookie(event, ACCESS_TOKEN_COOKIE)

  if (!token) {
    const authHeader = getHeader(event, 'Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  // Verify token
  const payload = await verify(token, 'access')

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }

  // Get user from database
  const user = await db.select().from(users).where(eq(users.id, payload.userId)).get()

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    })
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
  }
})