import { db } from '@nuxthub/db'
import { resources } from '#server/db/tables/resources'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['resources'],
    summary: 'Delete resource',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Resource deleted' },
      404: { description: 'Resource not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const resourceId = Number(id)

  const existing = await db.select().from(resources).where(eq(resources.id, resourceId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found',
    })
  }

  await db.delete(resources).where(eq(resources.id, resourceId))

  setResponseStatus(event, 204)
  return null
})