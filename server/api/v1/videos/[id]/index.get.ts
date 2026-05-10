import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'
import { videoTranslations } from '#server/db/tables/video_translations'
import { eq, and, sql } from 'drizzle-orm'

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
      {
        in: 'query',
        name: 'locale',
        schema: { type: 'string' },
        description: 'Locale for translated altText (e.g. "en")',
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

  const query = getQuery(event)
  const locale = getLocale(query)

  const baseQuery = db.select({
    id: videos.id,
    url: videos.url,
    altText: locale ? sql`COALESCE(${videoTranslations.altText}, ${videos.altText})` : videos.altText,
    createdAt: videos.createdAt,
  }).from(videos)

  if (locale) {
    baseQuery.leftJoin(videoTranslations, and(
      eq(videos.id, videoTranslations.videoId),
      eq(videoTranslations.locale, locale)
    ))
  }

  const result = await baseQuery.where(eq(videos.id, videoId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Video not found',
    })
  }

  return result[0]
})