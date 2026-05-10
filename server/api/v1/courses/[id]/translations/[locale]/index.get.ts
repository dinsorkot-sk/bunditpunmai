import { db } from '@nuxthub/db'
import { courseTranslations } from '#server/db/tables/course_translations'
import { eq, and } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['course_translations'],
    summary: 'Get a specific translation for a course',
    parameters: [
      { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
      { in: 'path', name: 'locale', required: true, schema: { type: 'string' } },
    ],
    responses: { 200: { description: 'Translation found' }, 404: { description: 'Not found' } },
  },
})

export default defineEventHandler(async (event) => {
  const entityId = Number(getRouterParam(event, 'id'))
  const locale = getRouterParam(event, 'locale')
  if (!entityId || isNaN(entityId) || !locale) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parameters' })
  }
  const [result] = await db.select().from(courseTranslations).where(
    and(eq(courseTranslations.courseId, entityId), eq(courseTranslations.locale, locale))
  ).limit(1)
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Translation not found' })
  }
  return result
})
