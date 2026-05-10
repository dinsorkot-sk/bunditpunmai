import { db } from '@nuxthub/db'
import { imageTranslations } from '#server/db/tables/image_translations'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['image_translations'],
    summary: 'List all translations for an image',
    parameters: [
      { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
    ],
    responses: { 200: { description: 'Translations list' } },
  },
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }
  return await db.select().from(imageTranslations).where(eq(imageTranslations.imageId, id))
})
