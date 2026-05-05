import { db } from '@nuxthub/db'
import { roles } from '#server/db/tables/roles'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['roles'],
    summary: 'Get role by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Role found' },
      404: { description: 'Role not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const roleId = Number(id)

  if (!roleId || isNaN(roleId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid role ID',
    })
  }

  const result = await db.select({
    id: roles.id,
    name: roles.name,
    createdAt: roles.createdAt,
  }).from(roles).where(eq(roles.id, roleId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  return result[0]
})