import { db } from '@nuxthub/db'
import { tagTranslations } from '#server/db/tables/tag_translations'
import { eq, and } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['tag_translations'],
    summary: 'Get a specific translation for a tag',
    parameters: [
      { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
      { in: 'path', name: 'locale', required: true, schema: { type: 'string' } },
    ],
    responses: { 200: { description: 'Translation found' }, 404: { description: 'Not found' } },
  },
})

export default defineEventHandler(async (event) => {
  const entityId = Number(getRouterParam(event, 'id'))
  const locale = getRouterParam(event, 'locale')
  if (!entityId || isNaN(entityId) || !locale) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parameters' })
  }
  const [result] = await db.select().from(tagTranslations).where(
    and(eq(tagTranslations.tagId, entityId), eq(tagTranslations.locale, locale))
  ).limit(1)
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Translation not found' })
  }
  return result
})
