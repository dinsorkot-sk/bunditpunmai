import { db } from '@nuxthub/db'
import { tagTranslations } from '#server/db/tables/tag_translations'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['tag_translations'],
    summary: 'Delete a translation for a tag',
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
  const [deleted] = await db.delete(tagTranslations)
    .where(and(eq(tagTranslations.tagId, entityId), eq(tagTranslations.locale, locale)))
    .returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Translation not found' })
  }
  return deleted
})
