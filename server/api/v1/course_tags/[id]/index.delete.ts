import { db } from '@nuxthub/db'
import { courseTags } from '#server/db/tables/course_tags'
import { and, eq } from 'drizzle-orm'
import type { CourseTag } from '#shared/types/entities/course_tag'

defineRouteMeta({
  openAPI: {
    tags: ['course_tags'],
    summary: 'Delete course_tag',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['courseId', 'tagId'],
            properties: {
              courseId: { type: 'integer', minimum: 1 },
              tagId: { type: 'integer', minimum: 1 },
            },
          },
        },
      },
    },
    responses: {
      204: { description: 'Course_tag deleted' },
      404: { description: 'Course_tag not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as CourseTag
  const { courseId, tagId } = body

  if (!courseId || !tagId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'courseId and tagId are required',
    })
  }

  const existing = await db.select().from(courseTags)
    .where(and(
      eq(courseTags.courseId, courseId),
      eq(courseTags.tagId, tagId)
    )).limit(1)

  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Course_tag not found',
    })
  }

  await db.delete(courseTags).where(and(
    eq(courseTags.courseId, courseId),
    eq(courseTags.tagId, tagId)
  ))

  setResponseStatus(event, 204)
  return null
})