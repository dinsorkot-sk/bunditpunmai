import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['videos'],
    summary: 'Get video by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Video found' },
      404: { description: 'Video not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const videoId = Number(id)

  if (!videoId || isNaN(videoId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid video ID',
    })
  }

  const result = await db.select({
    id: videos.id,
    url: videos.url,
    altText: videos.altText,
    createdAt: videos.createdAt,
  }).from(videos).where(eq(videos.id, videoId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Video not found',
    })
  }

  return result[0]
})