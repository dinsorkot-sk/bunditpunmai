import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'
import { eq } from 'drizzle-orm'

interface PartialVideoForm {
  url?: string
  altText?: string
}

defineRouteMeta({
  openAPI: {
    tags: ['videos'],
    summary: 'Partial update video',
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
      200: { description: 'Video updated' },
      400: { description: 'Validation error' },
      404: { description: 'Video not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const videoId = Number(id)
  const body = await readBody(event) as PartialVideoForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if video exists
  const existing = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Video not found',
    })
  }

  // Update video with partial data (only provided fields)
  const result = await db.update(videos).set(updateData).where(eq(videos.id, videoId)).returning()

  return result[0]
})