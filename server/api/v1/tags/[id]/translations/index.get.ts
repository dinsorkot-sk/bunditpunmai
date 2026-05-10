import { db } from '@nuxthub/db'
import { tagTranslations } from '#server/db/tables/tag_translations'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['tag_translations'],
    summary: 'List all translations for a tag',
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
  return await db.select().from(tagTranslations).where(eq(tagTranslations.tagId, id))
})
