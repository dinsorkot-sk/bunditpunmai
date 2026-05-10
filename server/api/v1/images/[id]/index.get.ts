import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { imageTranslations } from '#server/db/tables/image_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'Get image by ID',
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
        description: 'Locale for translated altText (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Image found' },
      404: { description: 'Image not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const imageId = Number(id)

  if (!imageId || isNaN(imageId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image ID',
    })
  }

  const query = getQuery(event)
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

  const result = await baseQuery.where(eq(images.id, imageId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found',
    })
  }

  return result[0]
})