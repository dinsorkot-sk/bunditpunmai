import { db } from '@nuxthub/db'
import { postTranslations } from '#server/db/tables/post_translations'
import { eq, and } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['post_translations'],
    summary: 'Upsert a translation for a post',
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
  const { locale, title, content } = body
  if (!locale) {
    throw createError({ statusCode: 400, statusMessage: 'locale is required' })
  }

  const existing = await db.select().from(postTranslations).where(
    and(eq(postTranslations.postId, entityId), eq(postTranslations.locale, locale))
  ).limit(1)

  if (existing.length > 0) {
    const [updated] = await db.update(postTranslations)
      .set({ title, content })
      .where(eq(postTranslations.id, existing[0]!.id))
      .returning()
    return updated
  }

  const [created] = await db.insert(postTranslations).values({
    postId: entityId,
    locale,
    title,
    content,
  }).returning()
  setResponseStatus(event, 201)
  return created
})
