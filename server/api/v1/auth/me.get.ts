import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { authenticate, getUserRole } from '#server/utils/auth'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Get current user profile',
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User profile' },
      401: { description: 'Unauthorized' },
    },
  },
})

export default defineEventHandler(async (event) => {
  // Authenticate and get JWT payload
  const payload = await authenticate(event)

  // Get user from database
  const user = await db.select().from(users).where(eq(users.id, payload.userId)).get()

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    })
  }

  // Fetch user's primary role
  const role = await getUserRole(user.id)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role,
    createdAt: user.createdAt.toISOString(),
  }
})
