import { db } from '@nuxthub/db'
import { userRoles } from '#server/db/tables/user_roles'
import { and, eq } from 'drizzle-orm'
import type { UserRole } from '#shared/types/entities/user_role'

defineRouteMeta({
  openAPI: {
    tags: ['user_roles'],
    summary: 'Delete user_role',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['userId', 'roleId'],
            properties: {
              userId: { type: 'integer', minimum: 1 },
              roleId: { type: 'integer', minimum: 1 },
            },
          },
        },
      },
    },
    responses: {
      204: { description: 'User_role deleted' },
      404: { description: 'User_role not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as UserRole
  const { userId, roleId } = body

  if (!userId || !roleId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId and roleId are required',
    })
  }

  const existing = await db.select().from(userRoles)
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.roleId, roleId)
    )).limit(1)

  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User_role not found',
    })
  }

  await db.delete(userRoles).where(and(
    eq(userRoles.userId, userId),
    eq(userRoles.roleId, roleId)
  ))

  setResponseStatus(event, 204)
  return null
})