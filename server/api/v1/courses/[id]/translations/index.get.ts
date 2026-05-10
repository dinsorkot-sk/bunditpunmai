import { db } from '@nuxthub/db'
import { courseTranslations } from '#server/db/tables/course_translations'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['course_translations'],
    summary: 'List all translations for a course',
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
  return await db.select().from(courseTranslations).where(eq(courseTranslations.courseId, id))
})
