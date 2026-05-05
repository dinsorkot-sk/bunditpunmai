import { db } from '@nuxthub/db'
import { tags } from '#server/db/tables/tags'
import { eq } from 'drizzle-orm'
import type { Tag } from '#shared/types/entities/tag'

defineRouteMeta({
  openAPI: {
    tags: ['tags'],
    summary: 'Full update tag',
    description: 'Replace all tag fields',
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
            required: ['name'],
          },
        },
      },
    },
    responses: {
      200: { description: 'Tag updated' },
      400: { description: 'Validation error' },
      404: { description: 'Tag not found' },
      409: { description: 'Tag name already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const tagId = Number(id)
  const body = await readBody(event) as Tag

  // Check if tag exists
  const existing = await db.select().from(tags).where(eq(tags.id, tagId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tag not found',
    })
  }

  try {
    // Update tag
    const result = await db.update(tags).set(body).where(eq(tags.id, tagId)).returning()
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Tag name already exists',
    })
  }
})