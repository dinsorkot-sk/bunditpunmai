import { db } from '@nuxthub/db'
import { permissions } from '#server/db/tables/permissions'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['permissions'],
    summary: 'Get permission by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Permission found' },
      404: { description: 'Permission not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const permissionId = Number(id)

  if (!permissionId || isNaN(permissionId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid permission ID',
    })
  }

  const result = await db.select({
    id: permissions.id,
    name: permissions.name,
    description: permissions.description,
  }).from(permissions).where(eq(permissions.id, permissionId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Permission not found',
    })
  }

  return result[0]
})