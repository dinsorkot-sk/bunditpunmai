import { db } from '@nuxthub/db'
import { resourceTranslations } from '#server/db/tables/resource_translations'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['resource_translations'],
    summary: 'Upsert a translation for a resource',
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
  const { locale, title, description } = body
  if (!locale) {
    throw createError({ statusCode: 400, statusMessage: 'locale is required' })
  }

  const existing = await db.select().from(resourceTranslations).where(
    and(eq(resourceTranslations.resourceId, entityId), eq(resourceTranslations.locale, locale))
  ).limit(1)

  if (existing.length > 0) {
    const [updated] = await db.update(resourceTranslations)
      .set({ title, description })
      .where(eq(resourceTranslations.id, existing[0]!.id))
      .returning()
    return updated
  }

  const [created] = await db.insert(resourceTranslations).values({
    resourceId: entityId,
    locale,
    title,
    description,
  }).returning()
  setResponseStatus(event, 201)
  return created
})
