import { db } from '@nuxthub/db'
import { videoTranslations } from '#server/db/tables/video_translations'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['video_translations'],
    summary: 'Upsert a translation for a video',
    parameters: [
      { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
    ],
    responses: { 200: { description: 'Translation upserted' } },
  },
})

export default defineEventHandler(async (event) => {
  await authenticate(event)
  const entityId = Number(getRouterParam(event, 'id'))
  if (!entityId || isNaN(entityId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }
  const body = await readBody(event)
  const { locale, altText } = body
  if (!locale) {
    throw createError({ statusCode: 400, statusMessage: 'locale is required' })
  }

  const existing = await db.select().from(videoTranslations).where(
    and(eq(videoTranslations.videoId, entityId), eq(videoTranslations.locale, locale))
  ).limit(1)

  if (existing.length > 0) {
    const [updated] = await db.update(videoTranslations)
      .set({ altText })
      .where(eq(videoTranslations.id, existing[0]!.id))
      .returning()
    return updated
  }

  const [created] = await db.insert(videoTranslations).values({
    videoId: entityId,
    locale,
    altText,
  }).returning()
  setResponseStatus(event, 201)
  return created
})
