import { db } from '@nuxthub/db'
import { resourceTranslations } from '#server/db/tables/resource_translations'
import { eq, and } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['resource_translations'],
    summary: 'Get a specific translation for a resource',
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
  const [result] = await db.select().from(resourceTranslations).where(
    and(eq(resourceTranslations.resourceId, entityId), eq(resourceTranslations.locale, locale))
  ).limit(1)
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Translation not found' })
  }
  return result
})
