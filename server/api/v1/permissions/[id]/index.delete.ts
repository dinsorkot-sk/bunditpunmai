import { db } from '@nuxthub/db'
import { permissions } from '#server/db/tables/permissions'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['permissions'],
    summary: 'Delete permission',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Permission deleted' },
      404: { description: 'Permission not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const permissionId = Number(id)

  const existing = await db.select().from(permissions).where(eq(permissions.id, permissionId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Permission not found',
    })
  }

  await db.delete(permissions).where(eq(permissions.id, permissionId))

  setResponseStatus(event, 204)
  return null
})