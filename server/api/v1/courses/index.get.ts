import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { courseTranslations } from '#server/db/tables/course_translations'
import { desc, eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'List all courses',
    description: 'Retrieve a list of all courses',
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
        description: 'Locale for translated content (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Courses list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)
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

  const result = await baseQuery.orderBy(desc(courses.createdAt)).limit(limit).offset(offset)

  return result
})