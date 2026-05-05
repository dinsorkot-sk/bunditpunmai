import { db } from '@nuxthub/db'
import { courseResource } from '#server/db/tables/course_resource'
import type { NewCourseResource } from '#shared/types/entities/course_resource'

defineRouteMeta({
  openAPI: {
    tags: ['course_resource'],
    summary: 'Create a new course_resource',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              courseId: { type: 'integer', minimum: 1 },
              resourceId: { type: 'integer', minimum: 1 },
            },
            required: ['courseId', 'resourceId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Course_resource created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Course_resource already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewCourseResource

  try {
    const result = await db.insert(courseResource).values({
      courseId: body.courseId,
      resourceId: body.resourceId,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Course_resource already exists',
    })
  }
})