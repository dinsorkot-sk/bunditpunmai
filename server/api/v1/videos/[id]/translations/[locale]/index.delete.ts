import { db } from '@nuxthub/db'
import { videoTranslations } from '#server/db/tables/video_translations'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['video_translations'],
    summary: 'Delete a translation for a video',
    parameters: [
      { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
      { in: 'path', name: 'locale', required: true, schema: { type: 'string' } },
    ],
    responses: { 200: { description: 'Translation deleted' } },
  },
})

export default defineEventHandler(async (event) => {
  await authenticate(event)
  const entityId = Number(getRouterParam(event, 'id'))
  const locale = getRouterParam(event, 'locale')
  if (!entityId || isNaN(entityId) || !locale) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parameters' })
  }
  const [deleted] = await db.delete(videoTranslations)
    .where(and(eq(videoTranslations.videoId, entityId), eq(videoTranslations.locale, locale)))
    .returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Translation not found' })
  }
  return deleted
})
