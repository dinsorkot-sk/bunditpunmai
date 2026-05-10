import { db } from '@nuxthub/db'
import { resources } from '#server/db/tables/resources'
import { resourceTranslations } from '#server/db/tables/resource_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['resources'],
    summary: 'List all resources',
    description: 'Retrieve a list of all resources',
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
        description: 'Locale for translated content (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Resources list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)
  const locale = getLocale(query)

  const baseQuery = db.select({
    id: resources.id,
    title: locale ? sql`COALESCE(${resourceTranslations.title}, ${resources.title})` : resources.title,
    description: locale ? sql`COALESCE(${resourceTranslations.description}, ${resources.description})` : resources.description,
    url: resources.url,
    createdAt: resources.createdAt,
  }).from(resources)

  if (locale) {
    baseQuery.leftJoin(resourceTranslations, and(
      eq(resources.id, resourceTranslations.resourceId),
      eq(resourceTranslations.locale, locale)
    ))
  }

  const result = await baseQuery.limit(limit).offset(offset)

  return result
})