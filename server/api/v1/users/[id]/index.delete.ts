import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    summary: 'Delete user',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'User deleted' },
      404: { description: 'User not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const userId = Number(id)

  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  await db.delete(users).where(eq(users.id, userId))

  setResponseStatus(event, 204)
  return null
})