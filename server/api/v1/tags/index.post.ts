import { db } from '@nuxthub/db'
import { tags } from '#server/db/tables/tags'
import type { NewTag } from '#shared/types/entities/tag'

defineRouteMeta({
  openAPI: {
    tags: ['tags'],
    summary: 'Create a new tag',
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
      201: { description: 'Tag created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Tag name already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewTag

  try {
    const result = await db.insert(tags).values({
      name: body.name,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Tag name already exists',
    })
  }
})