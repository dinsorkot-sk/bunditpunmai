import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'
import { videoTranslations } from '#server/db/tables/video_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['videos'],
    summary: 'List all videos',
    description: 'Retrieve a list of all videos',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 20 },
      },
      {
        in: 'query',
        name: 'offset',
        schema: { type: 'integer', default: 0 },
      },
      {
        in: 'query',
        name: 'locale',
        schema: { type: 'string' },
        description: 'Locale for translated altText (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Videos list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)
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

  const result = await baseQuery.limit(limit).offset(offset)

  return result
})