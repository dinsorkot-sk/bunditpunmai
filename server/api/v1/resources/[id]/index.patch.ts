import { db } from '@nuxthub/db'
import { resources } from '#server/db/tables/resources'
import { eq } from 'drizzle-orm'

interface PartialResourceForm {
  title?: string
  description?: string
  url?: string
}

defineRouteMeta({
  openAPI: {
    tags: ['resources'],
    summary: 'Partial update resource',
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
              title: { type: 'string' },
              description: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Resource updated' },
      400: { description: 'Validation error' },
      404: { description: 'Resource not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const resourceId = Number(id)
  const body = await readBody(event) as PartialResourceForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if resource exists
  const existing = await db.select().from(resources).where(eq(resources.id, resourceId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found',
    })
  }

  // Update resource with partial data (only provided fields)
  const result = await db.update(resources).set(updateData).where(eq(resources.id, resourceId)).returning()

  return result[0]
})