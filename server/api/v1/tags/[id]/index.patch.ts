import { db } from '@nuxthub/db'
import { tags } from '#server/db/tables/tags'
import { eq } from 'drizzle-orm'

interface PartialTagForm {
  name?: string
}

defineRouteMeta({
  openAPI: {
    tags: ['tags'],
    summary: 'Partial update tag',
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
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Tag updated' },
      400: { description: 'Validation error' },
      404: { description: 'Tag not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const tagId = Number(id)
  const body = await readBody(event) as PartialTagForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if tag exists
  const existing = await db.select().from(tags).where(eq(tags.id, tagId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tag not found',
    })
  }

  try {
    // Update tag with partial data (only provided fields)
    const result = await db.update(tags).set(updateData).where(eq(tags.id, tagId)).returning()
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Tag name already exists',
    })
  }
})