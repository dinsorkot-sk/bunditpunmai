import { db } from '@nuxthub/db'
import { blogTranslations } from '#server/db/tables/blog_translations'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['blog_translations'],
    summary: 'Delete a translation for a blog',
    parameters: [
      { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
      { in: 'path', name: 'locale', required: true, schema: { type: 'string' } },
    ],
    responses: { 200: { description: 'Translation deleted' } },
  },
})

export default defineEventHandler(async (event) => {
  await authenticate(event)
  const entityId = Number(getRouterParam(event, 'id'))
  const locale = getRouterParam(event, 'locale')
  if (!entityId || isNaN(entityId) || !locale) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parameters' })
  }
  const [deleted] = await db.delete(blogTranslations)
    .where(and(eq(blogTranslations.blogId, entityId), eq(blogTranslations.locale, locale)))
    .returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Translation not found' })
  }
  return deleted
})
