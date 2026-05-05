import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'Delete image',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Image deleted' },
      404: { description: 'Image not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const imageId = Number(id)

  const existing = await db.select().from(images).where(eq(images.id, imageId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found',
    })
  }

  await db.delete(images).where(eq(images.id, imageId))

  setResponseStatus(event, 204)
  return null
})