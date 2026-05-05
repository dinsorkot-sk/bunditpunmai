import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'Get image by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Image found' },
      404: { description: 'Image not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const imageId = Number(id)

  if (!imageId || isNaN(imageId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image ID',
    })
  }

  const result = await db.select({
    id: images.id,
    url: images.url,
    altText: images.altText,
    createdAt: images.createdAt,
  }).from(images).where(eq(images.id, imageId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found',
    })
  }

  return result[0]
})