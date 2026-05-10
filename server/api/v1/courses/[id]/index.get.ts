import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { courseTranslations } from '#server/db/tables/course_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'Get course by ID',
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
      200: { description: 'Course found' },
      404: { description: 'Course not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const courseId = Number(id)

  if (!courseId || isNaN(courseId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid course ID',
    })
  }

  const query = getQuery(event)
  const locale = getLocale(query)

  const baseQuery = db.select({
    id: courses.id,
    title: locale ? sql`COALESCE(${courseTranslations.title}, ${courses.title})` : courses.title,
    description: locale ? sql`COALESCE(${courseTranslations.description}, ${courses.description})` : courses.description,
    content: locale ? sql`COALESCE(${courseTranslations.content}, ${courses.content})` : courses.content,
    likes: courses.likes,
    status: courses.status,
    instructorId: courses.instructorId,
    createdAt: courses.createdAt,
  }).from(courses)

  if (locale) {
    baseQuery.leftJoin(courseTranslations, and(
      eq(courses.id, courseTranslations.courseId),
      eq(courseTranslations.locale, locale)
    ))
  }

  const result = await baseQuery.where(eq(courses.id, courseId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Course not found',
    })
  }

  return result[0]
})