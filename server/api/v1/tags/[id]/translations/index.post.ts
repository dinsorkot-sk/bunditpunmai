import { db } from '@nuxthub/db'
import { tagTranslations } from '#server/db/tables/tag_translations'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['tag_translations'],
    summary: 'Upsert a translation for a tag',
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
  const { locale, name } = body
  if (!locale) {
    throw createError({ statusCode: 400, statusMessage: 'locale is required' })
  }

  const existing = await db.select().from(tagTranslations).where(
    and(eq(tagTranslations.tagId, entityId), eq(tagTranslations.locale, locale))
  ).limit(1)

  if (existing.length > 0) {
    const [updated] = await db.update(tagTranslations)
      .set({ name })
      .where(eq(tagTranslations.id, existing[0]!.id))
      .returning()
    return updated
  }

  const [created] = await db.insert(tagTranslations).values({
    tagId: entityId,
    locale,
    name,
  }).returning()
  setResponseStatus(event, 201)
  return created
})
