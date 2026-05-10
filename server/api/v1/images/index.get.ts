import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { imageTranslations } from '#server/db/tables/image_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'List all images',
    description: 'Retrieve a list of all images',
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
        description: 'Locale for translated altText (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Images list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)
  const locale = getLocale(query)

  const baseQuery = db.select({
    id: images.id,
    url: images.url,
    altText: locale ? sql`COALESCE(${imageTranslations.altText}, ${images.altText})` : images.altText,
    createdAt: images.createdAt,
  }).from(images)

  if (locale) {
    baseQuery.leftJoin(imageTranslations, and(
      eq(images.id, imageTranslations.imageId),
      eq(imageTranslations.locale, locale)
    ))
  }

  const result = await baseQuery.limit(limit).offset(offset)

  return result
})