import { db } from '@nuxthub/db'
import { courseResource } from '#server/db/tables/course_resource'
import { and, eq } from 'drizzle-orm'
import type { CourseResource } from '#shared/types/entities/course_resource'

defineRouteMeta({
  openAPI: {
    tags: ['course_resource'],
    summary: 'Delete course_resource',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['courseId', 'resourceId'],
            properties: {
              courseId: { type: 'integer', minimum: 1 },
              resourceId: { type: 'integer', minimum: 1 },
            },
          },
        },
      },
    },
    responses: {
      204: { description: 'Course_resource deleted' },
      404: { description: 'Course_resource not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as CourseResource
  const { courseId, resourceId } = body

  if (!courseId || !resourceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'courseId and resourceId are required',
    })
  }

  const existing = await db.select().from(courseResource)
    .where(and(
      eq(courseResource.courseId, courseId),
      eq(courseResource.resourceId, resourceId)
    )).limit(1)

  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Course_resource not found',
    })
  }

  await db.delete(courseResource).where(and(
    eq(courseResource.courseId, courseId),
    eq(courseResource.resourceId, resourceId)
  ))

  setResponseStatus(event, 204)
  return null
})