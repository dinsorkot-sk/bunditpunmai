import { db } from '@nuxthub/db'
import { tags } from '#server/db/tables/tags'
import { tagTranslations } from '#server/db/tables/tag_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['tags'],
    summary: 'Get tag by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'locale',
        schema: { type: 'string' },
        description: 'Locale for translated tag name (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Tag found' },
      404: { description: 'Tag not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const tagId = Number(id)

  if (!tagId || isNaN(tagId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid tag ID',
    })
  }

  const query = getQuery(event)
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

  const result = await baseQuery.where(eq(tags.id, tagId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tag not found',
    })
  }

  return result[0]
})