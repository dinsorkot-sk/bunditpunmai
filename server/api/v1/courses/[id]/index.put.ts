import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { eq } from 'drizzle-orm'
import type { Course } from '#shared/types/entities/course'

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'Full update course',
    description: 'Replace all course fields',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              content: { type: 'string' },
              likes: { type: 'integer' },
              status: { type: 'string' },
              instructorId: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['title', 'description', 'content', 'likes', 'status', 'instructorId', 'createdAt'],
          },
        },
      },
    },
    responses: {
      200: { description: 'Course updated' },
      400: { description: 'Validation error' },
      404: { description: 'Course not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const courseId = Number(id)
  const body = await readBody(event) as Course

  // Check if course exists
  const existing = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Course not found',
    })
  }

  // Update course
  const result = await db.update(courses).set(body).where(eq(courses.id, courseId)).returning()

  return result[0]
})