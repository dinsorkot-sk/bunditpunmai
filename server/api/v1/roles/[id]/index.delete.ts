import { db } from '@nuxthub/db'
import { roles } from '#server/db/tables/roles'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['roles'],
    summary: 'Delete role',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Role deleted' },
      404: { description: 'Role not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const roleId = Number(id)

  const existing = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  await db.delete(roles).where(eq(roles.id, roleId))

  setResponseStatus(event, 204)
  return null
})