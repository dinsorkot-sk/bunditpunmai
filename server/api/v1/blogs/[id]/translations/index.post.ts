import { db } from '@nuxthub/db'
import { blogTranslations } from '#server/db/tables/blog_translations'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['blog_translations'],
    summary: 'Upsert a translation for a blog',
    parameters: [
      { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
    ],
    responses: { 200: { description: 'Translation upserted' } },
  },
})

export default defineEventHandler(async (event) => {
  await authenticate(event)
  const entityId = Number(getRouterParam(event, 'id'))
  if (!entityId || isNaN(entityId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }
  const body = await readBody(event)
  const { locale, title, description, content } = body
  if (!locale) {
    throw createError({ statusCode: 400, statusMessage: 'locale is required' })
  }

  const existing = await db.select().from(blogTranslations).where(
    and(eq(blogTranslations.blogId, entityId), eq(blogTranslations.locale, locale))
  ).limit(1)

  if (existing.length > 0) {
    const [updated] = await db.update(blogTranslations)
      .set({ title, description, content })
      .where(eq(blogTranslations.id, existing[0]!.id))
      .returning()
    return updated
  }

  const [created] = await db.insert(blogTranslations).values({
    blogId: entityId,
    locale,
    title,
    description,
    content,
  }).returning()
  setResponseStatus(event, 201)
  return created
})
