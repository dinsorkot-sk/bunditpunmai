import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { eq } from 'drizzle-orm'

interface PartialImageForm {
  url?: string
  altText?: string
}

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'Partial update image',
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
              url: { type: 'string' },
              altText: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Image updated' },
      400: { description: 'Validation error' },
      404: { description: 'Image not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const imageId = Number(id)
  const body = await readBody(event) as PartialImageForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if image exists
  const existing = await db.select().from(images).where(eq(images.id, imageId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found',
    })
  }

  // Update image with partial data (only provided fields)
  const result = await db.update(images).set(updateData).where(eq(images.id, imageId)).returning()

  return result[0]
})