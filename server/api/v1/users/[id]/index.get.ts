import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    summary: 'Get user by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'User found' },
      404: { description: 'User not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const userId = Number(id)

  if (!userId || isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user ID',
    })
  }

  const result = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatar: users.avatar,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, userId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  return result[0]
})