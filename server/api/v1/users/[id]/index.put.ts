import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { eq } from 'drizzle-orm'
import type { User } from '#shared/types/entities/user'

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    summary: 'Full update user',
    description: 'Replace all user fields',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              password: { type: 'string' },
              avatar: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['name', 'email', 'password', 'avatar', 'createdAt'],
          },
        },
      },
    },
    responses: {
      200: { description: 'User updated' },
      400: { description: 'Validation error' },
      404: { description: 'User not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const userId = Number(id)
  const body = await readBody(event) as User

  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Update user
  const result = await db.update(users).set(body).where(eq(users.id, userId)).returning()

  return result[0]
})