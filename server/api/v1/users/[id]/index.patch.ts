import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { eq } from 'drizzle-orm'

interface PartialUserForm {
  name?: string
  email?: string
  password?: string
  avatar?: string
}

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    summary: 'Partial update user',
    description: 'Update only provided fields',
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
            },
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
  const body = await readBody(event) as PartialUserForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Update user with partial data (only provided fields)
  const result = await db.update(users).set(updateData).where(eq(users.id, userId)).returning()

  return result[0]
})