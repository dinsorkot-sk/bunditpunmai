import { db } from '@nuxthub/db'
import { resources } from '#server/db/tables/resources'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['resources'],
    summary: 'Get resource by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Resource found' },
      404: { description: 'Resource not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const resourceId = Number(id)

  if (!resourceId || isNaN(resourceId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid resource ID',
    })
  }

  const result = await db.select({
    id: resources.id,
    title: resources.title,
    description: resources.description,
    url: resources.url,
    createdAt: resources.createdAt,
  }).from(resources).where(eq(resources.id, resourceId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found',
    })
  }

  return result[0]
})