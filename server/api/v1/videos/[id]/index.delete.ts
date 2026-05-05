import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['videos'],
    summary: 'Delete video',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Video deleted' },
      404: { description: 'Video not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const videoId = Number(id)

  const existing = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Video not found',
    })
  }

  await db.delete(videos).where(eq(videos.id, videoId))

  setResponseStatus(event, 204)
  return null
})