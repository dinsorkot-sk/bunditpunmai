import { db } from '@nuxthub/db'
import { courseTags } from '#server/db/tables/course_tags'
import type { NewCourseTag } from '#shared/types/entities/course_tag'

defineRouteMeta({
  openAPI: {
    tags: ['course_tags'],
    summary: 'Create a new course_tag',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              courseId: { type: 'integer', minimum: 1 },
              tagId: { type: 'integer', minimum: 1 },
            },
            required: ['courseId', 'tagId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Course_tag created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Course_tag already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewCourseTag

  try {
    const result = await db.insert(courseTags).values({
      courseId: body.courseId,
      tagId: body.tagId,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Course_tag already exists',
    })
  }
})