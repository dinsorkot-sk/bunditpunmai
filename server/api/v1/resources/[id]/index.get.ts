import { db } from '@nuxthub/db'
import { resources } from '#server/db/tables/resources'
import { resourceTranslations } from '#server/db/tables/resource_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['resources'],
    summary: 'Get resource by ID',
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
        description: 'Locale for translated content (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Resource found' },
      404: { description: 'Resource not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const resourceId = Number(id)

  if (!resourceId || isNaN(resourceId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid resource ID',
    })
  }

  const query = getQuery(event)
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

  const result = await baseQuery.where(eq(resources.id, resourceId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found',
    })
  }

  return result[0]
})