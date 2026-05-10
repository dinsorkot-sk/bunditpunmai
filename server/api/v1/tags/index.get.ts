import { db } from '@nuxthub/db'
import { tags } from '#server/db/tables/tags'
import { tagTranslations } from '#server/db/tables/tag_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['tags'],
    summary: 'List all tags',
    description: 'Retrieve a list of all tags',
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
        description: 'Locale for translated tag name (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Tags list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)
  const locale = getLocale(query)

  const baseQuery = db.select({
    id: tags.id,
    name: locale ? sql`COALESCE(${tagTranslations.name}, ${tags.name})` : tags.name,
  }).from(tags)

  if (locale) {
    baseQuery.leftJoin(tagTranslations, and(
      eq(tags.id, tagTranslations.tagId),
      eq(tagTranslations.locale, locale)
    ))
  }

  const result = await baseQuery.limit(limit).offset(offset)

  return result
})